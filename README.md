# Sync Things Mac App with GitHub and Jira Projects

This contains a Node script that queries the [GitHub GraphQL API](https://developer.github.com/v4/) to get the issues and then uses the [Things URL Scheme](https://support.culturedcode.com/customer/en/portal/articles/2803573) to upsert the todos using an express server to receive the [x-callback-urls](http://x-callback-url.com/examples/).

This also provides a little menu bar App which handles the `x-callback-urls` and allows calling the sync scripts.

## Setup

### Things

Get a things auth token from the Things Mac app:

<kbd>Things</kbd> > <kbd>Preferences</kbd> > <kbd>General</kbd> > <kbd>Enable Things URLs</kbd> > <kbd>Manage</kbd>.

Create a `.env` file that contains the `THINGS_AUTH_TOKEN` variable. You can also specift a `SERVER_PORT` variable.

To prevent opening the browser with the callback-urls. This repo includes a little menu bar app that will handle the custom `things-sync://` URL scheme for callbacks and forward them to the node-server running on localhost. To use this, first specify the custom URL scheme in the `.env` file like this: `CALLBACK_URL_SCHEME=things-sync`. Then run `yarn build-menu-bar-app` the menu bar app will then be automatically started when running `yarn start`.

### GitHub

Follow the [instructions](https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql) to generate an OAuth Token for the GitHub GraphQL API and set it in the `.env` file as `GITHUB_API_TOKEN` also specify the `GITHUB_API_ENDPOINT` as `https://api.github.com/graphql`.

Specify the IDs of the GitHub Projects you want to synch in the `.env` as a comma separated string `GITHUB_PROJECT_IDS`. You can find the node IDs by using the [GitHub API Explorer](https://developer.github.com/v4/explorer/) and sending a query like this:

```graphql
{
  repository(owner: "__", name: "__") {
    id
    name
    milestones(first: 100, states: [OPEN]) {
      nodes {
        id
        title
      }
    }
    projects(first: 10, states: [OPEN]) {
      nodes {
        id
        name
      }
    }
  }
}
```
