import { queryOptions, useQuery } from '@tanstack/react-query';

import { HTTP_STATUS } from 'shared/constants/http';
import { QueryKeys } from 'shared/constants/query-keys';
import { getApiError } from 'shared/lib/http/api-error';

import { getMe } from '../api/get';
import { IUser } from '../types/responses';

const ME_STALE_TIME_MS = 300_000;

// A signed-out visitor is a normal state, not an error: 401 resolves to null so the UI
// renders "Sign in" instead of an error branch, and nothing retries it.
export const meQueryOptions = () =>
  queryOptions({
    queryKey: [QueryKeys.GET_AUTH],
    queryFn: async ({ signal }): Promise<IUser | null> => {
      try {
        const { user } = await getMe(signal);

        return user;
      } catch (error) {
        if (getApiError(error)?.statusCode === HTTP_STATUS.unauthorized) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: ME_STALE_TIME_MS,
  });

export const useMe = () => useQuery(meQueryOptions());
