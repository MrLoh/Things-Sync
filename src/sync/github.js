// @flow
import { flatten } from 'lodash';

import * as things from '../things-api';
import * as github from '../github-api';

import { githubTodos, githubProjects } from './db';

const getProjectFromBoard = (board) => ({
  title: board.name,
  area: 'Cinuru',
  notes: [board.body, board.url].join('\n'),
  headings: board.columns.map(({ name }) => name),
});

const getProjectFromMilestone = (milestone) => ({
  title: milestone.title,
  area: 'Cinuru',
  notes: [milestone.description, milestone.url].join('\n'),
  headings: ['Backlog', 'Planned', 'Next', 'Active', 'Done'],
  deadline: milestone.dueOn,
  completed: milestone.closed,
});

const getTodoFromIssue = (issue, projectId) => {
  const completed =
    (issue.type === 'Issue' && issue.closed) || (issue.type === 'PullRequest' && issue.merged);
  const canceled = !completed && issue.type === 'PullRequest' && issue.closed;
  const columnName = issue.column || (completed || canceled ? 'Done' : 'Backlog');
  const completionDate = completed ? issue.mergedAt || issue.closedAt : undefined;
  const splitTitle = issue.title.includes(':') ? issue.title.split(']:') : issue.title.split(']');
  const title = splitTitle.length > 1 ? splitTitle[1].trim() : splitTitle[0];
  const tags = splitTitle.length > 1 ? splitTitle[0].substring(1).split('/') : [];
  issue.labels.map((label) => tags.push(label));
  return {
    title,
    tags,
    notes: [issue.body, issue.url].join('\n\n'),
    listId: projectId,
    heading: columnName,
    canceled,
    completed,
    completionDate,
  };
};

const syncBoard = async (board) => {
  const project = getProjectFromBoard(board);
  try {
    // create or update project from board
    let projectId;
    if (await githubProjects.has(board.id)) {
      projectId = await githubProjects.get(board.id);
      await things.updateProject(projectId, project);
      console.log('updated project', projectId);
    } else {
      projectId = await things.createProject(project);
      await githubProjects.set(board.id, projectId);
      console.log('created project', projectId);
    }
  } catch (e) {
    console.log('Error creating Project', e, project);
  }
};

const syncMilestone = async (milestone) => {
  const project = getProjectFromMilestone(milestone);
  try {
    // create or update project from board
    let projectId;
    if (await githubProjects.has(milestone.id)) {
      projectId = await githubProjects.get(milestone.id);
      await things.updateProject(projectId, project);
      console.log('updated project', projectId);
    } else {
      projectId = await things.createProject(project);
      await githubProjects.set(milestone.id, projectId);
      console.log('created project', projectId);
    }
  } catch (e) {
    console.log('Error creating Project', e, project);
  }
};

const syncIssues = async (issues, projectId) => {
  const todos = issues.map((issue) => getTodoFromIssue(issue, projectId));
  const operations = await Promise.all(
    todos.map(async (todo, i) => {
      if (await githubTodos.has(issues[i].id)) {
        const todoId = await githubTodos.get(issues[i].id);
        return { operation: 'update', type: 'todo', props: todo, id: todoId };
      } else {
        return { operation: 'create', type: 'todo', props: todo };
      }
    })
  );
  try {
    const todoIds = await things.runBatchedOperations(operations);
    await Promise.all(
      todoIds.map(async (todoId, i) => await githubTodos.set(issues[i].id, todoId))
    );
    console.log('upserted', todoIds.length, 'todos');
  } catch (e) {
    console.log('Error creating Todos', e);
    return undefined;
  }
};

const syncIssue = async (issue, projectId) => {
  const todo = getTodoFromIssue(issue, projectId);
  try {
    let todoId;
    if (await githubTodos.has(issue.id)) {
      todoId = await githubTodos.get(issue.id);
      await things.updateTodo(todoId, todo);
      console.log('updated todo', todoId);
    } else {
      todoId = await things.createTodo(todo);
      await githubTodos.set(issue.id, todoId);
      console.log('created todo', todoId);
    }
  } catch (e) {
    console.log('Error creating Todo', e);
    return undefined;
  }
};

export const synchronizeGitHubBoard = async (id) => {
  const board = await github.getBoard(id);
  await syncBoard(board);
  // create or update todos from issues
  const projectId = await githubProjects.get(board.id);
  const issues = flatten(board.columns.map((column) => column.issues));
  await syncIssues(issues, projectId);
};

export const synchronizeGitHubMilestone = async (id) => {
  // create or update project from milestone
  const milestone = await github.getMilestone(id);
  await syncMilestone(milestone);
  // create or update todos from issues
  const projectId = await githubProjects.get(milestone.id);
  await syncIssues(milestone.issues, projectId);
};

export const synchronizeGitHubRepoMilestones = async (id) => {
  const milestoneIds = await github.getRepoMilestoneIds(id);
  await Promise.all(milestoneIds.map(synchronizeGitHubMilestone));
};
