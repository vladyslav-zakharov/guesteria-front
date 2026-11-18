import { api } from 'shared/lib/axios';

import { ISendMessage } from '../types/payloads';
import { ISendMessageResponse } from '../types/responses';

export const sendMessage = async ({
  bookingId,
  payload,
}: {
  bookingId: string;
  payload: ISendMessage;
}): Promise<ISendMessageResponse> => {
  const response = await api.post<ISendMessageResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/messages`,
    payload,
  );

  return response.data;
};
