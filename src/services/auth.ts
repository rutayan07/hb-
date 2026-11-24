import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type GoogleSignInResult =
  | { status: 'redirecting' }
  | { status: 'success' }
  | { status: 'cancelled' };

function getRedirectUrl(): string {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      throw new Error('Web redirect URL is unavailable.');
    }

    return window.location.origin;
  }

  // Expo Go can only receive exp:// links that point back at the dev server.
  const hostUri = Constants.expoConfig?.hostUri;
  if (isRunningInExpoGo() && hostUri) {
    return `exp://${hostUri.replace(/\/+$/, '')}/--/auth/callback`;
  }

  return Linking.createURL('auth/callback', { scheme: 'hbplus' });
}

function parseCallbackParams(url: string): URLSearchParams {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);
  const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;

  if (hash) {
    new URLSearchParams(hash).forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  return params;
}

export async function startGoogleSignIn(): Promise<GoogleSignInResult> {
  const redirectTo = getRedirectUrl();

  if (__DEV__) {
    console.info('[auth] OAuth redirect URL:', redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (Platform.OS === 'web') {
    return { status: 'redirecting' };
  }

  if (!data.url) {
    throw new Error('Google sign-in URL was not returned.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    return { status: 'cancelled' };
  }

  const callbackParams = parseCallbackParams(result.url);
  const oauthError =
    callbackParams.get('error_description') ?? callbackParams.get('error');
  const code = callbackParams.get('code');

  if (oauthError) {
    throw new Error(oauthError);
  }

  if (!code) {
    throw new Error('Google sign-in did not return an authorization code.');
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    throw exchangeError;
  }

  return { status: 'success' };
}

export async function endSupabaseSession(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    throw error;
  }
}
