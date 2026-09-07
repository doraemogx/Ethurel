import { describe, it, expect } from 'vitest';
import { canRetryTest, type TestSpec } from '@/domain/testSpec';

function spec(repeatability: TestSpec['repeatability']): TestSpec {
  return { id: 't1', repeatability };
}

describe('Fail Forward — TestSpec', () => {
  it('um teste nunca tentado sempre pode ser tentado', () => {
    expect(canRetryTest(spec('oneShot'), [])).toBe(true);
    expect(canRetryTest(spec('lockedAfterFailure'), [])).toBe(true);
  });

  it('repeatable pode ser tentado de novo mesmo depois de falhar', () => {
    expect(canRetryTest(spec('repeatable'), ['t1'])).toBe(true);
  });

  it('lockedAfterFailure e oneShot travam depois de uma falha', () => {
    expect(canRetryTest(spec('lockedAfterFailure'), ['t1'])).toBe(false);
    expect(canRetryTest(spec('oneShot'), ['t1'])).toBe(false);
  });

  it('changedAfterFailure permite tentar de novo (com prompt alterado)', () => {
    expect(canRetryTest(spec('changedAfterFailure'), ['t1'])).toBe(true);
  });
});
