import { dayjs, ISO_DATE_FORMAT } from 'shared/lib/dayjs';
import type { IMoney } from 'shared/types/money';

const LOCALE = 'en-GB';
const SHORT_DATE_FORMAT = 'ddd D MMM';
const FULL_DATE_FORMAT = 'ddd D MMM YYYY';
const INSTANT_FORMAT = 'D MMM YYYY, HH:mm [UTC]';

type Stay = { checkin: string; checkout: string };

// Stay dates are calendar days, not instants: read and print them in UTC so the viewer's
// time zone and DST can never shift a day.
export const parseStayDate = (date: string) =>
  dayjs.utc(date, ISO_DATE_FORMAT, true);

export const countNights = ({ checkin, checkout }: Stay) =>
  parseStayDate(checkout).diff(parseStayDate(checkin), 'day');

export const addDays = ({ date, days }: { date: string; days: number }) =>
  parseStayDate(date).add(days, 'day').format(ISO_DATE_FORMAT);

export const formatMoney = ({ amount, currency }: IMoney) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amount);

export const formatDateRange = ({ checkin, checkout }: Stay) =>
  `${parseStayDate(checkin).format(SHORT_DATE_FORMAT)} – ${parseStayDate(checkout).format(SHORT_DATE_FORMAT)}`;

export const formatStayDate = (date: string) =>
  parseStayDate(date).format(FULL_DATE_FORMAT);

// Deadlines are instants. They print in UTC, labelled as such, because the server render
// and the browser would otherwise disagree on the viewer's time zone.
export const formatInstant = (instant: string) =>
  dayjs.utc(instant).format(INSTANT_FORMAT);

// A Date from the browser or react-day-picker is a moment in the viewer's time zone, so its
// calendar day is read in local time.
export const toIsoDate = (date: Date) => dayjs(date).format(ISO_DATE_FORMAT);

// react-day-picker compares days as local-midnight Date values, so the calendar day is
// built in local time, not UTC.
export const fromIsoDate = (date: string) =>
  dayjs(date, ISO_DATE_FORMAT, true).toDate();
