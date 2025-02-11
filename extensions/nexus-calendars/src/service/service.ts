import { createDAVClient } from 'tsdav';
import { Container } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { calendarConfig } from '../config/config.js';

type Client = Awaited<ReturnType<typeof createDAVClient>>;

type ClientCalendar = {
  client: Client;
  calendars: Awaited<ReturnType<Client['fetchCalendars']>>;
};

class Calendars {
  #container: Container;
  #clientsPromise?: Promise<ClientCalendar[]>;

  constructor(container: Container) {
    this.#container = container;
  }

  #setup = async () => {
    const configsService = this.#container.get(ConfigService);
    const config = await configsService.getValue(calendarConfig);
    if (!config) throw new Error('Calendar config not found');
    return await Promise.all(
      config.caldav.map(async (c) => {
        const client = await createDAVClient({
          serverUrl: c.url,
          credentials: c.credentials,
          defaultAccountType: 'caldav',
          authMethod: 'Basic',
        });
        const calendars = await client.fetchCalendars();
        return { client, calendars };
      }),
    );
  };

  #getClients = async () => {
    if (!this.#clientsPromise) {
      this.#clientsPromise = this.#setup();
    }
    return this.#clientsPromise;
  };

  public getEvents = async (start: Date, end: Date) => {
    const clients = await this.#getClients();
    const events = await Promise.all(
      clients.map(async (c) => {
        const events = await Promise.all(
          c.calendars.map(async (cal) => {
            return await c.client.fetchCalendarObjects({
              calendar: cal,
              timeRange: {
                start: start.toISOString(),
                end: end.toISOString(),
              },
            });
          }),
        );
        return events.flat();
      }),
    );
    return events.flat();
  };
}

export { Calendars };
