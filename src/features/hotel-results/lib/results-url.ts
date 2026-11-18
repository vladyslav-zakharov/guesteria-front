import { CHILDREN_SEPARATOR } from 'shared/constants/stay';
import {
  serializeStayParams,
  type HotelStay,
  type StayParams,
} from 'shared/lib/stay/stay-params';

import {
  DEFAULT_RESULTS_SORT,
  type ResultsParams,
} from '../schemas/results-params';

// Only the fields that passed validation go back to the search form, so it opens with
// what the user had and asks for the rest.
export const buildPrefillHref = (prefill: Partial<StayParams>) => {
  const entries = Object.entries(prefill).map(([field, value]) => [
    field,
    Array.isArray(value) ? value.join(CHILDREN_SEPARATOR) : String(value),
  ]);
  const query = new URLSearchParams(entries).toString();

  return query ? `/?${query}` : '/';
};

export const buildResultsHref = ({
  stay,
  sort,
  refundableOnly,
}: { stay: StayParams } & ResultsParams) => {
  const params = new URLSearchParams(serializeStayParams(stay));

  if (sort !== DEFAULT_RESULTS_SORT) {
    params.set('sort', sort);
  }

  if (refundableOnly) {
    params.set('refundableOnly', 'true');
  }

  return `/search?${params.toString()}`;
};

// The hotel page keys its query on exactly these four fields, so the place is left out
// of the stay object its link and query key are built from.
export const toHotelStay = ({
  checkin,
  checkout,
  adults,
  children,
}: HotelStay): HotelStay => ({ checkin, checkout, adults, children });
