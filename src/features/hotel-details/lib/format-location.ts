const regionNames = new Intl.DisplayNames(['en-GB'], { type: 'region' });

// The API sends an ISO 3166-1 alpha-2 code; an unknown or malformed one prints as sent
// instead of failing the page.
export const formatCountry = (code: string) => {
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

export const formatLocation = ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => [city, formatCountry(country)].filter(Boolean).join(', ');
