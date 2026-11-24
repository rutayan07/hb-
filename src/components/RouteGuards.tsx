import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, type ReactNode } from 'react';

import { ScreenLoader } from './ScreenLoader';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../navigation/types';

type GuardProps = {
  children: ReactNode;
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function RequireAuth({ children }: GuardProps) {
  const { status } = useAuth();
  const navigation = useNavigation<Navigation>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [navigation, status]);

  if (status !== 'authenticated') {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: GuardProps) {
  const { status } = useAuth();
  const navigation = useNavigation<Navigation>();

  useEffect(() => {
    if (status === 'authenticated') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  }, [navigation, status]);

  if (status === 'authenticated') {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}
