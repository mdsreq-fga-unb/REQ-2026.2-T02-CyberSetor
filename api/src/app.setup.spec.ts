import { trustProxySetting } from './app.setup.js';

describe('trustProxySetting', () => {
  it.each([
    [undefined, false],
    ['', false],
    ['1', 1],
    [' 2 ', 2],
    ['loopback, linklocal, uniquelocal', 'loopback, linklocal, uniquelocal'],
  ] as [string | undefined, number | string | false][])(
    'converte %j para %j',
    (value, expected) => {
      expect(trustProxySetting(value)).toBe(expected);
    },
  );
});
