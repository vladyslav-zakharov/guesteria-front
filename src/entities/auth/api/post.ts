import { api } from 'shared/lib/axios';

import { ISignIn, ISignUp } from '../types/payloads';
import { IUserResponse } from '../types/responses';

export const signUp = async (payload: ISignUp): Promise<IUserResponse> => {
  const response = await api.post<IUserResponse>('/auth/sign-up', payload);

  return response.data;
};

export const signIn = async (payload: ISignIn): Promise<IUserResponse> => {
  const response = await api.post<IUserResponse>('/auth/sign-in', payload);

  return response.data;
};

export const signOut = async (): Promise<void> => {
  await api.post('/auth/sign-out');
};
