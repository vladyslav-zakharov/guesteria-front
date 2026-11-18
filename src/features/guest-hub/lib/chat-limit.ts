import type { ChatErrorKind } from './chat-error';

// A daily-limit error counts only until the chat is reloaded after it: the reload (a
// failed send invalidates it) carries the server's allowance, which resets at midnight
// UTC.
export const isDailyLimitReached = ({
  remainingToday,
  sendErrorKind,
  chatUpdatedAt,
  sendSubmittedAt,
}: {
  remainingToday: number | null;
  sendErrorKind: ChatErrorKind | null;
  chatUpdatedAt: number;
  sendSubmittedAt: number;
}) =>
  remainingToday === 0 ||
  (sendErrorKind === 'dailyLimit' && chatUpdatedAt < sendSubmittedAt);
