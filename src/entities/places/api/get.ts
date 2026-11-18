import { api } from 'shared/lib/axios';

import { IGetPlacesParams } from '../types/params';
import { IPlacesResponse } from '../types/responses';

export const getPlaces = async (
  params: IGetPlacesParams,
  signal?: AbortSignal,
): Promise<IPlacesResponse> => {
  const response = await api.get<IPlacesResponse>('/places', {
    signal,
    params,
  });

  return response.data;
};
