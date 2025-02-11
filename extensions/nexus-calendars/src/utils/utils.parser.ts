import { DAVObject } from 'tsdav';
import ical from 'node-ical';

type ParseEventsOptions = {
  from: Date;
  to: Date;
  objs: DAVObject[];
};

const parseEvents = ({ objs, from, to }: ParseEventsOptions): any => {
  const parsedEntities = objs.filter((e) => e.data).map((e) => ical.sync.parseICS(e.data));
  const rawEvents = parsedEntities.flatMap((e) => {
    return Object.values(e).filter((e) => e.type === 'VEVENT');
  });

  const setTimezoneForDate = (date: Date, timeZone?: string | null) => {
    if (!timeZone) {
      return date;
    }
    // Get the UTC time offset in hours
    const utcOffsetMinutes = date.getTimezoneOffset();
    const utcDate = new Date(date.getTime() + utcOffsetMinutes * 60 * 1000); // Convert to local time

    // Get the timezone offset for the specified timezone
    const options = { timeZone: timeZone, timeZoneName: 'short' } as const;
    const timeZoneOffset = Intl.DateTimeFormat('en-US', options).resolvedOptions().timeZone;

    // Get the timezone offset in milliseconds for the specified timezone
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone }));

    // Return the new Date object that represents the same moment in time but treated as if it's in 'timeZone'
    return targetDate;
  };

  const events = rawEvents.flatMap((event) => {
    const rrule = event.rrule;
    let dates = [
      {
        start: new Date(event.start),
        end: new Date(event.end),
      },
    ];
    if (rrule) {
      // https://www.npmjs.com/package/node-ical
      dates = rrule.between(from, to).map((date) => {
        const start = setTimezoneForDate(
          new Date(date.setHours(date.getHours() - (event.start.getTimezoneOffset() - date.getTimezoneOffset()) / 60)),
          rrule.origOptions.tzid,
        );
        const length = event.end.getTime() - event.start.getTime();
        const end = new Date(start.getTime() + length);
        return {
          start,
          end,
        };
      });
    }
    if (dates.length === 0) {
      return [];
    }
    console.log(event);
    return [
      {
        ...event,
        dates,
      },
    ];
  });

  return events;
};

export { parseEvents };
