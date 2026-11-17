import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { withQueryKeys } from './query-keys.mjs';
import { templates } from './templates.mjs';

const FILES = {
  api: ['get', 'put', 'patch', 'post', 'delete'],
  hooks: ['get', 'put', 'patch', 'post', 'delete'],
  types: ['params', 'payloads', 'responses'],
};

export const generateEntity = ({ singular, plural }) => {
  const root = process.cwd();
  const entityDir = `src/entities/${plural.kebab}`;
  const queryKeysPath = path.join(root, 'src/shared/constants/query-keys.ts');

  if (fs.existsSync(path.join(root, entityDir))) {
    throw new Error(`${entityDir} already exists.`);
  }

  // Read and update QueryKeys before writing anything, so a malformed enum stops the
  // generator without leaving a half-created entity behind.
  const queryKeys = withQueryKeys(fs.readFileSync(queryKeysPath, 'utf8'), [
    `GET_${plural.constant}`,
    `GET_INFINITE_${plural.constant}`,
  ]);

  const written = Object.entries(FILES).flatMap(([segment, files]) => {
    fs.mkdirSync(path.join(root, entityDir, segment), { recursive: true });

    return files.map(file => {
      const filePath = path.join(root, entityDir, segment, `${file}.ts`);

      fs.writeFileSync(
        filePath,
        templates[`${segment}/${file}`]({ singular, plural }),
      );

      return filePath;
    });
  });

  fs.writeFileSync(queryKeysPath, queryKeys.content);
  console.log(`📁 Created ${entityDir}/ (${written.length} files)`);
  console.log(
    queryKeys.added.length > 0
      ? `✨ Added ${queryKeys.added.join(', ')} to QueryKeys`
      : 'QueryKeys already has both keys',
  );

  // The templates are unformatted. eslint --fix applies Prettier and the import order to the
  // new files only, through the local binary, so the generator needs no package manager.
  execFileSync(
    path.join(root, 'node_modules/.bin/eslint'),
    ['--fix', '--max-warnings', '0', ...written, queryKeysPath],
    { stdio: 'inherit' },
  );
  console.log('✅ The generated files pass lint');
};
