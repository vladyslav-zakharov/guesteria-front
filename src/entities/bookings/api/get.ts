import { api } from 'shared/lib/axios';

import { IBookingResponse, IBookingsResponse } from '../types/responses';

export const getBooking = async (
  bookingId: string,
  signal?: AbortSignal,
): Promise<IBookingResponse> => {
  const response = await api.get<IBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}`,
    { signal },
  );

  return response.data;
};

export const getBookings = async (
  signal?: AbortSignal,
): Promise<IBookingsResponse> => {
  const response = await api.get<IBookingsResponse>('/bookings', { signal });

  return response.data;
};
