import { api } from 'shared/lib/axios';

import { IMessagesResponse } from '../types/responses';

export const getMessages = async (
  bookingId: string,
  signal?: AbortSignal,
): Promise<IMessagesResponse> => {
  const response = await api.get<IMessagesResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/messages`,
    { signal },
  );

  return response.data;
};
