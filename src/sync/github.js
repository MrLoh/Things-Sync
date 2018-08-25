// @flow
import { flatten } from 'lodash';
import * as things from '../things-api';
import * as github from '../github-api';

const getTodoFromIssue = (issue, { projectId, columnName }) => {
  const completed =
    (issue.type === 'Issue' && issue.closed) || (issue.type === 'PullRequest' && issue.merged);
  const canceled = !completed && issue.type === 'PullRequest' && issue.closed;
  const completionDate = completed ? issue.mergedAt || issue.closedAt : undefined;
  const splitTitle = issue.title.includes(':') ? issue.title.split(']:') : issue.title.split(']');
  const title = splitTitle.length > 1 ? splitTitle[1].trim() : splitTitle[0];
  const tags = splitTitle.length > 1 ? splitTitle[0].substring(1).split('/') : [];
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

export const synchronizeGitHubProject = async (id) => {
  const project = await github.getProject(id);

  if (project) {
    const projectId = await things.createProject({
      title: project.name,
      area: 'Cinuru',
      notes: [project.body, project.url].join('\n'),
      headings: project.columns.map(({ name }) => name),
    });

    console.log('created', projectId);

    const todoIds = flatten(
      await Promise.all(
        project.columns.map(async (column) => {
          const todos = column.issues.map((issue) =>
            getTodoFromIssue(issue, { projectId, columnName: column.name })
          );
          return await Promise.all(
            todos.map(async (todo) => {
              try {
                const todoId = await things.createTodo(todo);
                return todoId;
              } catch (e) {
                console.log('Error creating Todo', e, todo);
                return undefined;
              }
            })
          );
        })
      )
    );

    console.log('created', todoIds);
    return true;
  }
};
