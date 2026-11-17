'use client';

import { useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateTodo } from 'entities/todos/hooks/post';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/button/button';

import { CreateTodoInput, createTodoSchema } from '../../schemas/validation';

export const CreateTodoForm = () => {
  const titleId = useId();
  const titleErrorId = `${titleId}-error`;
  const { mutate: createTodo, isPending, isError } = useCreateTodo();

  const form = useForm({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: '',
      completed: false,
    },
  });

  const { errors } = form.formState;

  const handleSubmit = (values: CreateTodoInput) => {
    // The demo has no signed-in user, and every jsonplaceholder todo belongs to one, so new
    // todos go to user 1.
    createTodo({ userId: 1, ...values }, { onSuccess: () => form.reset() });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex max-w-150 flex-col gap-6"
    >
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Create todo</legend>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={titleId}
            className={cn(
              'text-sm font-medium',
              errors.title && 'text-red-800 dark:text-red-200',
            )}
          >
            Title
          </label>
          <input
            id={titleId}
            {...form.register('title')}
            placeholder="Enter title"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? titleErrorId : undefined}
            className={cn(
              'rounded-sm border border-gray-300 p-2',
              errors.title &&
                'border-red-300 bg-red-50 text-red-800 placeholder:text-red-800',
            )}
          />
          {errors.title && (
            <p
              id={titleErrorId}
              className="text-sm text-red-800 dark:text-red-200"
            >
              {errors.title.message}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...form.register('completed')}
            className="size-4"
          />
          Completed
        </label>
      </fieldset>
      {isError && (
        <p role="alert" className="text-sm text-red-800 dark:text-red-200">
          Could not create the todo. Try again.
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create todo'}
      </Button>
    </form>
  );
};
