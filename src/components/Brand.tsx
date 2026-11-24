import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme/theme';

type BrandProps = {
  size?: number;
  showName?: boolean;
};

export function Brand({ size = 34, showName = true }: BrandProps) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: Math.max(radii.md, Math.round(size * 0.24)),
          },
        ]}
      >
        <Text style={[styles.markText, { fontSize: Math.round(size * 0.4) }]}>
          HB
        </Text>
      </View>
      {showName ? <Text style={styles.name}>HB Plus</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: colors.surface,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
