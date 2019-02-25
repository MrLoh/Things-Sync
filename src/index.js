// @flow
import 'babel-polyfill';
import dotenv from 'dotenv';
import { exec } from 'child_process';

import app, { startServer, shutdownServer } from './server';

import {
  synchronizeGitHubBoard,
  synchronizeGitHubRepoMilestones,
  synchronizeGitHubMilestone,
} from './sync';

dotenv.load();

exec('open ./menu-bar-app/build/things-sync.app');

app.get('/test', async (req, res) => {
  res.send('test passed');
});

app.get('/sync-github-projects', async (req, res) => {
  // await Promise.all(process.env.GITHUB_MILESTONE_IDS.split(',').map(synchronizeGitHubMilestone));
  await Promise.all(process.env.GITHUB_PROJECT_IDS.split(',').map(synchronizeGitHubBoard));
  await Promise.all(process.env.GITHUB_REPO_IDS.split(',').map(synchronizeGitHubRepoMilestones));
  res.send('github projects synced');
});

app.get('/exit', (req, res) => {
  // eslint-disable-next-line no-console
  console.log('shutting down server');
  res.send('shutting down server');
  shutdownServer();
});

startServer();
