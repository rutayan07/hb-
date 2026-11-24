# HB Plus Portal

A cross-platform React Native application for Android, iOS, and the web. Users
sign in with Google, and access is limited to verified `@hbplus.fit` email
accounts. The app includes a protected dashboard, role-based access, and a
small admin console.

Built with Expo SDK 58, React Native Web, React Navigation, Supabase Auth, and
Supabase Postgres.

## Features

- Google OAuth sign-in on web and native
- Exact email-domain validation (`@hbplus.fit` only)
- Protected dashboard and admin routes
- Admin and user roles stored in the database
- Supabase Row Level Security (RLS) for profile data
- Loading states, error messages, and logout
- Responsive UI that shares one codebase across mobile and web
- PKCE auth flow with automatic session refresh

## Tech stack

| Layer | Technology |
| --- | --- |
| App | React Native 0.88, Expo SDK 58, TypeScript |
| Web | React Native Web |
| Navigation | React Navigation 7 |
| Auth | Supabase Auth with Google OAuth 2.0 |
| Database | Supabase Postgres with RLS |
| Tests | Vitest |

## Project structure

```text
.
├── App.tsx
├── src
│   ├── components      Reusable UI and route guards
│   ├── config          Environment configuration
│   ├── context         Authentication state
│   ├── hooks           useAuth hook
│   ├── navigation      Stack navigator and route types
│   ├── screens         Login, Dashboard, Admin, Setup
│   ├── services        Supabase client, auth, profiles
│   ├── theme           Colors, spacing, radii
│   ├── types           Shared TypeScript types
│   └── utils           Domain validation, formatting, errors
├── supabase
│   └── schema.sql      Tables, trigger, and RLS policies
└── .env.example
```

## Setup

### Prerequisites

- Node.js 20 or newer and npm
- A Supabase project
- A Google Cloud project with an OAuth consent screen
- For native builds: Android Studio (Android) or macOS with Xcode (iOS)

### 1. Install dependencies

```bash
git clone https://github.com/rutayan07/hb-.git
cd hb-
npm install
```

### 2. Create the Supabase database

Open your Supabase project, go to **SQL Editor**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and run it.

The script creates:

- `public.profiles` with `full_name`, `email`, `role`, and `created_at`
- a trigger that creates a profile for allowed-domain users
- RLS policies that let users read their own profile and admins read all
  profiles
- an `is_allowed_email()` function used by the database policies

No client-side insert, update, or delete policies are provided for profiles.
Roles are changed by an administrator in the database.

### 3. Configure Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/):

1. Configure the **OAuth consent screen**. For an `@hbplus.fit` Google
   Workspace, **Internal** can be used. For testing with personal accounts,
   choose **External** and add test users.
2. Go to **Credentials** and create an **OAuth client ID** of type **Web
   application**.
3. Add these URLs:

   **Authorized JavaScript origins**

   ```text
   http://localhost:8081
   ```

   **Authorized redirect URIs**

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   Replace `YOUR_PROJECT_REF` with your Supabase project reference.

4. Copy the client ID and client secret.

One **Web application** client is enough for web, Android, and iOS. The app
never talks to Google directly: every platform opens Supabase's authorize URL,
Google redirects back to Supabase, and Supabase redirects to the app. Separate
Android/iOS OAuth clients are only needed for the native Google Sign-In SDK,
which this project does not use.

In Supabase, go to **Authentication > Sign In / Providers > Google**, enable
Google, and paste the client ID and secret.

### 4. Configure Supabase redirect URLs

In Supabase, go to **Authentication > URL Configuration**:

**Site URL**

```text
http://localhost:8081
```

**Redirect URLs**

```text
http://localhost:8081
http://localhost:19006
hbplus://auth/callback
exp://**
http://192.168.*.*:8081
```

- `hbplus://auth/callback` is used by Android and iOS builds.
- `exp://**` is used when testing in Expo Go on a phone.
- `http://192.168.*.*:8081` allows the web app to be opened from a phone on the
  same Wi-Fi network.

