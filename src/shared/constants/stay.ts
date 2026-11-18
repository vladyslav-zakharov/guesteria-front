export const STAY_LIMITS = {
  maxNights: 30,
  maxAdvanceDays: 365,
  minAdults: 1,
  maxAdults: 8,
  maxChildren: 4,
  maxChildAge: 17,
} as const;

// The API takes child ages as one comma-separated value, in page URLs and in requests.
export const CHILDREN_SEPARATOR = ',';

// Mirrors the API's hotelId rule, so a malformed id is caught before it becomes a request
// the API rejects with 400.
export const HOTEL_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// The API's limit for GET /api/hotels `placeId`.
export const PLACE_ID_MAX_LENGTH = 200;
