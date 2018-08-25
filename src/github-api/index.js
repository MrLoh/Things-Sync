// @flow
import githubApiRequest from './graphql-request';

type IssueState = 'OPEN' | 'CLOSED' | 'MERGED';
type ID = string;

type GitHubProject = {
  id: ID,
  name: string,
  columns: {
    name: string,
    issues: {
      type: 'Issue' | 'PullRequest',
      id: ID,
      title: string,
      url: string,
      body: string,
      createdAt: Date,
      state: IssueState,
      closed: boolean,
      closedAt?: Date,
      merged: boolean,
      mergedAt?: Date,
    }[],
  }[],
};

export const getProject = async (id: ID): Promise<GitHubProject> => {
  const project = await githubApiRequest(
    /* GraphQL */ `
      fragment AssignedToViewerFragment on Assignable {
        assignedToViewer: assignees(first: $nAssignees) @_(get: "nodes[0].isViewer") {
          nodes @_(filter: "isViewer") {
            isViewer
          }
        }
      }

      query ProjectIssues($projectId: ID!, $nColumns: Int, $nIssues: Int, $nAssignees: Int)
        @_(get: "node") {
        node(id: $projectId) {
          ... on Project {
            id
            name
            body
            url
            columns(first: $nColumns) @_(get: "nodes") {
              nodes {
                name
                issues: cards(first: $nIssues) @_(get: "nodes") {
                  nodes @_(map: "content", filter: "assignedToViewer") {
                    content {
                      ... on Issue {
                        type: __typename
                        id
                        title
                        url
                        body
                        createdAt
                        state
                        closed
                        closedAt
                        ...AssignedToViewerFragment
                      }
                      ... on PullRequest {
                        type: __typename
                        id
                        title
                        url
                        body
                        createdAt
                        state
                        closed
                        closedAt
                        merged
                        mergedAt
                        ...AssignedToViewerFragment
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      projectId: id,
      nColumns: 10,
      nIssues: 50,
      nAssignees: 5,
    }
  );
  const columns = project.columns.map((column) => ({
    ...column,
    issues: column.issues.map((issue) => ({
      ...issue,
      createdAt: new Date(issue.createdAt),
      closed: Boolean(issue.closed),
      closedAt: issue.closedAt && new Date(issue.closedAt),
      merged: Boolean(issue.merged),
      mergedAt: issue.mergedAt && new Date(issue.mergedAt),
    })),
  }));
  return { ...project, columns };
};