Add your deployed web URL here as well when you deploy the app.

### 5. Add environment variables

Copy the example file:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in the values from **Supabase > Project Settings > API**:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
```

Use the **anon public** key. Never put the `service_role` key in the app.

Restart the development server after changing `.env`.

### 6. Run the app

Web:

```bash
npm run web
```

Open `http://localhost:8081`.

Android:

```bash
npm run android
```

iOS (macOS only):

```bash
npm run ios
```

The native scripts use `expo run`, which creates a development build with the
`hbplus://` URL scheme.

### Testing on a phone

The quickest option is **Expo Go**:

1. Install **Expo Go** from the Play Store or App Store.
2. Connect the phone and computer to the same Wi-Fi network.
3. Run `npx expo start` and scan the QR code (Expo Go on Android, Camera app on
   iOS).
4. Tap **Continue with Google**. The redirect returns to Expo Go through
   `exp://<your-ip>:8081/--/auth/callback`, which is allowed by `exp://**`.

If the app does not load on the phone (different network, router isolation, or
mobile data), use the tunnel instead. It works from any network:

```bash
npm run start:tunnel
```

On Android, scan the QR code from inside the Expo Go app, not the camera.

To test the web build in a phone browser, run `npx expo start --web --host lan`
and open `http://<your-computer-ip>:8081` on the phone.

### 7. Create the first admin

Sign in once with an `@hbplus.fit` account, then run this in the Supabase SQL
Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'you@hbplus.fit';
```

Reload the app. The admin console link appears on the dashboard.

## Authentication flow

1. The user taps **Continue with Google**.
2. On web, the browser is redirected to Supabase's Google OAuth flow. On
   mobile, an in-app auth browser opens and returns through
   `hbplus://auth/callback` (or the `exp://` URL in Expo Go).
3. Supabase completes the OAuth exchange using PKCE and returns a session.
4. `AuthProvider` verifies that the session came from Google with a confirmed
   email, then checks the email against the allowed domain.
5. If the provider or domain is wrong, the app immediately signs the user out
   and shows:

   > Access restricted. Please login using your official domain email.

6. If the account is valid, the app loads the user's profile and role from
   Postgres, then renders the dashboard.
7. Logout clears the local Supabase session. The route guard returns the user
   to the login page.

## How domain restriction works

The restriction is enforced at three levels.

### 1. Exact email check

`src/utils/domain.ts` splits the email at `@`, requires exactly one separator,
and compares the domain with the configured value. Checks are case-insensitive
and ignore surrounding spaces, but they reject subdomains and lookalikes:

| Email | Allowed |
| --- | --- |
| `user@hbplus.fit` | Yes |
| `USER@HBPLUS.FIT` | Yes |
| `user@gmail.com` | No |
| `user@team.hbplus.fit` | No |
| `user@hbplus.fit.example.com` | No |
| `user@hbplus.fit@gmail.com` | No |

Unit tests cover these cases:

```bash
npm test
```

The session is also required to come from Google with a Supabase-confirmed
email. Enabling another Supabase auth provider cannot be used to register an
allowed-domain email and bypass the Google flow.

### 2. Protected routes

`RequireAuth` in `src/components/RouteGuards.tsx` only renders a protected
screen when the session is authenticated. If the user opens `/dashboard` or
`/admin` directly without a session, the navigator resets to `/login`.
`GuestOnly` prevents a signed-in user from staying on the login page.

The admin console also checks `profile.role === 'admin'` before rendering user
data.

### 3. Database policies

Supabase RLS is the final boundary. Even if someone bypasses the UI,
unauthenticated requests and users from other domains cannot read profile rows.
The `profiles_select_own_or_admin` policy requires an allowed-domain email and
allows only:

- the signed-in user's own profile, or
- all profiles when the signed-in user is an admin

The profile creation trigger only inserts profiles for `@hbplus.fit` accounts.
The app never writes roles from the client.

