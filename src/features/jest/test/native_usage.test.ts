import '../../../../dist/global';

declare const def: any;
declare const subject: any;
declare const get: any;
declare var $value: any;
declare var $obj: any;

// Restore native expect if it was overwritten by config
// In a real project, config.ts wouldn't be loaded for native tests
// But here we are running in the same environment
// However, Jest's expect is usually on the global object, and config.ts overwrites it.
// We need to avoid loading config.ts or restore the original expect.
// Since config.ts is loaded by setup.ts which is configured in package.json, we can't easily avoid it.
// But wait, Jest puts expect on global.
// Let's try to see if we can access the original expect.
// Actually, the issue is that `src/features/jest/setup.ts` requires `src/test/config.ts` which does `(global as any).expect = chai.expect`.
// This overwrites Jest's native expect.
// For this specific test file, we want the native expect.
// But we can't easily get it back if it was overwritten before this file runs.
// UNLESS we run this test without the setup file.
// But the setup file is defined in package.json.

// Alternative: Use a different config for this test or manually restore it if possible.
// Jest might keep a copy? No standard way.

// Let's try to use `jest` directly without the setup file for this test?
// Or we can modify `src/test/config.ts` to not overwrite if a flag is set?
// Or we can just use `expect` from `@jest/globals` if we were using ESM, but we are in a mixed env.

// Let's try to import expect from 'expect' package if available? Jest includes it.
// Or just accept that for THIS repo's test suite, we are stuck with Chai unless we change the setup.

// Wait, the user wants to verify it works "in any codebase where bun is used" (or Jest).
// So we should simulate that environment.
// The best way is to run a test command that DOES NOT include the `setupFilesAfterEnv`.

describe('Jest Native Usage', () => {
  def('value', () => 42);
  def('obj', () => ({ id: 1 }));
  subject(() => 'main subject');

  it('works with native expect and get()', () => {
    expect(get('value')).toBe(42);
    expect(get('obj')).toEqual({ id: 1 });
    expect(get('subject')).toBe('main subject');
  });

  it('works with native expect and global accessors ($)', () => {
    expect($value).toBe(42);
    expect($obj).toEqual({ id: 1 });
  });

  describe('nested context', () => {
    def('value', () => 100);

    it('respects overrides', () => {
      expect(get('value')).toBe(100);
      expect($value).toBe(100);
    });

    it('inherits other values', () => {
      expect($obj).toEqual({ id: 1 });
    });
  });
});
