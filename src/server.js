// @flow
import express from 'express';

// setup express server that handlers callback
const app = express();

const port = process.env.SERVER_PORT || 4567;
let server;
export const startServer = () => {
  // eslint-disable-next-line no-console
  server = app.listen(port, () => console.log(`server started on http://localhost:${port}`));
};

export const shutdownServer = () => server.close();

export default app;
