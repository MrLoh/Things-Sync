// @flow
import * as things from '../things-api';
import * as github from '../github-api';

import { githubTodos, githubProjects } from './db';

const getProjectFromBoard = async (board) => ({
  title: board.name,
  area: 'Cinuru',
  notes: [board.body, board.url].join('\n'),
  headings: board.columns.map(({ name }) => name),
});

const getTodoFromIssue = async (issue) => {
  const projectId = await githubProjects.get(issue.project.id);
  const columnName = issue.column.name;
  const completed =
    (issue.type === 'Issue' && issue.closed) || (issue.type === 'PullRequest' && issue.merged);
  const canceled = !completed && issue.type === 'PullRequest' && issue.closed;
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
  const project = await getProjectFromBoard(board);
  try {
    // create or update project from board
    let projectId;
    if (await githubProjects.has(board.id)) {
      projectId = await githubProjects.get(board.id);
      await things.updateProject(projectId, project);
      console.log('updated', projectId);
    } else {
      projectId = await things.createProject(project);
      await githubProjects.set(board.id, projectId);
      console.log('created', projectId);
    }
  } catch (e) {
    console.log('Error creating Project', e, project);
  }
};

const syncIssue = async (issue) => {
  const todo = await getTodoFromIssue(issue);
  try {
    let todoId;
    if (await githubTodos.has(issue.id)) {
      todoId = await githubTodos.get(issue.id);
      await things.updateTodo(todoId, todo);
      console.log('updated', todoId);
    } else {
      todoId = await things.createTodo(todo);
      await githubTodos.set(issue.id, todoId);
      console.log('created', todoId);
    }
  } catch (e) {
    console.log('Error creating Todo', e, todo);
    return undefined;
  }
};

export const synchronizeGitHubBoard = async (id) => {
  const board = await github.getBoard(id);
  syncBoard(board);
  // create or update todos from issues
  await Promise.all(
    board.columns.map(
      async (column) =>
        await Promise.all(
          column.issues.map(async (issue) => {
            issue.project = { id: board.id };
            issue.column = { id: column.id, name: column.name };
            await syncIssue(issue);
          })
        )
    )
  );
};
