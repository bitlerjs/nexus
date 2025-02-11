import { Type } from '@bitlerjs/nexus';
import { createConfig } from '@bitlerjs/nexus-configs';
import { createDAVClient } from 'tsdav';

const calendarConfig = createConfig({
  kind: 'calendars',
  name: 'Calendars',
  group: 'Integrations',
  description: 'Configure calendars',
  schema: Type.Object({
    caldav: Type.Array(
      Type.Object({
        url: Type.String(),
        credentials: Type.Object({
          username: Type.String(),
          password: Type.String(),
        }),
      }),
    ),
  }),
  validate: async ({ input }) => {
    await Promise.all(
      input.caldav.map(async (cal) => {
        const account = await createDAVClient({
          serverUrl: cal.url,
          defaultAccountType: 'caldav',
          credentials: cal.credentials,
          authMethod: 'Basic',
        });
        await account.fetchCalendars({});
      }),
    );
  },
});

export { calendarConfig };
