import {
  NavigationContainer,
  type LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import {
  GuestOnly,
  RequireAuth,
} from '../components/RouteGuards';
import { ScreenLoader } from '../components/ScreenLoader';
import { useAuth } from '../hooks/useAuth';
import { AdminScreen } from '../screens/AdminScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { colors } from '../theme/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Login: { path: 'login', alias: ['auth/callback'] },
      Dashboard: 'dashboard',
      Admin: 'admin',
    },
  },
};

function LoginRoute() {
  return (
    <GuestOnly>
      <LoginScreen />
    </GuestOnly>
  );
}

function DashboardRoute() {
  return (
    <RequireAuth>
      <DashboardScreen />
    </RequireAuth>
  );
}

function AdminRoute() {
  return (
    <RequireAuth>
      <AdminScreen />
    </RequireAuth>
  );
}

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <ScreenLoader label="Loading your workspace..." />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={status === 'authenticated' ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginRoute} />
        <Stack.Screen name="Dashboard" component={DashboardRoute} />
        <Stack.Screen name="Admin" component={AdminRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
