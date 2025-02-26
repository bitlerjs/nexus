import { createTask } from '@bitlerjs/nexus';

import { findDocumentsSchema, SearchResult, searchResultSchema } from '../schemas/schemas.js';

const searchTask = createTask({
  kind: 'knowledge-base.search',
  name: 'Search knowledge base',
  description: 'Search the knowledge base for documents',
  input: findDocumentsSchema,
  output: searchResultSchema,
  handler: async ({ input, container }) => {
    const { KnowledgeBaseService } = await import('../service/service.js');
    const knowledgeBaseService = container.get(KnowledgeBaseService);
    const result = await knowledgeBaseService.find(input);
    const grouped: Record<string, SearchResult['entities'][number]> = {};

    for (const row of result) {
      const key = `${row.entity.kind}:${row.entity.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          entity: {
            kind: row.entity.kind,
            id: row.entity.id,
          },
          matches: [],
        };
      }

      grouped[key].matches.push({
        id: row.id,
        content: row.content,
        distance: row.distance,
      });
    }

    return {
      entities: Object.values(grouped),
    };
  },
});

export { searchTask };
