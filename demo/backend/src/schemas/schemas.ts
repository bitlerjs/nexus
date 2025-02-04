import { Type } from '@bitlerjs/nexus';

const todoUpdateSchema = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  deletedAt: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
  completedAt: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
});

const todoCreateSchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
});

const todoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  createdAt: Type.String({
    format: 'date-time',
  }),
  updatedAt: Type.String({
    format: 'date-time',
  }),
  deletedAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
  completedAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
});

export { todoSchema, todoCreateSchema, todoUpdateSchema };
