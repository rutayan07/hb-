export function getDisplayName(
  fullName?: string | null,
  email?: string | null,
): string {
  const name = fullName?.trim();

  if (name) {
    return name;
  }

  const emailName = email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return emailName || 'there';
}

export function getFirstName(
  fullName?: string | null,
  email?: string | null,
): string {
  return getDisplayName(fullName, email).split(/\s+/)[0];
}

export function getInitials(
  fullName?: string | null,
  email?: string | null,
): string {
  const name = getDisplayName(fullName, email);
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
