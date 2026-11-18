import { IUser } from './responses';

export interface ISignIn {
  email: string;
  password: string;
}

export interface ISignUp extends ISignIn, Omit<IUser, 'id' | 'email'> {}
