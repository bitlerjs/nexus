import { createDatabase } from '@bitlerjs/nexus-data';

import { migrations } from './migrations/migrations.js';

type RoomRow = {
  id: string;
  lightGroup?: string;
};

type MediaPlayerRow = {
  entityId: string;
  roomId: string;
};

type LightRow = {
  entityId: string;
  name?: string;
  roomId: string;
};

type RoomNameRow = {
  room_id: string;
  name: string;
};

const databaseConfig = createDatabase({
  name: 'homeassistant.rooms',
  migrations,
});

export { databaseConfig, RoomRow, MediaPlayerRow, LightRow, RoomNameRow };
