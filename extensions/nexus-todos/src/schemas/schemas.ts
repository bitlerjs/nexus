import { Static, Type } from '@bitlerjs/nexus';

const timeQuery = Type.Object({
  is: Type.Boolean(),
  gt: Type.Optional(Type.String({ format: 'date-time' })),
  lt: Type.Optional(Type.String({ format: 'date-time' })),
  lte: Type.Optional(Type.String({ format: 'date-time' })),
  gte: Type.Optional(Type.String({ format: 'date-time' })),
});

const todoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  parent: Type.Optional(Type.String()),
  distance: Type.Optional(Type.Number()),
  createdAt: Type.String({
    format: 'date-time',
  }),
  updatedAt: Type.String({
    format: 'date-time',
  }),
  completedAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
  deadlineAt: Type.Optional(
    Type.Object({
      date: Type.String({
        format: 'date',
      }),
      time: Type.Optional(Type.String()),
    }),
  ),
  startAt: Type.Optional(
    Type.Object({
      date: Type.String({
        format: 'date',
      }),
      time: Type.Optional(Type.String()),
    }),
  ),
});

type Todo = Static<typeof todoSchema>;

const createTodoInputSchema = Type.Omit(todoSchema, ['id', 'createdAt', 'updatedAt', 'completedAt', 'distance']);

type CreateTodoInput = Static<typeof createTodoInputSchema>;

const updateTodoInputSchema = Type.Partial(
  Type.Omit(todoSchema, ['createdAt', 'updatedAt', 'completedAt', 'distance']),
);

type UpdateTodoInput = Static<typeof updateTodoInputSchema>;

const findTodoInputSchema = Type.Object({
  ids: Type.Optional(Type.Array(Type.String())),
  parents: Type.Optional(Type.Array(Type.String())),
  createdAt: Type.Optional(timeQuery),
  updatedAt: Type.Optional(timeQuery),
  completedAt: Type.Optional(timeQuery),
  deadlineAt: Type.Optional(timeQuery),
  startAt: Type.Optional(timeQuery),
  semanticText: Type.Optional(Type.String()),
});

type FindTodoInput = Static<typeof findTodoInputSchema>;

export {
  todoSchema,
  type Todo,
  createTodoInputSchema,
  CreateTodoInput,
  updateTodoInputSchema,
  UpdateTodoInput,
  findTodoInputSchema,
  type FindTodoInput,
};
