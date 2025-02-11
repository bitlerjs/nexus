import { createEntityProvider } from '@bitlerjs/nexus';

import { createNoteSchema, findNotesSchema, noteSchema, updateNoteSchema } from '../schemas/schemas.js';
import { NotesService } from '../services/services.notes.js';

const noteEntity = createEntityProvider({
  kind: 'notes.note',
  name: 'Note',
  description: 'A single note',
  schema: noteSchema,
  get: async ({ container, input }) => {
    const notesService = container.get(NotesService);
    const items = await notesService.find({ ids: input.ids });
    return items;
  },
  find: {
    schema: findNotesSchema,
    handler: async ({ container, input }) => {
      const service = container.get(NotesService);
      return await service.find(input);
    },
  },
  create: {
    schema: createNoteSchema,
    handler: async ({ container, input }) => {
      const service = container.get(NotesService);
      return await service.create(input);
    },
  },
  update: {
    schema: updateNoteSchema,
    handler: async ({ container, input }) => {
      const service = container.get(NotesService);
      return await service.update(input);
    },
  },
  delete: {
    handler: async ({ container, input }) => {
      const service = container.get(NotesService);
      return await service.delete(input.ids);
    },
  },
});

export { noteEntity };
