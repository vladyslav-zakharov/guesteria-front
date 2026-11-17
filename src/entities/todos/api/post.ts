import { api } from 'shared/lib/axios';

import { ICreateTodo } from '../types/payloads';
import { ITodo } from '../types/responses';

export const createTodo = async (payload: ICreateTodo): Promise<ITodo> => {
  const response = await api.post<ITodo>('/todos', payload);

  return response.data;
};
