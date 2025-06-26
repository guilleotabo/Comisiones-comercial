const { formatNumber, calcularMultiplicador } = require('../app');

describe('formatNumber', () => {
  test('formats with thousands separators', () => {
    expect(formatNumber(1234567.89)).toBe('1.234.568');
  });
});

describe('calcularMultiplicador', () => {
  test('returns correct multiplier for conversion', () => {
    expect(calcularMultiplicador('conversion', 9)).toBe(1.0);
  });

  test('returns 0 for unknown type', () => {
    expect(calcularMultiplicador('unknown', 5)).toBe(0);
  });
});
