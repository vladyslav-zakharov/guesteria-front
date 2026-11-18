import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { getPlaces } from '../api/get';

export const PLACE_QUERY_MIN_LENGTH = 2;

export const PLACE_QUERY_MAX_LENGTH = 100;

export const placesQueryOptions = (query: string) => {
  const q = query.trim();

  return queryOptions({
    queryKey: [QueryKeys.GET_PLACES, q],
    queryFn: ({ signal }) => getPlaces({ q }, signal),
    // The API rejects a query outside these lengths with 400, so the request is never sent.
    enabled:
      q.length >= PLACE_QUERY_MIN_LENGTH && q.length <= PLACE_QUERY_MAX_LENGTH,
  });
};

export const useSearchPlaces = (query: string) =>
  useQuery(placesQueryOptions(query));
