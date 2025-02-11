import { createExtension, EntityProvidersService } from '@bitlerjs/nexus';

import { noteEntity } from './entities/entities.note.js';

const notes = createExtension({
  setup: async ({ container }) => {
    const entityProviderService = container.get(EntityProvidersService);
    entityProviderService.register([noteEntity]);
  },
});

export { notes };
