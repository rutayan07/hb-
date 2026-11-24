import { describe, expect, it } from 'vitest';

import { isEmailAllowed, isEmailFromDomain, parseEmailList } from './domain';

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

describe('isEmailAllowed', () => {
  const testEmails = parseEmailList(' Tester@Gmail.com , ');

  it('allows the domain and exact test emails only', () => {
    expect(isEmailAllowed('user@hbplus.fit', 'hbplus.fit', testEmails)).toBe(true);
    expect(isEmailAllowed(' tester@gmail.COM ', 'hbplus.fit', testEmails)).toBe(
      true,
    );
    expect(isEmailAllowed('other@gmail.com', 'hbplus.fit', testEmails)).toBe(false);
    expect(isEmailAllowed('tester@gmail.com.evil', 'hbplus.fit', testEmails)).toBe(
      false,
    );
    expect(isEmailAllowed(null, 'hbplus.fit', testEmails)).toBe(false);
  });

  it('rejects other domains when no test emails are configured', () => {
    expect(isEmailAllowed('tester@gmail.com', 'hbplus.fit')).toBe(false);
  });
});
