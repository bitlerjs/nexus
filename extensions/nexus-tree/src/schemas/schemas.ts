import { Static, Type } from '@bitlerjs/nexus';

const itemSchema = Type.Object({
  id: Type.String(),
  entity: Type.Object({
    kind: Type.String(),
    id: Type.String(),
  }),
  name: Type.String(),
  folder: Type.Optional(Type.String()),
});

const folderSchema = Type.Object({
  id: Type.String(),
  trees: Type.Array(Type.String()),
  name: Type.String(),
  parent: Type.Optional(Type.String()),
});

const treeSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
});

const createFolderSchema = Type.Object({
  name: Type.String(),
  parent: Type.Optional(Type.String()),
  trees: Type.Optional(Type.Array(Type.String())),
});

const updateFolderSchema = Type.Object({
  name: Type.Optional(Type.String()),
  parent: Type.Optional(Type.String()),
  trees: Type.Optional(Type.Array(Type.String())),
});

const createItemSchema = Type.Object({
  name: Type.String(),
  folder: Type.String(),
  entity: Type.Object({
    kind: Type.String(),
    id: Type.String(),
  }),
});

const updateItemSchema = Type.Object({
  id: Type.String(),
  name: Type.Optional(Type.String()),
  folder: Type.Optional(Type.String()),
  entity: Type.Optional(
    Type.Object({
      kind: Type.String(),
      id: Type.String(),
    }),
  ),
});

type Item = Static<typeof itemSchema>;
type Folder = Static<typeof folderSchema>;
type Tree = Static<typeof treeSchema>;
type CreateFolder = Static<typeof createFolderSchema>;
type UpdateFolder = Static<typeof updateFolderSchema>;
type CreateItem = Static<typeof createItemSchema>;
type UpdateItem = Static<typeof updateItemSchema>;

export {
  itemSchema,
  folderSchema,
  treeSchema,
  createFolderSchema,
  updateFolderSchema,
  createItemSchema,
  updateItemSchema,
  Item,
  Folder,
  Tree,
  CreateFolder,
  UpdateFolder,
  CreateItem,
  UpdateItem,
};
