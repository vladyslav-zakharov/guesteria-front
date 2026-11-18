import { CHILDREN_SEPARATOR } from 'shared/constants/stay';
import { api } from 'shared/lib/axios';

import { IGetHotelParams, IGetHotelsParams, IStay } from '../types/params';
import { IHotelResponse, IHotelsResponse } from '../types/responses';

// The API takes child ages as one comma-separated value; axios would send an array as
// repeated `children[]` keys. No children means the key is left out.
const toStayQuery = ({ children, ...stay }: IStay) => ({
  ...stay,
  children: children.length > 0 ? children.join(CHILDREN_SEPARATOR) : undefined,
});

export const getHotels = async (
  { placeId, sort, refundableOnly, ...stay }: IGetHotelsParams,
  signal?: AbortSignal,
): Promise<IHotelsResponse> => {
  const response = await api.get<IHotelsResponse>('/hotels', {
    signal,
    params: { placeId, sort, refundableOnly, ...toStayQuery(stay) },
  });

  return response.data;
};

export const getHotel = async (
  { hotelId, stay }: IGetHotelParams,
  signal?: AbortSignal,
): Promise<IHotelResponse> => {
  const response = await api.get<IHotelResponse>(
    `/hotels/${encodeURIComponent(hotelId)}`,
    { signal, params: toStayQuery(stay) },
  );

  return response.data;
};
