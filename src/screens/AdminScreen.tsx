import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { RoleBadge } from '../components/RoleBadge';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../navigation/types';
import { fetchProfiles } from '../services/profiles';
import { colors } from '../theme/theme';
import type { Profile } from '../types/auth';
import { formatDate, getDisplayName, getInitials } from '../utils/display';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function AdminScreen() {
  const { role, signOut } = useAuth();
  const navigation = useNavigation<Navigation>();
  const { width } = useWindowDimensions();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = role === 'admin';
  const isCompact = width < 700;

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextProfiles = await fetchProfiles();
      setProfiles(nextProfiles);
    } catch {
      setError('Unable to load team members. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      void loadProfiles();
    }
  }, [isAdmin, loadProfiles]);

  const handleSignOut = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
  };

  if (!isAdmin) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.deniedWrap}>
          <Card style={styles.deniedCard}>
            <Text style={styles.deniedTitle}>Administrator access required</Text>
            <Text style={styles.deniedText}>
              This page is available to HB Plus administrators only.
            </Text>
            <Button
              label="Back to dashboard"
              onPress={() => navigation.navigate('Dashboard')}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const countLabel = `${profiles.length} ${
    profiles.length === 1 ? 'member' : 'members'
  }`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerSide}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Dashboard')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed ? styles.headerButtonPressed : null,
              ]}
            >
              <Text style={styles.headerButtonText}>Back</Text>
            </Pressable>
          </View>

          <Text style={styles.headerTitle}>Admin console</Text>

          <View style={[styles.headerSide, styles.headerSideRight]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
              disabled={loggingOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && !loggingOut ? styles.headerButtonPressed : null,
              ]}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Text style={styles.headerButtonText}>Log out</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
          <Text style={styles.title}>Team members</Text>
          <Text style={styles.subtitle}>
            Accounts with access to the HB Plus portal.
          </Text>

          <View style={styles.toolbar}>
            <Text style={styles.count}>{countLabel}</Text>
            <Button
              label="Refresh"
              onPress={() => void loadProfiles()}
              variant="secondary"
              loading={loading}
              disabled={loading}
            />
          </View>

          {error ? (
            <View style={styles.errorWrap}>
              <ErrorBanner message={error} />
            </View>
          ) : null}

          <Card style={styles.listCard}>
            {loading ? (
              <View style={styles.listState}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.listStateText}>Loading team members...</Text>
              </View>
            ) : profiles.length === 0 ? (
              <View style={styles.listState}>
                <Text style={styles.emptyTitle}>No members found</Text>
                <Text style={styles.listStateText}>
                  No profiles are available yet.
                </Text>
              </View>
            ) : (
              profiles.map((member, index) => {
                const isLast = index === profiles.length - 1;

                return (
                  <View
                    key={member.id}
                    style={[styles.memberRow, isLast ? styles.memberRowLast : null]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(member.full_name, member.email)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {getDisplayName(member.full_name, member.email)}
                      </Text>
                      <Text style={styles.memberEmail} numberOfLines={1}>
                        {member.email}
                      </Text>
                    </View>

                    <View style={styles.memberSide}>
                      <RoleBadge role={member.role} />
                      {!isCompact ? (
                        <Text style={styles.memberDate}>
                          Joined {formatDate(member.created_at)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  headerButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  headerButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  headerButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
  },
  contentInner: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 22,
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  errorWrap: {
    marginTop: 12,
  },
  listCard: {
    marginTop: 12,
    padding: 0,
    overflow: 'hidden',
  },
  listState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  listStateText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  memberEmail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  memberSide: {
    alignItems: 'flex-end',
    gap: 4,
  },
  memberDate: {
    color: colors.textSubtle,
    fontSize: 11,
  },
  deniedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deniedCard: {
    width: '100%',
    maxWidth: 420,
  },
  deniedTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  deniedText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
});
