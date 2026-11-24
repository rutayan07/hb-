export const DOMAIN_ERROR =
  'Access restricted. Please login using your official domain email.';

export const CONFIG_ERROR =
  'Authentication is not configured. Add your Supabase credentials to the .env file and restart the app.';

export const GENERIC_AUTH_ERROR =
  'Unable to sign in right now. Please try again.';

export const NETWORK_ERROR =
  'Network error. Check your connection and try again.';

export const LOGOUT_ERROR = 'Unable to log out right now. Please try again.';

export function getAuthErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  if (/access_denied|cancelled|canceled/i.test(message)) {
    return 'Google sign-in was cancelled.';
  }

  if (/network|fetch|timeout|offline/i.test(message)) {
    return NETWORK_ERROR;
  }

  if (/domain|restricted/i.test(message)) {
    return DOMAIN_ERROR;
  }

  return GENERIC_AUTH_ERROR;
}
