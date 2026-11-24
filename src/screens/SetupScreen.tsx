import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '../components/Brand';
import { Card } from '../components/Card';
import { missingEnvVars } from '../config/env';
import { colors, radii } from '../theme/theme';

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export function SetupScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.brandWrap}>
            <Brand size={38} />
          </View>

          <Card>
            <Text style={styles.title}>Setup required</Text>
            <Text style={styles.body}>
              Authentication is not configured yet. Add your Supabase project
              URL and anon key to a .env file in the project root, then restart
              the development server.
            </Text>

            <View style={styles.envList}>
              {missingEnvVars.map((name) => (
                <Text key={name} style={styles.envName}>
                  {name}
                </Text>
              ))}
            </View>

            <Text style={styles.body}>
              Use .env.example as the template. See README.md for the full
              Supabase and Google OAuth setup.
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  container: {
    width: '100%',
    maxWidth: 460,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  envList: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    marginTop: 18,
    gap: 8,
  },
  envName: {
    color: colors.text,
    fontFamily: monoFont,
    fontSize: 12,
  },
});
