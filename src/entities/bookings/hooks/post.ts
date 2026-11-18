import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { createBooking, createPrebook } from '../api/post';
import { ICreateBooking, ICreatePrebook } from '../types/payloads';

// A prebook only quotes a price; nothing cached changes until the booking exists.
export const usePrebook = () =>
  useMutation({
    mutationFn: (payload: ICreatePrebook) => createPrebook(payload),
  });

// Exposed as a factory, like the query options, so the cache effect is testable without
// rendering the hook. Invalidated on failure too: a book that failed upstream or lost its
// connection may still have reached the hotel, and the guest is sent to Trips to check.
export const createBookingMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: (payload: ICreateBooking) => createBooking(payload),
  onSettled: () =>
    queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_BOOKINGS] }),
});

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation(createBookingMutationOptions(queryClient));
};
