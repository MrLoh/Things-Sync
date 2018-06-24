// @flow
require('babel-polyfill');
require('dotenv').load();

import { createTodo, updateProject, terminateCallbackServer } from './things-api';

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
    console.log('created', res);

    const res2 = await createTodo({
      title: 'Test ToDo 2',
      listId: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
    });
    console.log('created', res2);

    terminateCallbackServer();
    return;
  } catch (e) {
    throw e;
  }
})();
