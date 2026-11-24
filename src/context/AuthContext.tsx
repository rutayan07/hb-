import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  ALLOWED_DOMAIN,
  TEST_EMAILS,
  isSupabaseConfigured,
} from '../config/env';
import {
  completeOAuthRedirect,
  endSupabaseSession,
  isOAuthCallbackUrl,
  startGoogleSignIn,
} from '../services/auth';
import { fetchProfile } from '../services/profiles';
import { supabase } from '../services/supabase';
import type { AuthStatus, Profile, UserRole } from '../types/auth';
import { isEmailAllowed } from '../utils/domain';
import {
  CONFIG_ERROR,
  DOMAIN_ERROR,
  GENERIC_AUTH_ERROR,
  LOGOUT_ERROR,
  getAuthErrorMessage,
} from '../utils/errors';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  error: string | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function getMetadataString(user: User, key: string): string | null {
  const value = user.user_metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function isVerifiedGoogleUser(user: User): boolean {
  const provider = user.app_metadata?.provider;
  const providers = user.app_metadata?.providers;
  const signedInWithGoogle =
    provider === 'google' ||
    (Array.isArray(providers) && providers.includes('google'));

  return signedInWithGoogle && Boolean(user.email_confirmed_at);
}

function buildFallbackProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email ?? '',
    full_name:
      getMetadataString(user, 'full_name') ?? getMetadataString(user, 'name'),
    avatar_url:
      getMetadataString(user, 'avatar_url') ??
      getMetadataString(user, 'picture'),
    role: 'user',
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const syncIdRef = useRef(0);

  const applySession = useCallback(async (nextSession: Session | null) => {
    const syncId = ++syncIdRef.current;

    if (!nextSession) {
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      return;
    }

    if (
      !isVerifiedGoogleUser(nextSession.user) ||
      !isEmailAllowed(nextSession.user.email, ALLOWED_DOMAIN, TEST_EMAILS)
    ) {
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      setError(DOMAIN_ERROR);

      try {
        await endSupabaseSession();
      } catch {
        // The local state is still cleared even if the network is unavailable.
      }

      return;
    }

    let loadedProfile: Profile | null = null;

    try {
      loadedProfile = await fetchProfile(nextSession.user.id);
    } catch {
      loadedProfile = null;
    }

    if (syncId !== syncIdRef.current) {
      return;
    }

    setUser(nextSession.user);
    setProfile(loadedProfile ?? buildFallbackProfile(nextSession.user));
    setError(null);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unauthenticated');
      return;
    }

    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer Supabase calls so the auth listener is not blocked.
      setTimeout(() => {
        if (isMounted) {
          void applySession(nextSession);
        }
      }, 0);
    });

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) {
          return;
        }

        if (sessionError) {
          setError(GENERIC_AUTH_ERROR);
          setStatus('unauthenticated');
          return;
        }

        void applySession(data.session);
      })
      .catch(() => {
        if (isMounted) {
          setError(GENERIC_AUTH_ERROR);
          setStatus('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    if (Platform.OS === 'web' || !isSupabaseConfigured) {
      return;
    }

    const handleUrl = (url: string | null) => {
      if (!isOAuthCallbackUrl(url)) {
        return;
      }

      completeOAuthRedirect(url).catch((caughtError: unknown) => {
        setError(getAuthErrorMessage(caughtError));
      });
    };

    void Linking.getInitialURL().then(handleUrl);
    const linkSubscription = Linking.addEventListener('url', ({ url }) =>
      handleUrl(url),
    );

    return () => linkSubscription.remove();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (isSigningIn) {
      return;
    }

    if (!isSupabaseConfigured) {
      setError(CONFIG_ERROR);
      return;
    }

    setError(null);
    setIsSigningIn(true);

    try {
      const result = await startGoogleSignIn();

      if (result.status === 'success') {
        const { data } = await supabase.auth.getSession();
        await applySession(data.session);
      }
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsSigningIn(false);
    }
  }, [applySession, isSigningIn]);

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await endSupabaseSession();
    } catch {
      setError(LOGOUT_ERROR);
    } finally {
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      role: profile?.role ?? null,
      error,
      isSigningIn,
      signInWithGoogle,
      signOut,
    }),
    [
      status,
      user,
      profile,
      error,
      isSigningIn,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
