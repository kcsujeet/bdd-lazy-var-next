import '../../../../dist/global';

declare const def: any;
declare const subject: any;
declare const get: any;
declare var $value: any;
declare var $obj: any;
declare var $nestedValue: any;

describe('Jasmine Native Usage', () => {
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
    def('nestedValue', () => 100);

    it('respects overrides', () => {
      expect(get('nestedValue')).toBe(100);
      expect($nestedValue).toBe(100);
    });

    it('inherits other values', () => {
      expect($obj).toEqual({ id: 1 });
    });
  });
});
