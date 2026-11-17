// jsonplaceholder returns the todo itself, without the `{ message, data }` envelope that the
// generator assumes, so the generated response types are replaced by the item type.
export interface ITodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}
