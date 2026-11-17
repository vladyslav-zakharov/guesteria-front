import { parseArgs } from 'node:util';

import { parseName, toNames } from '../shared/names.mjs';
import { generateFeature } from './feature-generator.mjs';

const USAGE = `Usage: yarn generate:feature <featureName>
Example: yarn generate:feature todoFilters  ->  src/features/todo-filters/`;

try {
  const { positionals } = parseArgs({ allowPositionals: true });

  if (positionals.length !== 1) {
    throw new Error('Pass exactly one feature name.');
  }

  generateFeature(toNames(parseName(positionals[0])));
} catch (error) {
  console.error(`❌ ${error.message}\n${USAGE}`);
  process.exit(1);
}
