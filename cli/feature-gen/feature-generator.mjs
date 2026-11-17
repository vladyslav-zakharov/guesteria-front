import fs from 'node:fs';
import path from 'node:path';

const SEGMENTS = ['ui', 'hooks', 'lib', 'schemas', 'types'];

export const generateFeature = ({ kebab }) => {
  const featureDir = `src/features/${kebab}`;

  if (fs.existsSync(path.join(process.cwd(), featureDir))) {
    throw new Error(`${featureDir} already exists.`);
  }

  SEGMENTS.forEach(segment => {
    const segmentPath = path.join(process.cwd(), featureDir, segment);

    fs.mkdirSync(segmentPath, { recursive: true });
  });

  console.log(`📁 Created ${featureDir}/ with ${SEGMENTS.join(', ')}`);
};
