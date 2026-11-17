import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url({ protocol: /^https?$/ }),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});

export { env };
