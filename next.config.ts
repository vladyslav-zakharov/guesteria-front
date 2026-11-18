import path from 'node:path';

import type { NextConfig } from 'next';

import { env } from './src/env';

// Page responses only: the back sets its own headers on /api, and these would collide.
// No script-src: Next's inline scripts would need a per-request nonce, which forces
// dynamic rendering. These directives break nothing and stop framing, <base> and plugin
// injection.
const PAGE_SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy',
    value:
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/((?!api(?:/|$)).*)',
        headers: PAGE_SECURITY_HEADERS,
      },
    ];
  },
  async rewrites() {
    return [
      // Same-origin proxy: keeps the access_token cookie first-party (SameSite=Lax) on *.vercel.app.
      {
        source: '/api/:path*',
        destination: `${env.BACKEND_API_URL}/api/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  turbopack: {
    // A lockfile further up the tree (a stray ~/package-lock.json, for example) would
    // otherwise be taken as the workspace root. Next compiles this file to CommonJS, so
    // __dirname is this project's folder.
    root: path.resolve(__dirname),
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
