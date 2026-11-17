'use client';

import { FC } from 'react';

import { useToggleTodo } from 'entities/todos/hooks/patch';
import { ITodo } from 'entities/todos/types/responses';
import { cn } from 'shared/lib/styles';

interface IProps {
  todo: ITodo;
}

export const Todo: FC<IProps> = ({ todo }) => {
  const { mutate: toggleTodo, isPending, isError } = useToggleTodo();

  const handleToggle = () => {
    toggleTodo({ todoId: todo.id, completed: !todo.completed });
  };

  return (
    <li className="flex flex-col gap-1">
      <label
        className={cn(
          'flex cursor-pointer items-center gap-2',
          isPending && 'cursor-progress',
        )}
      >
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={isPending}
          onChange={handleToggle}
          className="size-4"
        />
        <span
          className={cn(
            'first-letter:uppercase',
            todo.completed && 'line-through',
          )}
        >
          {todo.title}
        </span>
      </label>
      {isError && (
        <p role="alert" className="text-sm text-red-800 dark:text-red-200">
          Could not update this todo.
        </p>
      )}
    </li>
  );
};
