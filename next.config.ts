import type { NextConfig } from 'next';

import './src/env';

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    rules: {
      '*.svg': {
        condition: { not: 'foreign' },
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: { overrides: { removeViewBox: false } },
                  },
                  'prefixIds',
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
