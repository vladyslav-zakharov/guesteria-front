import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { getBooking, getBookings } from '../api/get';

export const bookingsQueryOptions = () =>
  queryOptions({
    queryKey: [QueryKeys.GET_BOOKINGS],
    queryFn: ({ signal }) => getBookings(signal),
  });

export const bookingQueryOptions = (bookingId: string) =>
  queryOptions({
    queryKey: [QueryKeys.GET_BOOKINGS, bookingId],
    queryFn: ({ signal }) => getBooking(bookingId, signal),
  });

export const useGetBookings = () => useQuery(bookingsQueryOptions());

export const useGetBooking = (bookingId: string) =>
  useQuery(bookingQueryOptions(bookingId));
