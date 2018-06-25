# Sync GitHub Projects and Things Mac App

Script to Sync GitHub Projects with Things Projects.

This contains a Node script that queries the [GitHub GraphQL API](https://developer.github.com/v4/) to get the issues and then uses the [Things URL Scheme](https://support.culturedcode.com/customer/en/portal/articles/2803573) to upsert the todos using an express server to receive the [x-callback-urls](http://x-callback-url.com/examples/).

## Setup

Get a things auth token from the Things Mac app:

<kbd>Things</kbd> > <kbd>Preferences</kbd> > <kbd>General</kbd> > <kbd>Enable Things URLs</kbd> > <kbd>Manage</kbd>.

Create a `.env` file that contains the `AUTH_TOKEN` variable. You can also specift a `SERVER_PORT` variable.

To prevent the script from opening the browser all the time, register a custom URL scheme with the [LinCastor](https://onflapp.wordpress.com) app (e.g. `gh-th-sync`).that responds with the following Shell Script, replace the port if you specified a different one:

```sh
#!/bin/sh
curl -g -s http://localhost:4567$URL_VALUE
exit 0
```

Specify the custom URL scheme in the `.env` file like this: `CALLBACK_URL_SCHEME=gh-th-sync`.
