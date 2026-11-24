import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/theme';

type ScreenLoaderProps = {
  label?: string;
};

export function ScreenLoader({ label }: ScreenLoaderProps) {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
