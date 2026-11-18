import { IGuest } from './responses';

export interface ICreatePrebook {
  hotelId: string;
  offerId: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number[];
}

export interface ICreateBooking {
  prebookId: string;
  guest: IGuest;
  specialRequests?: string;
}
