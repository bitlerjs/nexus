import {
  HassEntities,
  callService,
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
} from 'home-assistant-js-websocket';
import { Container } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';

import { RoomConfig } from '../schemas/rooms.js';
import { databaseConfig, LightRow, MediaPlayerRow, RoomNameRow, RoomRow } from '../database/database.js';

const createResolvable = <T>() => {
  let resolve: (value: T) => void;
  let reject: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { promise, resolve: resolve!, reject: reject! };
};

type CallServiceOptions = {
  domain: string;
  service: string;
  serviceData?: Record<string, unknown>;
  response?: boolean;
  target?: {
    entities?: string[];
    areas?: string[];
    devices?: string[];
    floors?: string[];
    labels?: string[];
  };
};

class HomeassistantService {
  #auth?: { url: string; token: string };
  #connectionPromise?: ReturnType<typeof createConnection>;
  #entities: HassEntities = {};
  #ready = createResolvable<undefined>();
  #container: Container;
  #roomsConfigPromise?: Promise<RoomConfig[]>;

  constructor(container: Container) {
    this.#container = container;
  }

  #getRoomsConfig = async (): Promise<RoomConfig[]> => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(databaseConfig);
    const rooms = await db<RoomRow>('rooms');
    const roomNames = await db<RoomNameRow>('room_names');
    const mediaPlayers = await db<MediaPlayerRow>('media_players');
    const lights = await db<LightRow>('lights');

    return rooms.map((room) => ({
      ...room,
      names: roomNames.filter((name) => name.room_id === room.id).map((name) => name.name),
      mediaPlayers: mediaPlayers
        .filter((mediaPlayer) => mediaPlayer.roomId === room.id)
        .map((mediaPlayer) => mediaPlayer.entityId),
      lights: lights
        .filter((light) => light.roomId === room.id)
        .map((light) => ({
          id: light.entityId,
          name: light.name,
        })),
    }));
  };

  #setup = async () => {
    if (!this.#auth) {
      throw new Error('HomeassistantService: auth is not set');
    }
    const auth = createLongLivedTokenAuth(this.#auth.url, this.#auth.token);
    const connection = await createConnection({ auth });
    subscribeEntities(connection, (entities) => {
      this.#entities = entities;
      this.#ready.resolve(undefined);
    });
    return connection;
  };

  public setAuth = (url: string, token: string) => {
    this.#auth = { url, token };
    this.#connectionPromise?.then((connection) => connection.close());
    this.#connectionPromise = undefined;
  };

  public getRoomsConfig = async () => {
    if (!this.#roomsConfigPromise) {
      this.#roomsConfigPromise = this.#getRoomsConfig();
    }
    return this.#roomsConfigPromise;
  };

  public setRoomsConfig = async (rooms: RoomConfig[]) => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(databaseConfig);
    await db.transaction(async (trx) => {
      await trx<RoomRow>('rooms').delete();
      await trx<RoomNameRow>('room_names').delete();
      await trx<MediaPlayerRow>('media_players').delete();
      await trx<LightRow>('lights').delete();

      for (const room of rooms) {
        await trx<RoomRow>('rooms').insert({ id: room.id, lightGroup: room.lightGroup });
        for (const name of room.names) {
          await trx<RoomNameRow>('room_names').insert({ room_id: room.id, name });
        }
        for (const mediaPlayer of room.mediaPlayers || []) {
          await trx<MediaPlayerRow>('media_players').insert({ entityId: mediaPlayer, roomId: room.id });
        }
        for (const light of room.lights || []) {
          await trx<LightRow>('lights').insert({ entityId: light.id, name: light.name, roomId: room.id });
        }
      }
    });
    this.#roomsConfigPromise = Promise.resolve(rooms);
  };

  public get entities() {
    return this.#entities;
  }

  get #connection() {
    if (!this.#connectionPromise) {
      this.#connectionPromise = this.#setup();
    }
    return this.#connectionPromise;
  }

  public ready = async () => {
    await this.#connection;
    await this.#ready.promise;
  };

  public destroy = () => {
    this.#connectionPromise?.then((connection) => connection.close());
  };

  public callService = async <T = unknown>(options: CallServiceOptions) => {
    const connection = await this.#connection;
    const { domain, service, serviceData, target } = options;
    const response = await callService(
      connection,
      domain,
      service,
      serviceData,
      target
        ? {
            entity_id: target.entities,
            area_id: target.areas,
            device_id: target.devices,
            floor_id: target.floors,
            label_id: target.labels,
          }
        : undefined,
      options.response,
    );
    return response as T;
  };
}

export { HomeassistantService };
