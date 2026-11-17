import { ITodo } from './responses';

export interface ICreateTodo extends Required<Omit<ITodo, 'id'>> {}
export interface IToggleTodo extends Pick<ITodo, 'completed'> {}
