import { Container, Static } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';
import { KnowledgeBaseService } from '@bitlerjs/nexus-knowledge-base';

import { dbConfig, EXTRACTOR_MODEL, NoteRow } from '../database/database.js';
import { createNoteSchema, findNotesSchema, noteSchema, updateNoteSchema } from '../schemas/schemas.js';

type NoteWithDistances = Static<typeof noteSchema> & {
  distance?: number;
};

class NotesService {
  #container: Container;
  #db?: ReturnType<Databases['get']>;

  constructor(container: Container) {
    this.#container = container;
  }

  #setup = async () => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);
    return db;
  };

  #getDb = async () => {
    if (!this.#db) {
      this.#db = this.#setup();
    }
    return await this.#db;
  };

  public create = async (note: Static<typeof createNoteSchema>): Promise<string> => {
    const id = note.id || Math.random().toString(36).substring(7); // TODO: fix
    const featureExtractor = this.#container.get(FeatureExtractor);
    const [vector] = await featureExtractor.extract({
      model: EXTRACTOR_MODEL,
      input: [[note.title, note.content].join(' ')],
    });
    const db = await this.#getDb();

    await db<NoteRow>('notes').insert({
      id,
      title: note.title,
      content: note.content,
      path: note.path,
      embedding: vector.toSql(),
      deletedAt: note.deletedAt ? new Date(note.deletedAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const knowledgeBaseService = this.#container.get(KnowledgeBaseService);
    const { noteEntity } = await import('../entities/entities.note.js');
    await knowledgeBaseService.add({
      entity: noteEntity,
      id,
      documents: [note.title, note.content],
    });

    return id;
  };

  public update = async (note: Static<typeof updateNoteSchema>): Promise<void> => {
    const db = await this.#getDb();
    const featureExtractor = this.#container.get(FeatureExtractor);
    const [vector] = await featureExtractor.extract({
      model: EXTRACTOR_MODEL,
      input: [[note.title, note.content].join(' ')],
    });
    await db<NoteRow>('notes')
      .where('id', note.id)
      .update({
        title: note.title,
        content: note.content,
        embedding: vector.toSql(),
        updatedAt: new Date(),
        deletedAt: typeof note.deletedAt === 'string' ? new Date(note.deletedAt) : note.deletedAt,
      });
  };

  public delete = async (ids: string[]): Promise<void> => {
    const db = await this.#getDb();
    await db<NoteRow>('notes').whereIn('id', ids).update({
      deletedAt: new Date(),
    });
  };

  public find = async (options: Static<typeof findNotesSchema>): Promise<NoteWithDistances[]> => {
    const db = await this.#getDb();
    let query = db<NoteRow & { distance?: number }>('notes');

    if (options.semanticText) {
      const featureExtractor = this.#container.get(FeatureExtractor);
      const [vector] = await featureExtractor.extract({
        model: EXTRACTOR_MODEL,
        input: [options.semanticText],
      });
      query = query.select(['notes.*', db.raw(`embedding <-> '${vector.toSql()}' as distance`)]);
      query = query.orderByRaw(`embedding <-> '${vector.toSql()}'`);
    }
    if (options.ids) {
      query = query.whereIn('id', options.ids);
    }
    if (options.paths) {
      query = query.whereIn('path', options.paths);
    }
    if (options.updatedAt) {
      if (options.updatedAt.gte) {
        query = query.where('updatedAt', '>=', options.updatedAt.gte);
      }
      if (options.updatedAt.lte) {
        query = query.where('updatedAt', '<=', options.updatedAt.lte);
      }
    }
    if (options.createdAt) {
      if (options.createdAt.gte) {
        query = query.where('createdAt', '>=', options.createdAt.gte);
      }
      if (options.createdAt.lte) {
        query = query.where('createdAt', '<=', options.createdAt.lte);
      }
    }
    if (options.deletedAt) {
      if (options.deletedAt.gte) {
        query = query.where('deletedAt', '>=', options.deletedAt.gte);
      }
      if (options.deletedAt.lte) {
        query = query.where('deletedAt', '<=', options.deletedAt.lte);
      }
      if (options.deletedAt.nill) {
        query = query.whereNull('deletedAt');
      }
      if (options.deletedAt.nill === false) {
        query = query.whereNotNull('deletedAt');
      }
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }

    const notes = await query;

    return notes.map((note) => ({
      ...note,
      distance: note.distance,
      path: note.path || undefined,
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString(),
      deletedAt: note.deletedAt ? new Date(note.deletedAt).toISOString() : undefined,
    }));
  };
}

export { NotesService };
