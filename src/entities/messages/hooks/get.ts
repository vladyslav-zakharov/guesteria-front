import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { getMessages } from '../api/get';

export const messagesQueryOptions = (bookingId: string) =>
  queryOptions({
    queryKey: [QueryKeys.GET_MESSAGES, bookingId],
    queryFn: ({ signal }) => getMessages(bookingId, signal),
    // The daily allowance resets at midnight UTC, so a cached "limit reached" must not
    // outlive it: every mount and window focus asks the server again.
    staleTime: 0,
  });

export const useGetMessages = (bookingId: string) =>
  useQuery(messagesQueryOptions(bookingId));
