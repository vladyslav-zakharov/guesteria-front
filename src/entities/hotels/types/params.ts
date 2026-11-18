export type HotelSort = 'price' | 'rating';

export interface IStay {
  checkin: string;
  checkout: string;
  adults: number;
  children: number[];
}

export interface IGetHotelsParams extends IStay {
  placeId: string;
  sort?: HotelSort;
  refundableOnly?: boolean;
}

export interface IGetHotelParams {
  hotelId: string;
  stay: IStay;
}
