import axios from 'axios';

// Above the back's longest upstream call (the LiteAPI book, 70 s), so the back always
// answers first. Without it, a half-open connection would leave the checkout waiting
// behind its non-dismissible drawer; a timeout arrives with no status and maps like a
// network error (for a book, an unknown outcome).
const REQUEST_TIMEOUT_MS = 75_000;

export const api = axios.create({
  baseURL: '/api',
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
