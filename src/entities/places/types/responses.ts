export interface IPlace {
  placeId: string;
  name: string;
  address: string;
}

export interface IPlacesResponse {
  places: IPlace[];
}