> The Google account is authenticated by Supabase before the client-side domain
> check runs. A rejected account is signed out immediately and has no profile
> or data access. For stricter account-level blocking before a Supabase user is
> created, enable a Supabase **Before User Created** auth hook or restrict the
> Google consent screen to your Workspace organization.

## Role-based access

- New profiles receive the `user` role.
- Admins are promoted with a SQL update (see step 7).
- The dashboard shows the admin console link only for admins.
- The admin console lists all profiles using an RLS-protected query.
- A non-admin who opens `/admin` directly sees an access-denied page.
- Role changes are read from the database on each session sync.

## Routes

| Route | Access |
| --- | --- |
| `/` | Login page, or dashboard if already signed in |
| `/login` | Signed-out users |
| `/dashboard` | Authenticated `@hbplus.fit` users |
| `/admin` | Authenticated admins only |

## Token and session handling

- Supabase JS manages the access and refresh tokens.
- The app uses the PKCE flow and enables automatic token refresh.
- Only Google sessions with a confirmed email and an allowed-domain address are
  accepted.
- Tokens are persisted by Supabase's session storage (AsyncStorage on native,
  browser storage on web) and are never handled or logged manually.
- The Supabase anon key is safe to expose only because RLS protects the data.
- No service-role key is included in the client.
- Signing out clears the local session.

For a higher-security production deployment, consider server-side session
validation and encrypted/secure storage, especially on shared devices.

## Scripts

| Command | Description |
| --- | --- |
| `npm run web` | Start the web app |
| `npm run android` | Create and run an Android development build |
| `npm run ios` | Create and run an iOS development build |
| `npm start` | Start the Expo development server |
| `npm test` | Run domain validation tests |
| `npm run typecheck` | Run the TypeScript compiler |

## Troubleshooting

**The setup screen appears instead of the login page**

`.env` is missing, still contains placeholders, or the dev server was not
restarted after adding it. Copy `.env.example` to `.env` and restart.

**`redirect_uri_mismatch` from Google**

The Google OAuth client must have
`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as an authorized
redirect URI. The Supabase project must have `http://localhost:8081` (and
`hbplus://auth/callback` for native) in its redirect allow list.

**Native sign-in opens Google but does not return to the app**

Confirm `hbplus://auth/callback` (app builds) and `exp://**` (Expo Go) are
listed in Supabase's redirect URLs and that `scheme` in `app.json` is `hbplus`.
If Supabase does not recognize the redirect URL, it falls back to the Site URL
and the in-app browser stays open.

**The admin link does not appear**

The user's profile role is still `user`, the schema was not run, or the
profile was created before the trigger was installed. Run the schema script and
the admin SQL update, then sign out and sign in again.

**Google shows "Access blocked" instead of the app**

If the OAuth consent screen is in testing mode, add the Google account under
**Audience > Test users**. An **Internal** consent screen only accepts accounts
inside the Google Workspace organization. An account from another domain must
complete Google sign-in before this app can show its own domain error.

## Changing the allowed domain

Update the domain in both places:

1. `EXPO_PUBLIC_ALLOWED_DOMAIN` in `.env`
2. `@hbplus\.fit` inside `public.is_allowed_email()` in
   `supabase/schema.sql`, then re-run that function in the SQL Editor

Domain checks in the app are exact matches, so `@hbplus.fit` does not allow
`@mail.hbplus.fit`. Profiles from the old domain remain in the database but are
no longer readable through RLS; remove or migrate them separately if needed.

## Test accounts outside the domain

For testing without a company account, individual addresses can be allowed.
Every other non-domain account is still rejected. Add the address in both
places:

1. `.env` (comma-separated, exact matches only):

   ```dotenv
   EXPO_PUBLIC_TEST_EMAILS=tester@gmail.com
   ```

2. Supabase SQL Editor:

   ```sql
   insert into private.allowed_test_emails (email, note)
   values ('tester@gmail.com', 'Test account');
   ```

Remove both entries to restore strict domain-only access. The `private` schema
is not exposed through the Supabase API, so clients cannot read or modify the
list.
