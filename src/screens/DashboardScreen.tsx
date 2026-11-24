import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
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

import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RoleBadge } from '../components/RoleBadge';
import { ALLOWED_DOMAIN } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/theme';
import { formatDate, getDisplayName, getFirstName, getInitials } from '../utils/display';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const { profile, user, role, signOut } = useAuth();
  const navigation = useNavigation<Navigation>();
  const { width } = useWindowDimensions();
  const [loggingOut, setLoggingOut] = useState(false);

  const isCompact = width < 700;
  const isWide = width >= 820;
  const isAdmin = role === 'admin';
  const email = profile?.email || user?.email || '';
  const displayName = getDisplayName(profile?.full_name, email);
  const firstName = getFirstName(profile?.full_name, email);
  const initials = getInitials(profile?.full_name, email);

  const handleSignOut = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <Brand showName={!isCompact} size={32} />

          <View style={styles.headerActions}>
            {isCompact ? (
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{initials}</Text>
              </View>
            ) : (
              <View style={styles.userSummary}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {email}
                </Text>
              </View>
            )}

            <RoleBadge role={role} />

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
              disabled={loggingOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && !loggingOut ? styles.logoutPressed : null,
              ]}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Text style={styles.logoutText}>Log out</Text>
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
          <Text style={styles.title}>Welcome, {firstName}</Text>
          <Text style={styles.subtitle}>
            You are signed in to the HB Plus portal with a verified company
            account.
          </Text>

          <View style={[styles.grid, !isWide ? styles.gridStack : null]}>
            <Card style={isWide ? styles.gridCard : undefined}>
              <Text style={styles.cardTitle}>Account</Text>
              <View style={styles.details}>
                <DetailRow label="Name" value={displayName} />
                <DetailRow label="Email" value={email} />
                <DetailRow
                  label="Role"
                  value={isAdmin ? 'Administrator' : 'User'}
                />
                <DetailRow
                  label="Member since"
                  value={formatDate(profile?.created_at)}
                />
              </View>
            </Card>

            <Card style={isWide ? styles.gridCard : undefined}>
              <Text style={styles.cardTitle}>Access</Text>
              <View style={styles.details}>
                <DetailRow label="Sign-in method" value="Google" />
                <DetailRow label="Allowed domain" value={`@${ALLOWED_DOMAIN}`} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Domain check</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.accessNote}>
                Access is limited to approved HB Plus accounts. Sessions refresh
                automatically while you are signed in.
              </Text>
            </Card>
          </View>

          {isAdmin ? (
            <Card style={styles.adminCard}>
              <View
                style={[styles.adminRow, !isWide ? styles.adminRowStack : null]}
              >
                <View style={styles.adminCopy}>
                  <Text style={styles.cardTitle}>Admin console</Text>
                  <Text style={styles.adminDescription}>
                    Review team members, their email addresses, and assigned
                    roles.
                  </Text>
                </View>
                <Button
                  label="Open admin console"
                  onPress={() => navigation.navigate('Admin')}
                />
              </View>
            </Card>
          ) : null}
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
    justifyContent: 'space-between',
    gap: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userSummary: {
    alignItems: 'flex-end',
    maxWidth: 240,
  },
  userName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logoutPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  logoutText: {
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
    maxWidth: 620,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    marginTop: 26,
  },
  gridStack: {
    flexDirection: 'column',
  },
  gridCard: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  details: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    gap: 16,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  detailValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  verifiedBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  verifiedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  accessNote: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  adminCard: {
    marginTop: 16,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  adminRowStack: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  adminCopy: {
    flexShrink: 1,
  },
  adminDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
});
