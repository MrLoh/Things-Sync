// @flow
import fs from 'fs';
const { writeFile, readFile, access } = fs.promises;
const { F_OK, W_OK, R_OK } = fs.constants;

const DB_PATH = './db';

class PersistedMap<T> {
  filePath: string;
  map: ?{ [key: string]: T };

  constructor(fileName: string) {
    this.filePath = `${DB_PATH}/${fileName}.json`;
    this._getMap();
  }

  async _getMap() {
    if (!this.map) {
      try {
        await access(this.filePath, F_OK | W_OK | R_OK);
        this.map = JSON.parse(await readFile(this.filePath));
      } catch (e) {
        console.log('cannot read map', e);
        this.map = {};
        this._saveMap();
      }
    }
    return this.map;
  }

  async _saveMap() {
    const map = await this._getMap();
    await writeFile(this.filePath, JSON.stringify(map, null, 2));
  }

  async get(key: string): Promise<T> {
    const map = await this._getMap();
    return map[key];
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return typeof value !== 'undefined';
  }

  async set(key: string, value: T): Promise<void> {
    const map = await this._getMap();
    map[key] = value;
    try {
      await this._saveMap();
    } catch (e) {
      delete map[key];
      throw e;
    }
  }

  async delete(key: string): Promise<boolean> {
    const map = await this._getMap();
    const value = map[key];
    if (typeof value === 'undefined') {
      return false;
    } else {
      delete map[key];
      try {
        await this._saveMap();
        return true;
      } catch (e) {
        map[key] = value;
        throw e;
      }
    }
  }
}

export const githubTodos = new PersistedMap('githubTodos');
export const githubProjects = new PersistedMap('githubProjects');
