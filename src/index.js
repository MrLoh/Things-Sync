// @flow
import 'babel-polyfill';
import dotenv from 'dotenv';

import { exec } from 'child_process';

import { createTodo } from './things-api';
import app, { startServer, shutdownServer } from './server';

dotenv.load();

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
  res.send('test passed');
  createRandomTodos();
});

app.get('/exit', (req, res) => {
  // eslint-disable-next-line no-console
  console.log('shutting down server');
  res.send('shutting down server');
  shutdownServer();
});

startServer();
