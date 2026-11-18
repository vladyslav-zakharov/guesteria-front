import { IMoney } from 'shared/types/money';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface IGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface IBookingHotel {
  hotelId: string;
  name: string;
  photoUrl: string | null;
  address: string;
}

export interface IPrebook {
  id: string;
  hotelName: string;
  roomName: string;
  boardName: string;
  checkin: string;
  checkout: string;
  nights: number;
  price: IMoney;
  priceChanged: boolean;
  refundable: boolean;
  cancellationDeadline: string | null;
}

export interface IBooking {
  id: string;
  status: BookingStatus;
  hotel: IBookingHotel;
  roomName: string;
  boardName: string;
  checkin: string;
  checkout: string;
  nights: number;
  adults: number;
  childrenAges: number[];
  price: IMoney;
  refundable: boolean;
  cancellationDeadline: string | null;
  guest: IGuest;
  specialRequests: string | null;
  createdAt: string;
}

export interface IPrebookResponse {
  prebook: IPrebook;
}

export interface IBookingResponse {
  booking: IBooking;
}

export interface IBookingsResponse {
  bookings: IBooking[];
}
