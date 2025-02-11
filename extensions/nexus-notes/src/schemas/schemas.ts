import { Type } from '@bitlerjs/nexus';

const noteSchema = Type.Object({
  id: Type.String(),
  path: Type.Optional(Type.String()),
  title: Type.String(),
  distance: Type.Optional(Type.Number()),
  content: Type.String(),
  createdAt: Type.String({
    format: 'date-time',
  }),
  updatedAt: Type.String({
    format: 'date-time',
  }),
  deletedAt: Type.Optional(
    Type.Union([
      Type.String({
        format: 'date-time',
      }),
      Type.Null(),
    ]),
  ),
  references: Type.Optional(
    Type.Array(
      Type.Object({
        id: Type.String(),
        kind: Type.String(),
      }),
    ),
  ),
});

const createNoteSchema = Type.Object({
  id: Type.Optional(Type.String()),
  path: Type.Optional(Type.String()),
  title: Type.String(),
  content: Type.String(),
  deletedAt: Type.Optional(
    Type.Union([
      Type.String({
        format: 'date-time',
      }),
      Type.Null(),
    ]),
  ),
});

const updateNoteSchema = Type.Object({
  id: Type.String(),
  path: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  title: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  deletedAt: Type.Optional(
    Type.Union([
      Type.String({
        format: 'date-time',
      }),
      Type.Null(),
    ]),
  ),
});

const findNotesSchema = Type.Object({
  ids: Type.Optional(Type.Array(Type.String())),
  paths: Type.Optional(Type.Array(Type.String())),
  semanticText: Type.Optional(Type.String()),
  offset: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
  updatedAt: Type.Optional(
    Type.Object({
      gte: Type.Optional(Type.String({ format: 'date-time' })),
      lte: Type.Optional(Type.String({ format: 'date-time' })),
    }),
  ),
  createdAt: Type.Optional(
    Type.Object({
      gte: Type.Optional(Type.String({ format: 'date-time' })),
      lte: Type.Optional(Type.String({ format: 'date-time' })),
    }),
  ),
  deletedAt: Type.Optional(
    Type.Object({
      gte: Type.Optional(Type.String({ format: 'date-time' })),
      lte: Type.Optional(Type.String({ format: 'date-time' })),
      nill: Type.Optional(Type.Boolean()),
    }),
  ),
});

export { noteSchema, updateNoteSchema, createNoteSchema, findNotesSchema };
