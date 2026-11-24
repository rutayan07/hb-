import { describe, expect, it } from 'vitest';

import { isEmailFromDomain } from './domain';

describe('isEmailFromDomain', () => {
  it('accepts addresses from the configured domain', () => {
    expect(isEmailFromDomain('rutayan@hbplus.fit', 'hbplus.fit')).toBe(true);
    expect(isEmailFromDomain('  Rutayan@HBPlus.FIT  ', '@hbplus.fit')).toBe(
      true,
    );
  });

  it('rejects other email providers', () => {
    expect(isEmailFromDomain('example@gmail.com', 'hbplus.fit')).toBe(false);
    expect(isEmailFromDomain('example@outlook.com', 'hbplus.fit')).toBe(false);
  });

  it('rejects subdomains and lookalike domains', () => {
    expect(isEmailFromDomain('user@team.hbplus.fit', 'hbplus.fit')).toBe(false);
    expect(isEmailFromDomain('user@hbplus.fit.example.com', 'hbplus.fit')).toBe(
      false,
    );
    expect(isEmailFromDomain('user@hbplusfit.com', 'hbplus.fit')).toBe(false);
  });

  it('rejects malformed addresses', () => {
    expect(isEmailFromDomain('user@hbplus.fit@gmail.com', 'hbplus.fit')).toBe(
      false,
    );
    expect(isEmailFromDomain('user@', 'hbplus.fit')).toBe(false);
    expect(isEmailFromDomain('@hbplus.fit', 'hbplus.fit')).toBe(false);
    expect(isEmailFromDomain(null, 'hbplus.fit')).toBe(false);
    expect(isEmailFromDomain('user@hbplus.fit', '')).toBe(false);
  });
});
