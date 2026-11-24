import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '../components/Brand';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { GoogleButton } from '../components/GoogleButton';
import { ALLOWED_DOMAIN } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { colors, radii } from '../theme/theme';

export function LoginScreen() {
  const { signInWithGoogle, isSigningIn, error } = useAuth();

  const handleSignIn = () => {
    void signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.brandWrap}>
            <Brand size={38} />
          </View>

          <Card style={styles.card}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Use your official Google account to access the HB Plus portal.
            </Text>

            <View style={styles.form}>
              {error ? <ErrorBanner message={error} /> : null}
              <GoogleButton
                loading={isSigningIn}
                onPress={handleSignIn}
                disabled={isSigningIn}
              />
            </View>

            <View style={styles.note}>
              <Text style={styles.noteText}>
                Access is restricted to{' '}
                <Text style={styles.domain}>@{ALLOWED_DOMAIN}</Text> email
                addresses.
              </Text>
            </View>
          </Card>

          <Text style={styles.footer}>HB Plus · Internal use only</Text>
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
    maxWidth: 420,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    padding: 26,
    borderRadius: radii.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  form: {
    marginTop: 24,
    gap: 14,
  },
  note: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 22,
    paddingTop: 18,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  domain: {
    color: colors.text,
    fontWeight: '600',
  },
  footer: {
    color: colors.textSubtle,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
