// @flow
import githubApiRequest from './graphql-request';

type IssueState = 'OPEN' | 'CLOSED' | 'MERGED';
type ID = string;

type GitHubIssue = {
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
  column?: string,
  boardName?: string,
};

type GitHubProject = {
  id: ID,
  name: string,
  columns: {
    name: string,
    issues: GitHubIssue[],
  }[],
};

type GitHubMilestone = {
  id: ID,
  title: string,
  description: string,
  url: string,
  closed: boolean,
  dueOn?: Date,
  closedAt?: Date,
  issues: GitHubIssue[],
};

const IssueDetailFragments = /* GraphQL */ `
  fragment AssignedToViewer on Assignable {
    assignedToViewer: assignees(first: $nAssignees) @_(get: "nodes[0].isViewer") {
      nodes @_(filter: "isViewer") {
        isViewer
      }
    }
  }
  fragment Labels on Labelable {
    labels(first: $nLabels) @_(get: nodes) {
      nodes @_(map: "name") {
        name
      }
    }
  }
  fragment IssueDetails on Issue {
    type: __typename
    id
    title
    url
    body
    createdAt
    state
    closed
    closedAt
    ...AssignedToViewer
    ...Labels
    column: projectCards(first: 1) @_(get: "nodes[0].column.name") {
      nodes {
        column {
          name
        }
      }
    }
    boardName: projectCards(first: 1) @_(get: "nodes[0].column.project.name") {
      nodes {
        column {
          project {
            name
          }
        }
      }
    }
  }
  fragment PullRequestDetails on PullRequest {
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
    ...AssignedToViewer
    ...Labels
    column: projectCards(first: 1) @_(get: "nodes[0].column.name") {
      nodes {
        column {
          name
        }
      }
    }
    boardName: projectCards(first: 1) @_(get: "nodes[0].column.project.name") {
      nodes {
        column {
          project {
            name
          }
        }
      }
    }
  }
`;

const formatIssueResponse = (issue) => ({
  ...issue,
  createdAt: new Date(issue.createdAt),
  closed: Boolean(issue.closed),
  closedAt: issue.closedAt && new Date(issue.closedAt),
  merged: Boolean(issue.merged),
  mergedAt: issue.mergedAt && new Date(issue.mergedAt),
});

export const getIssue = async (id: ID): Promise<GitHubIssue> => {
  const issue = await githubApiRequest(
    /* GraphQL */ `
      ${IssueDetailFragments}
      query GetIssue($issueId: ID!, $nAssignees: Int, $nLabels: Int) @_(get: "node") {
        node(id: $issueId) {
          ...IssueDetails
          ...PullRequestDetails
        }
      }
    `,
    {
      issueId: id,
      nAssignees: 5,
      nLabels: 10,
    }
  );
  return formatIssueResponse(issue);
};

export const getBoard = async (id: ID): Promise<GitHubProject> => {
  const project = await githubApiRequest(
    /* GraphQL */ `
      ${IssueDetailFragments}
      query GetBoard(
        $projectId: ID!
        $nColumns: Int
        $nIssues: Int
        $nAssignees: Int
        $nLabels: Int
      ) @_(get: "node") {
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
                  totalCount
                  nodes @_(map: "content", filter: "assignedToViewer") {
                    content {
                      ...IssueDetails
                      ...PullRequestDetails
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
      nLabels: 10,
    }
  );
  return {
    ...project,
    columns: project.columns.map((column) => ({
      ...column,
      issues: column.issues.map(formatIssueResponse),
    })),
  };
};

export const getMilestone = async (id: ID): Promise<GitHubMilestone> => {
  const milestone = await githubApiRequest(
    /* GraphQL */ `
      ${IssueDetailFragments}
      query GetMilestone($milestoneId: ID!, $nIssues: Int, $nAssignees: Int, $nLabels: Int)
        @_(get: "node") {
        node(id: $milestoneId) {
          ... on Milestone {
            id
            title
            description
            url
            closed
            dueOn
            closedAt
            pullRequests(first: $nIssues) @_(get: "nodes") {
              nodes @_(filter: "assignedToViewer") {
                ...PullRequestDetails
              }
            }
            issues(first: $nIssues) @_(get: "nodes") {
              nodes @_(filter: "assignedToViewer") {
                ...IssueDetails
              }
            }
          }
        }
      }
    `,
    {
      milestoneId: id,
      nIssues: 100,
      nAssignees: 5,
      nLabels: 10,
    }
  );
  return {
    ...milestone,
    issues: [...(milestone.issues || []), ...(milestone.pullRequests || [])],
    pullRequests: undefined,
    dueOn: milestone.dueOn && new Date(milestone.dueOn),
    closedAt: milestone.closedAt && new Date(milestone.closedAt),
  };
};

export const getRepoMilestoneIds = async (id: ID): Promise<GitHubMilestone[]> => {
  const milestoneIds = await githubApiRequest(
    /* GraphQL */ `
      query GetRepoMilestones($repoId: ID!) @_(get: "node") {
        node(id: $repoId) @_(get: "milestones") {
          ... on Repository {
            id
            milestones(first: 100, states: [OPEN]) @_(get: "nodes") {
              nodes @_(map: "id") {
                id
              }
            }
          }
        }
      }
    `,
    {
      repoId: id,
    }
  );
  return milestoneIds;
};
