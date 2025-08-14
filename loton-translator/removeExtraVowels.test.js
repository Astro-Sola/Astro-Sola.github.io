import { describe, it, expect } from 'vitest';
import { removeExtraVowels } from './loton-translator.js';

describe('removeExtraVowels', () => {
  it('removes characters after the third vowel', () => {
    expect(removeExtraVowels('aeroplane')).toBe('aero');
    expect(removeExtraVowels('queueing')).toBe('queu');
    expect(removeExtraVowels('aaab')).toBe('aaa');
    expect(removeExtraVowels('hello')).toBe('hello');
  });
});
