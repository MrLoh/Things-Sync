// @flow
import express from 'express';
import { exec } from 'child_process';

const REQUEST_TIMEOUT = 5000;
const MIN_REQUEST_DISTANCE = 2000;

export type ID = string;

type Operation =
  | {
      operation: 'create',
      type: 'to-do',
      attributes: Object,
    }
  | {
      operation: 'update',
      id: ID,
      type: 'to-do',
      attributes: Object,
    }
  | {
      operation: 'create',
      type: 'project',
      attributes: Object,
    }
  | {
      operation: 'update',
      id: ID,
      type: 'project',
      attributes: Object,
    };

let pid = 0;
const handlers = {};

// setup express server that handlers callback
const app = express();

app.get('/test', (req, res) => {
  console.log('testing');
  res.send('tested');
});

app.get('/success/:pid', (req, res) => {
  const { pid } = req.params;
  res.send(`handled success/${pid} with ${req.query['x-things-ids']}`);
  handlers[pid].onSuccess(req);
});

app.get('/error/:pid', (req, res) => {
  const { pid } = req.params;
  res.send(`handled error/${pid}`);
  handlers[pid].onError(req);
});

// start express server
const port = process.env.SERVER_PORT || 4567;
const server = app.listen(port, () => console.log(`server started on http://localhost:${port}`));

export const terminateCallbackServer = () => server.close();

// handle things url scheme request
let lastRequest = 0;
export const thingsUrlRequest = (operations: Operation[]): Promise<ID[]> => {
  // increment process id
  pid++;
  // execution function for actual request
  const execute = () =>
    new Promise((resolve, reject) => {
      // timeout request after REQUEST_TIMEOUT
      const timeout = setTimeout(() => reject('timeout'), REQUEST_TIMEOUT);
      // register handler for this request
      handlers[pid] = {
        onSuccess: (req) => {
          clearTimeout(timeout);
          resolve(JSON.parse(req.query['x-things-ids']));
        },
        onError: (req) => {
          clearTimeout(timeout);
          reject(req);
        },
      };
      // construct things json URL
      const callbackUrl = process.env.CALLBACK_URL_SCHEME
        ? `${process.env.CALLBACK_URL_SCHEME}://`
        : `http://localhost:${port}`;
      const query = Object.entries({
        'auth-token': process.env.AUTH_TOKEN,
        reveal: false,
        'x-success': encodeURI(`${callbackUrl}/success/${pid}`),
        'x-error': encodeURI(`${callbackUrl}$/error/${pid}`),
        'x-cancel': encodeURI(`${callbackUrl}$/error/${pid}`),
        data: encodeURIComponent(JSON.stringify(operations)),
      });
      const queryString = query.map((entry) => entry.join('=')).join('&');
      const url = `things://x-callback-url/json?${queryString}`;
      // call URL from terminal
      exec(`open -g '${url}'`);
    });
  // ensure MIN_REQUEST_DISTANCE between firing two requests to prevent callback failures
  return new Promise(async (resolve, reject) => {
    if (Date.now() - lastRequest > MIN_REQUEST_DISTANCE) {
      lastRequest = Date.now();
      execute()
        .then(resolve)
        .catch(reject);
    } else {
      const waitBeforeNextRequest = lastRequest + MIN_REQUEST_DISTANCE - Date.now();
      lastRequest = Date.now();
      setTimeout(
        () =>
          execute()
            .then(resolve)
            .catch(reject),
        waitBeforeNextRequest
      );
    }
  });
};
