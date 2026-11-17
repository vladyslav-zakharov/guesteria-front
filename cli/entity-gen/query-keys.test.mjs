import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { withQueryKeys } from './query-keys.mjs';

const KEYS = ['GET_USERS', 'GET_INFINITE_USERS'];

describe('withQueryKeys', () => {
  it('adds the missing keys in front of the closing brace', () => {
    assert.deepEqual(
      withQueryKeys('export enum QueryKeys {\n  GET_TODOS,\n}\n', KEYS),
      {
        added: KEYS,
        content:
          'export enum QueryKeys {\n  GET_TODOS,\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n',
      },
    );
  });

  it('keeps a comment that contains a comma', () => {
    assert.equal(
      withQueryKeys(
        'export enum QueryKeys {\n  // Todos, paginated by the API.\n  GET_TODOS,\n}\n',
        KEYS,
      ).content,
      'export enum QueryKeys {\n  // Todos, paginated by the API.\n  GET_TODOS,\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n',
    );
  });

  it('finds an existing key below a comment', () => {
    assert.deepEqual(
      withQueryKeys(
        'export enum QueryKeys {\n  // Users.\n  GET_USERS,\n}\n',
        KEYS,
      ),
      {
        added: ['GET_INFINITE_USERS'],
        content:
          'export enum QueryKeys {\n  // Users.\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n',
      },
    );
  });

  it('returns the content unchanged when both keys exist', () => {
    const content =
      'export enum QueryKeys {\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n';

    assert.deepEqual(withQueryKeys(content, KEYS), { added: [], content });
  });

  it('adds a comma after a last member that has none', () => {
    assert.equal(
      withQueryKeys('export enum QueryKeys {\n  GET_TODOS\n}\n', KEYS).content,
      'export enum QueryKeys {\n  GET_TODOS,\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n',
    );
    assert.equal(
      withQueryKeys("export enum QueryKeys {\n  GET_TODOS = 'todos'\n}\n", KEYS)
        .content,
      "export enum QueryKeys {\n  GET_TODOS = 'todos',\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n",
    );
  });

  it('leaves commas, braces and $ patterns inside string values alone', () => {
    assert.equal(
      withQueryKeys(
        "export enum QueryKeys {\n  GET_PRICES = 'prices$',\n  GET_X = 'a,b}',\n}\n",
        KEYS,
      ).content,
      "export enum QueryKeys {\n  GET_PRICES = 'prices$',\n  GET_X = 'a,b}',\n  GET_USERS,\n  GET_INFINITE_USERS,\n}\n",
    );
  });

  it('throws when the QueryKeys enum is missing or not closed', () => {
    assert.throws(
      () => withQueryKeys('export const keys = {};\n', KEYS),
      /has no "export enum QueryKeys/,
    );
    assert.throws(
      () => withQueryKeys('export enum QueryKeys {\n  GET_TODOS,\n', KEYS),
      /has no "export enum QueryKeys/,
    );
  });
});
