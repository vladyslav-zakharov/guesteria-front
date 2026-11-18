import { StaySearchForm } from 'features/stay-search/ui/stay-search-form/stay-search-form';
import { getUtcToday } from 'shared/lib/dayjs';
import {
  parseStayPrefill,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';
import { Logo } from 'shared/ui/logo';

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<SearchParamsRecord>;
};

const HomePage = async ({ searchParams }: Props) => {
  const prefill = parseStayPrefill(await searchParams);
  // The back validates stays against the UTC calendar day, so the picker and the form
  // schema use the same day.
  const today = getUtcToday();

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <header>
        <Logo />
      </header>
      <StaySearchForm prefill={prefill} today={today} />
    </div>
  );
};

export default HomePage;
