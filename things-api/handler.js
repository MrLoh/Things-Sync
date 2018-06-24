// @flow
import express from 'express';
import { exec } from 'child_process';

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

export const thingsUrlRequest = (operations: Operation[]): Promise<ID[]> => {
  return new Promise((resolve, reject) => {
    // setup express server that handlers callback
    let server;
    const timeout = setTimeout(() => {
      server.close();
      reject('timeout');
    }, 5000);
    const app = express();
    const createRoute = (route, handler) => {
      app.get(route, (req, res) => {
        res.send('handled');
        server.close();
        clearTimeout(timeout);
        handler(req);
      });
    };
    const [successRoute, errorRoute] = ['/success', '/error'];
    createRoute(successRoute, (req) => resolve(JSON.parse(req.query['x-things-ids'])));
    createRoute(errorRoute, (req) => reject(req));
    const port = process.env.SERVER_PORT || 4567;
    const callbackUrl = `${process.env.CALLBACK_URL_SCHEME}://` || `http://localhost:${port}`;
    server = app.listen(port, () => {
      // construct things json URL
      const query = Object.entries({
        'auth-token': process.env.AUTH_TOKEN,
        reveal: false,
        'x-success': encodeURI(`${callbackUrl}${successRoute}`),
        'x-error': encodeURI(`${callbackUrl}${errorRoute}`),
        'x-cancel': encodeURI(`${callbackUrl}${errorRoute}`),
        data: encodeURIComponent(JSON.stringify(operations)),
      });
      const queryString = query.map((entry) => entry.join('=')).join('&');
      const url = `things://x-callback-url/json?${queryString}`;
      // call URL
      exec(`open -g '${url}'`);
    });
  });
};
