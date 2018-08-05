// @flow
import 'sqlite3';
import knex from 'knex';

const db = knex({ client: 'sqlite3', connection: { filename: process.env.THINGS_SQLITE_PATH } });

const [OPEN, CANCELLED, COMPLETED] = [0, 1, 2];

const areas = db('TMArea');

const tasks = db('TMTask')
  .where({ trashed: 0, type: 0 })
  .orderBy('startDate', 'todayIndex');

export const getTodaysTodos = async () => {
  const [{ id: CinuruAreadId }] = await areas.select({ id: 'uuid' }).where({ title: 'Cinuru' });

  return await tasks
    .where({ start: 1, status: OPEN })
    .whereNotNull('startDate')
    .where({ area: CinuruAreadId })
    .select('title');
};
