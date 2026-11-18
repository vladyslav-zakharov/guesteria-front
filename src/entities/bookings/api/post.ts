import { api } from 'shared/lib/axios';

import { ICreateBooking, ICreatePrebook } from '../types/payloads';
import { IBookingResponse, IPrebookResponse } from '../types/responses';

export const createPrebook = async (
  payload: ICreatePrebook,
): Promise<IPrebookResponse> => {
  const response = await api.post<IPrebookResponse>(
    '/bookings/prebook',
    payload,
  );

  return response.data;
};

export const createBooking = async (
  payload: ICreateBooking,
): Promise<IBookingResponse> => {
  const response = await api.post<IBookingResponse>('/bookings', payload);

  return response.data;
};
