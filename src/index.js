// @flow
require('babel-polyfill');
require('dotenv').load();

import { exec } from 'child_process';

import { createTodo, updateProject } from './things-api';
import app, { startServer, shutdownServer } from './server';

exec('open ./menu-bar-app/build/things-sync.app');

const createRandomTodos = async () => {
  const res = await createTodo({
    title: 'Test ToDo 1',
    listId: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
  });
  console.log('created', res);

  const res2 = await createTodo({
    title: 'Test ToDo 2',
    listId: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
  });
  console.log('created', res2);
};

app.get('/test', (req, res) => {
  console.log('server test passed');
  res.send('test passed');
  createRandomTodos();
});

app.get('/exit', (req, res) => {
  console.log('shutting down server');
  res.send('shutting down server');
  shutdownServer();
});

startServer();
