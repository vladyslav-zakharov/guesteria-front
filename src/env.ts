import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const env = createEnv({
  server: {
    BACKEND_API_URL: z.url({ protocol: /^https?$/ }),
  },
  client: {},
  runtimeEnv: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
  emptyStringAsUndefined: true,
});

export { env };
