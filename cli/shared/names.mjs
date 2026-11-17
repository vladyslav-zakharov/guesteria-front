// Letters and digits, words joined by hyphens or camelCase. Anything else (spaces, dots,
// slashes, underscores) would end up in a folder path or an identifier, so it is rejected
// here instead of producing a broken file.
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*(-[A-Za-z0-9]+)*$/;

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const parseName = input => {
  if (typeof input !== 'string' || !NAME_PATTERN.test(input)) {
    throw new Error(
      `"${input ?? ''}" is not a valid name. Use letters and digits, starting with a letter, in camelCase or kebab-case (e.g. user, userProfile, user-profile).`,
    );
  }

  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .split('-');
};

export const toNames = words => ({
  camel: words[0] + words.slice(1).map(capitalize).join(''),
  pascal: words.map(capitalize).join(''),
  kebab: words.join('-'),
  constant: words.join('_').toUpperCase(),
});

// Regular English plurals only. Irregular ones (person -> people) come from --plural.
export const pluralizeWord = word => {
  if (/[^aeiou]y$/.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/.test(word)) {
    return `${word}es`;
  }

  return `${word}s`;
};

export const entityNames = (input, pluralInput) => {
  const singular = parseName(input);
  const plural =
    pluralInput === undefined
      ? [...singular.slice(0, -1), pluralizeWord(singular[singular.length - 1])]
      : parseName(pluralInput);

  // The list and the single-item requests are named after the plural and the singular, so
  // equal names would generate two functions with the same name.
  if (plural.join('-') === singular.join('-')) {
    throw new Error(
      `The plural "${plural.join('-')}" equals the singular. Pass a different --plural.`,
    );
  }

  return { singular: toNames(singular), plural: toNames(plural) };
};
