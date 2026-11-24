export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@/, '');
}

export function isEmailFromDomain(
  email: string | null | undefined,
  domain: string,
): boolean {
  if (!email || !domain) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDomain = normalizeDomain(domain);
  const parts = normalizedEmail.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  return parts[1] === normalizedDomain;
}
