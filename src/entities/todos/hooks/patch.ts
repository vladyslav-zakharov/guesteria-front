import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { toggleTodo } from '../api/patch';
import { IToggleTodo } from '../types/payloads';

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // jsonplaceholder answers writes but never stores them, so the refetch after this
    // invalidation brings the old `completed` value back.
    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_TODOS],
      });
    },
    mutationFn: ({ todoId, ...payload }: IToggleTodo & { todoId: number }) =>
      toggleTodo(todoId, payload),
  });
};
