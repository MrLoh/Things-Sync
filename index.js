// @flow
require('babel-polyfill');
require('dotenv').load();

import { createTodo, updateProject } from './things-api';

const sleep = async (time) => new Promise((resolve) => setTimeout(resolve, time));

(async () => {
  try {
    // const res = await updateProject('E97BB6A0-677E-43D8-9A83-2582A3DACE8D', {
    //   title: 'Test4 Synced Project',
    //   area: 'Cinuru',
    // });
    // console.log('updatet', res);

    const res = await createTodo({
      title: 'Test ToDo 1',
      listId: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
    });

    await sleep(1000);

    const res2 = await createTodo({
      title: 'Test ToDo 2',
      listId: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
    });
    console.log('created', res2);

    return;
  } catch (e) {
    throw e;
  }
})();
