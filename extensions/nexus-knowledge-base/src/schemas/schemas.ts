import { Static, Type } from '@bitlerjs/nexus';

import { DocumentRow } from '../database/database.js';

const documentSchema = Type.Object({
  id: Type.String(),
  entity: Type.Object({
    kind: Type.String(),
    id: Type.String(),
  }),
  content: Type.String(),
  distance: Type.Optional(Type.Number()),
});

type Document = Static<typeof documentSchema>;

const mapDocumentRow = (row: DocumentRow & { distance?: number }) => ({
  id: row.id,
  entity: {
    kind: row.entityKind,
    id: row.entityId,
  },
  content: row.context,
  distance: row.distance,
});

const findDocumentsSchema = Type.Object({
  ids: Type.Optional(Type.Array(Type.String())),
  kinds: Type.Optional(Type.Array(Type.String())),
  semanticText: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Number()),
  offset: Type.Optional(Type.Number()),
});

const searchResultSchema = Type.Object({
  entities: Type.Array(
    Type.Object({
      entity: Type.Object({
        kind: Type.String(),
        id: Type.String(),
      }),
      matches: Type.Array(
        Type.Object({
          id: Type.String(),
          content: Type.String(),
          distance: Type.Optional(Type.Number()),
        }),
      ),
    }),
  ),
});

type SearchResult = Static<typeof searchResultSchema>;

type FindDocuments = Static<typeof findDocumentsSchema>;

export {
  documentSchema,
  type Document,
  mapDocumentRow,
  FindDocuments,
  findDocumentsSchema,
  searchResultSchema,
  type SearchResult,
};
