import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { getHotel, getHotels } from '../api/get';
import { IGetHotelParams, IGetHotelsParams } from '../types/params';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const RATES_STALE_MINUTES = 5;

// Rates and availability change within minutes, so hotel queries refetch well before the
// app-wide one-hour staleTime would allow.
const RATES_STALE_TIME_MS = RATES_STALE_MINUTES * MINUTE_MS;

export const hotelsQueryOptions = (params: IGetHotelsParams) =>
  queryOptions({
    queryKey: [QueryKeys.GET_HOTELS, params],
    queryFn: ({ signal }) => getHotels(params, signal),
    staleTime: RATES_STALE_TIME_MS,
  });

export const hotelQueryOptions = ({ hotelId, stay }: IGetHotelParams) =>
  queryOptions({
    queryKey: [QueryKeys.GET_HOTELS, hotelId, stay],
    queryFn: ({ signal }) => getHotel({ hotelId, stay }, signal),
    staleTime: RATES_STALE_TIME_MS,
  });

export const useGetHotels = (params: IGetHotelsParams) =>
  useQuery(hotelsQueryOptions(params));

export const useGetHotel = (params: IGetHotelParams) =>
  useQuery(hotelQueryOptions(params));
