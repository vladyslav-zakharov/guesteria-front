'use client';

import { FC } from 'react';

import { useGetTodos } from 'entities/todos/hooks/get';
import { IGetTodosParams } from 'entities/todos/types/params';
import { Button } from 'shared/ui/button/button';

import { Todo } from '../todo/todo';
import { TodosPagination } from '../todos-pagination/todos-pagination';

interface IProps {
  params: IGetTodosParams;
}

export const TodosList: FC<IProps> = ({ params }) => {
  const { data, isPending, isError, error, refetch } = useGetTodos(params);

  if (isPending) {
    return <p role="status">Loading todos…</p>;
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p>Could not load todos: {error.message}</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.length === 0 ? (
        <p>No todos on this page.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map(todo => (
            <Todo key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
      <TodosPagination
        page={params._page}
        hasNextPage={data.length === params._limit}
      />
    </div>
  );
};
