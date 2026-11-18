export const QUICK_QUESTIONS = [
  'Check-in time',
  'Is breakfast included?',
  'Is there parking?',
  'Wi-Fi details',
  'Cancellation policy',
];

export const describeRemaining = (remaining: number) =>
  `${remaining} ${remaining === 1 ? 'question' : 'questions'} left today`;
