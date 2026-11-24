import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme/theme';
import type { UserRole } from '../types/auth';

type RoleBadgeProps = {
  role: UserRole | null;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === 'admin';

  return (
    <View style={[styles.badge, isAdmin ? styles.admin : styles.user]}>
      <Text
        style={[styles.label, isAdmin ? styles.adminLabel : styles.userLabel]}
      >
        {isAdmin ? 'Admin' : 'User'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  admin: {
    backgroundColor: colors.primarySoft,
  },
  user: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  adminLabel: {
    color: colors.primary,
  },
  userLabel: {
    color: colors.textMuted,
  },
});
