import * as ExpoCrypto from 'expo-crypto';
import { Platform } from 'react-native';

// Hermes has no WebCrypto. Supabase needs it to hash the PKCE code verifier
// with SHA-256; without it the flow silently downgrades to the plain method.
if (Platform.OS !== 'web') {
  const globalScope = globalThis as unknown as {
    crypto?: Record<string, unknown>;
  };
  const cryptoObject = globalScope.crypto ?? {};

  if (typeof cryptoObject.getRandomValues !== 'function') {
    cryptoObject.getRandomValues = ExpoCrypto.getRandomValues;
  }

  if (!cryptoObject.subtle) {
    cryptoObject.subtle = {
      digest: (algorithm: string, data: BufferSource) =>
        ExpoCrypto.digest(algorithm as ExpoCrypto.CryptoDigestAlgorithm, data),
    };
  }

  globalScope.crypto = cryptoObject;
}
