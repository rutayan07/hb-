const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
const configuredDomain = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN ?? '').trim();

const isPlaceholderUrl =
  !supabaseUrl ||
  !/^https?:\/\//i.test(supabaseUrl) ||
  supabaseUrl.includes('your-project');

const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey === 'your-anon-key';

export const ALLOWED_DOMAIN =
  configuredDomain.toLowerCase().replace(/^@/, '') || 'hbplus.fit';

export const APP_SCHEME = 'hbplus';

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;

export const missingEnvVars = [
  isPlaceholderUrl ? 'EXPO_PUBLIC_SUPABASE_URL' : null,
  isPlaceholderKey ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY' : null,
].filter((value): value is string => Boolean(value));

export const env = {
  supabaseUrl,
  supabaseAnonKey,
};
