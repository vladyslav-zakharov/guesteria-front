import * as z from 'zod';

import {
  firstValue,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';

export const RESULTS_SORTS = ['price', 'rating'] as const;

export const DEFAULT_RESULTS_SORT = 'price';

// A hand-edited or stale URL falls back to the defaults instead of failing the page: sort
// and the filter only refine a valid stay.
const resultsParamsSchema = z.object({
  sort: z.preprocess(
    firstValue,
    z.enum(RESULTS_SORTS).catch(DEFAULT_RESULTS_SORT),
  ),
  refundableOnly: z.preprocess(
    firstValue,
    z
      .string()
      .optional()
      .catch(undefined)
      .transform(value => value === 'true'),
  ),
});

export type ResultsParams = z.infer<typeof resultsParamsSchema>;

export type ResultsSort = ResultsParams['sort'];

export const parseResultsParams = (raw: SearchParamsRecord): ResultsParams =>
  resultsParamsSchema.parse(raw);
