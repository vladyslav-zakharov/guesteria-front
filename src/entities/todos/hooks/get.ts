import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { getTodos } from '../api/get';
import { IGetTodosParams } from '../types/params';

// One options factory per query, shared by the server prefetch in app/ and the hook, so
// the query key and the fetcher cannot drift apart.
export const todosQueryOptions = (query: IGetTodosParams) =>
  queryOptions({
    queryKey: [QueryKeys.GET_TODOS, query],
    queryFn: ({ signal }) => getTodos(query, signal),
  });

export const useGetTodos = (query: IGetTodosParams) =>
  useQuery(todosQueryOptions(query));
