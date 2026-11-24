export type UserRole = 'user' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
