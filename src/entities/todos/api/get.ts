import { api } from 'shared/lib/axios';

import { IGetTodosParams } from '../types/params';
import { ITodo } from '../types/responses';

export const getTodos = async (
  params: IGetTodosParams,
  signal?: AbortSignal,
): Promise<ITodo[]> => {
  const response = await api.get<ITodo[]>('/todos', {
    signal,
    params,
  });

  return response.data;
};
