import { sha256 } from '@noble/hashes/sha2.js';
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type NativeCrypto = {
  getRandomValues?: (array: ArrayBufferView) => void;
};

// Hermes has no WebCrypto. Supabase needs it to hash the PKCE code verifier
// with SHA-256; without it the flow silently downgrades to the plain method.
if (Platform.OS !== 'web') {
  const globalScope = globalThis as unknown as {
    crypto?: Record<string, unknown>;
  };
  const cryptoObject = globalScope.crypto ?? {};
  const nativeCrypto = requireOptionalNativeModule<NativeCrypto>('ExpoCrypto');

  if (typeof cryptoObject.getRandomValues !== 'function') {
    cryptoObject.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
      if (nativeCrypto?.getRandomValues) {
        nativeCrypto.getRandomValues(array);
        return array;
      }

      // Only reached in Expo Go builds that ship without ExpoCrypto. This
      // matches Supabase's own fallback when no secure source exists.
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }

  if (!cryptoObject.subtle) {
    cryptoObject.subtle = {
      digest: async (algorithm: string, data: ArrayBufferView | ArrayBuffer) => {
        if (algorithm.toUpperCase() !== 'SHA-256') {
          throw new Error(`Unsupported digest algorithm: ${algorithm}`);
        }

        const bytes =
          data instanceof ArrayBuffer
            ? new Uint8Array(data)
            : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return sha256(bytes).slice().buffer;
      },
    };
  }

  globalScope.crypto = cryptoObject;
}
