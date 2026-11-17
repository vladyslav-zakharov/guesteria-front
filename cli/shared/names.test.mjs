import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { entityNames, parseName, pluralizeWord } from './names.mjs';

describe('parseName', () => {
  it('accepts camelCase, PascalCase and kebab-case as the same words', () => {
    assert.deepEqual(parseName('userProfile'), ['user', 'profile']);
    assert.deepEqual(parseName('UserProfile'), ['user', 'profile']);
    assert.deepEqual(parseName('user-profile'), ['user', 'profile']);
    assert.deepEqual(parseName('user'), ['user']);
    assert.deepEqual(parseName('oauth2Token'), ['oauth2', 'token']);
  });

  it('rejects anything that is not letters, digits and single hyphens', () => {
    [
      '',
      '1user',
      'user profile',
      'user_profile',
      'user/../x',
      'user.ts',
      '-user',
      'user-',
      'user--x',
    ].forEach(input =>
      assert.throws(() => parseName(input), /is not a valid name/),
    );
    assert.throws(() => parseName(undefined), /is not a valid name/);
  });
});

describe('pluralizeWord', () => {
  it('applies the regular English rules', () => {
    assert.equal(pluralizeWord('user'), 'users');
    assert.equal(pluralizeWord('todo'), 'todos');
    assert.equal(pluralizeWord('category'), 'categories');
    assert.equal(pluralizeWord('day'), 'days');
    assert.equal(pluralizeWord('address'), 'addresses');
    assert.equal(pluralizeWord('box'), 'boxes');
    assert.equal(pluralizeWord('match'), 'matches');
    assert.equal(pluralizeWord('wish'), 'wishes');
  });
});

describe('entityNames', () => {
  it('derives every identifier form for the singular and the plural', () => {
    assert.deepEqual(entityNames('user'), {
      singular: {
        camel: 'user',
        pascal: 'User',
        kebab: 'user',
        constant: 'USER',
      },
      plural: {
        camel: 'users',
        pascal: 'Users',
        kebab: 'users',
        constant: 'USERS',
      },
    });
  });

  it('pluralizes only the last word', () => {
    assert.deepEqual(entityNames('userProfile').plural, {
      camel: 'userProfiles',
      pascal: 'UserProfiles',
      kebab: 'user-profiles',
      constant: 'USER_PROFILES',
    });
  });

  it('takes an irregular plural from --plural', () => {
    assert.equal(entityNames('person', 'people').plural.kebab, 'people');
  });

  it('rejects a plural equal to the singular', () => {
    assert.throws(() => entityNames('news', 'news'), /equals the singular/);
  });
});
