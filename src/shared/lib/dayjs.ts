import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

// The back validates and stores stay dates against the UTC calendar day, so "today" on
// the front is that day too, whatever the device's time zone.
export const getUtcToday = (now = dayjs()) => now.utc().format(ISO_DATE_FORMAT);

export { dayjs };
