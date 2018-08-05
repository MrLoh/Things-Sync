# Sync Things Mac App with GitHub and Jira Projects

This contains a Node script that queries the [GitHub GraphQL API](https://developer.github.com/v4/) to get the issues and then uses the [Things URL Scheme](https://support.culturedcode.com/customer/en/portal/articles/2803573) to upsert the todos using an express server to receive the [x-callback-urls](http://x-callback-url.com/examples/).

This also provides a little menu bar App which handles the `x-callback-urls` and allows calling the sync scripts.

## Setup

Get a things auth token from the Things Mac app:

<kbd>Things</kbd> > <kbd>Preferences</kbd> > <kbd>General</kbd> > <kbd>Enable Things URLs</kbd> > <kbd>Manage</kbd>.

Create a `.env` file that contains the `AUTH_TOKEN` variable. You can also specift a `SERVER_PORT` variable.

To prevent opening the browser with the callback-urls. This repo includes a little menu bar app that will handle the custom `things-sync://` URL scheme for callbacks and forward them to the node-server running on localhost. To use this, first specify the custom URL scheme in the `.env` file like this: `CALLBACK_URL_SCHEME=things-sync`. Then run `yarn build-menu-bar-app` the menu bar app will then be automatically started when running `yarn start`.
