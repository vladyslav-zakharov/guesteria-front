import { parseArgs } from 'node:util';

import { entityNames } from '../shared/names.mjs';
import { generateEntity } from './entity-generator.mjs';

const USAGE = `Usage: yarn generate:entity <singularName> [--plural <pluralName>]
Example: yarn generate:entity user  ->  src/entities/users/`;

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { plural: { type: 'string' } },
  });

  if (positionals.length !== 1) {
    throw new Error('Pass exactly one entity name.');
  }

  generateEntity(entityNames(positionals[0], values.plural));
} catch (error) {
  console.error(`❌ ${error.message}\n${USAGE}`);
  process.exit(1);
}
