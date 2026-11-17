import { api } from 'shared/lib/axios';

import { IToggleTodo } from '../types/payloads';
import { ITodo } from '../types/responses';

// jsonplaceholder has no toggle endpoint, so the client sends the new `completed` value.
export const toggleTodo = async (
  todoId: number,
  payload: IToggleTodo,
): Promise<ITodo> => {
  const response = await api.patch<ITodo>(`/todos/${todoId}`, payload);

  return response.data;
};
