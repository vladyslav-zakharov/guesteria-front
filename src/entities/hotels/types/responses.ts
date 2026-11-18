import { IMoney } from 'shared/types/money';

export interface IHotelCard {
  hotelId: string;
  name: string;
  photoUrl: string | null;
  stars: number | null;
  rating: number | null;
  reviewCount: number | null;
  address: string;
  price: IMoney;
  refundable: boolean;
}

export interface IHotelDetails {
  hotelId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number | null;
  rating: number | null;
  reviewCount: number | null;
  description: string;
  photos: string[];
  facilities: string[];
  checkinTime: string | null;
  checkoutTime: string | null;
}

export interface IOffer {
  offerId: string;
  roomName: string;
  boardName: string;
  price: IMoney;
  refundable: boolean;
  cancellationDeadline: string | null;
}

export interface IHotelsResponse {
  hotels: IHotelCard[];
  nights: number;
}

export interface IHotelResponse {
  hotel: IHotelDetails;
  offers: IOffer[];
  nights: number;
}
