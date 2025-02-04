import { join, resolve } from 'path';
import { mkdir } from 'fs/promises';

import knex, { Knex } from 'knex';
import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import ClientPgLite from 'knex-pglite';
import { Container } from '@bitlerjs/nexus';

type MigrationOptions = {
  container: Container;
};
type DatabaseMigration = {
  name: string;
  up: (knex: Knex, options: MigrationOptions) => Promise<void>;
  down: (knex: Knex, options: MigrationOptions) => Promise<void>;
};

type DatabaseOptions = {
  name: string;
  migrations: DatabaseMigration[];
};

const createDatabase = (options: DatabaseOptions) => options;
const createMigration = (options: DatabaseMigration) => options;

class Databases {
  #container: Container;
  #dbs = new Map<string, Promise<Knex>>();

  constructor(container: Container) {
    this.#container = container;
  }

  #createDB = async (name: string) => {
    const schemaSafeName = name.replace(/[^a-zA-Z0-9]/g, '_');
    if (process.env.DB_TYPE === 'pg') {
      const db = knex({
        client: 'pg',
        dialect: 'postgres',
        searchPath: [schemaSafeName],
        connection: {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
        },
      });
      await db.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaSafeName}`);
      return db;
    } else {
      const dataLocation = resolve(process.env.DATA_DIR || './data');
      const location = join(dataLocation, 'databases', name);
      await mkdir(location, { recursive: true });

      const pglite = new PGlite({
        dataDir: location,
        extensions: {
          vector,
        },
      });
      const db = knex({
        client: ClientPgLite,
        dialect: 'postgres',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection: { pglite } as any,
      });
      await db.raw(`CREATE EXTENSION IF NOT EXISTS vector`);
      return db;
    }
  };

  #setup = async (options: DatabaseOptions) => {
    const migrationSource: Knex.MigrationSource<DatabaseMigration> = {
      getMigrations: async () => options.migrations,
      getMigrationName: (migration) => migration.name,
      getMigration: async (migration) => ({
        name: migration.name,
        up: async (knex: Knex) => {
          await migration.up(knex, { container: this.#container });
        },
        down: async (knex: Knex) => {
          await migration.down(knex, { container: this.#container });
        },
      }),
    };

    const db = await this.#createDB(options.name);
    await db.migrate.latest({
      migrationSource,
    });

    return db;
  };

  public list = () => {
    return Object.fromEntries(Array.from(this.#dbs.entries()).map(([name, db]) => [name, db]));
  };

  public destroy = async () => {
    await Promise.all(
      Array.from(this.#dbs.values()).map(async (db) => {
        const knex = await db;
        await knex.destroy();
      }),
    );
  };

  public get = async (options: DatabaseOptions) => {
    if (!this.#dbs.has(options.name)) {
      this.#dbs.set(options.name, this.#setup(options));
    }

    const dbPromise = this.#dbs.get(options.name);
    if (!dbPromise) {
      throw new Error(`Database ${options.name} not found`);
    }

    return dbPromise;
  };
}

export { Databases, type DatabaseMigration, type Knex, type DatabaseOptions, createDatabase, createMigration };
