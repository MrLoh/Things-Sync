// @flow
import { exec } from 'child_process';

import app from '../server';

const REQUEST_TIMEOUT = 5000;

const SUCCESS_ROUTE = '/success';
const ERROR_ROUTE = '/error';

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

let nextPid = 0;
const handlers = {};

app.get(`${SUCCESS_ROUTE}/:pid`, (req, res) => {
  const { pid } = req.params;
  res.send(`handled success/${pid} with ${req.query['x-things-ids']}`);
  handlers[pid].onSuccess(req);
});

app.get(`${ERROR_ROUTE}/:pid`, (req, res) => {
  const { pid } = req.params;
  res.send(`handled error/${pid}`);
  handlers[pid].onError(req);
});

const MIN_REQUEST_DISTANCE = 200;

let lastRequest = Date.now();
// handle things url scheme request
export const thingsUrlRequest = (operations: Operation[]): Promise<ID[]> => {
  // if MIN_REQUEST_DISTANCE hasn't passed yet, wait a little first
  if (Date.now() - lastRequest < MIN_REQUEST_DISTANCE) {
    // console.log('debouncing by', MIN_REQUEST_DISTANCE - (Date.now() - lastRequest));
    return new Promise((resolve) => {
      setTimeout(
        () => thingsUrlRequest(operations).then(resolve),
        MIN_REQUEST_DISTANCE - (Date.now() - lastRequest)
      );
    });
  }
  lastRequest = Date.now();
  // increment process id
  const pid = nextPid++;
  // execution function for actual request
  return new Promise((resolve, reject) => {
    // construct things json URL
    const callbackUrl = process.env.CALLBACK_URL_SCHEME
      ? `${process.env.CALLBACK_URL_SCHEME}://`
      : `http://localhost:${process.env.SERVER_PORT || 4567}`;
    const query = Object.entries({
      'auth-token': process.env.THINGS_AUTH_TOKEN,
      reveal: false,
      'x-success': encodeURI(`${callbackUrl}${SUCCESS_ROUTE}/${pid}`),
      'x-error': encodeURI(`${callbackUrl}${ERROR_ROUTE}/${pid}`),
      'x-cancel': encodeURI(`${callbackUrl}${ERROR_ROUTE}/${pid}`),
      data: encodeURIComponent(JSON.stringify(operations)),
    });
    const queryString = query.map((entry) => entry.join('=')).join('&');
    const url = `things://x-callback-url/json?${queryString}`;
    // timeout request after REQUEST_TIMEOUT
    const timeout = setTimeout(() => {
      reject('timeout');
    }, REQUEST_TIMEOUT);
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
    // call URL from terminal
    exec(`open -g "${url}"`);
  });
};
