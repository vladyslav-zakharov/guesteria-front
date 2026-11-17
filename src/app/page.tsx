import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { todosSearchParamsSchema } from 'features/todos/schemas/todos-search-params';
import { CreateTodoForm } from 'features/todos/ui/create-todo-form/create-todo-form';
import { TodosList } from 'features/todos/ui/todos-list/todos-list';
import { todosQueryOptions } from 'entities/todos/hooks/get';
import { IGetTodosParams } from 'entities/todos/types/params';
import { getQueryClient } from 'shared/lib/query';

const TODOS_PER_PAGE = 10;

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const HomePage = async ({ searchParams }: Props) => {
  const { page } = todosSearchParamsSchema.parse(await searchParams);
  const params: IGetTodosParams = { _page: page, _limit: TODOS_PER_PAGE };
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(todosQueryOptions(params));

  return (
    <main className="flex flex-col gap-6 p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Todos</h1>
        <p className="text-sm">
          The data comes from jsonplaceholder, which accepts changes but does
          not save them.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TodosList params={params} />
      </HydrationBoundary>
      <hr />
      <CreateTodoForm />
    </main>
  );
};

export default HomePage;
