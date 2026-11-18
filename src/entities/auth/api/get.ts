import { api } from 'shared/lib/axios';

import { IUserResponse } from '../types/responses';

export const getMe = async (signal?: AbortSignal): Promise<IUserResponse> => {
  const response = await api.get<IUserResponse>('/auth/me', { signal });

  return response.data;
};
