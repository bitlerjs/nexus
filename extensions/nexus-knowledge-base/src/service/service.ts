import { nanoid } from 'nanoid';
import { Container, EntityProvider, TasksService } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';

import { dbConfig, DocumentRow, EXTRACTOR_MODEL } from '../database/database.js';
import { FindDocuments, mapDocumentRow } from '../schemas/schemas.js';
import { searchTask } from '../tasks/tasks.search.js';

type AddDocumentOptions = {
  entity: EntityProvider<any, any, any, any>;
  id: string;
  documents: string[];
};

class KnowledgeBaseService {
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
    const tasksService = container.get(TasksService);
    tasksService.register([searchTask]);
  }

  public add = async (options: AddDocumentOptions) => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);

    await db.transaction(async (trx) => {
      await trx<DocumentRow>('documents').delete().where({
        entityKind: options.entity.kind,
        entityId: options.id,
      });
      const featureExtractorService = this.#container.get(FeatureExtractor);
      const vectors = await featureExtractorService.extract({
        input: options.documents,
        model: EXTRACTOR_MODEL,
      });
      await trx<DocumentRow>('documents').insert(
        options.documents.map((document, i) => ({
          id: nanoid(),
          entityKind: options.entity.kind,
          entityId: options.id,
          embedding: vectors[i].toSql(),
          context: document,
        })),
      );
    });
  };

  public find = async (options: FindDocuments) => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);

    let query = db<DocumentRow & { distance?: number }>('documents');
    if (options.semanticText) {
      const featureExtractor = this.#container.get(FeatureExtractor);
      const [vector] = await featureExtractor.extract({
        model: EXTRACTOR_MODEL,
        input: [options.semanticText],
      });
      query = query.select(['documents.*', db.raw(`embedding <-> '${vector.toSql()}' as distance`)]);
      query = query.orderByRaw(`embedding <-> '${vector.toSql()}'`);
    }
    if (options.ids) {
      query = query.whereIn('id', options.ids);
    }
    if (options.kinds) {
      query = query.whereIn('entityKind', options.kinds);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    return rows.map(mapDocumentRow);
  };
}

export { KnowledgeBaseService };
