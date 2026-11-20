# VOX ROYALE Native Android

This directory contains the standalone Android application written in Kotlin and Jetpack Compose. It does not use a WebView, Capacitor runtime, or remote website entry point.

## Build

Requirements: JDK 17, Android SDK platform 36, Android build-tools 36.0.0, Gradle 8.13, and Android API 26 or newer.

Configure the public Supabase project values outside source control:

```sh
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```

You can alternatively pass `-PSUPABASE_URL=...` and `-PSUPABASE_PUBLISHABLE_KEY=...` to Gradle. For GitHub Actions, configure repository Actions secrets named `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. The workflow passes them to the build without printing their values. These are public client configuration values only; never put a service-role key or other privileged secret in the Android app.

APK output:

`app/build/outputs/apk/debug/app-debug.apk`

## Current native implementation

- Native Kotlin + Jetpack Compose launcher and five-section bottom navigation: Messages, Rooms, Discover, Moments, and Profile.
- Native Home/Discover, Rooms, Messages, Moments, and Profile screen shells.
- Profile entry points for wallet, VIP, inventory, settings, and help.
- Native Supabase Auth integration for phone SMS OTP and Google OAuth using a PKCE deep-link callback.
- Auth session restoration and refresh are handled by the Supabase Auth SDK.
- A translucent, colored bottom snackbar is used for short in-app notices (2 seconds).
- Unit tests for navigation labels and Supabase configuration validation.
- No fabricated users, rooms, messages, balances, gifts, or inventory items.

## Production readiness status

This is an incremental native migration, not yet a production-complete social app. Supabase Auth is now wired in the native app, but live sign-in still requires provider configuration in the Supabase dashboard. Add `com.voxroyale.app://auth` to Auth → URL Configuration → Additional Redirect URLs. Enable Google and supply the OAuth client credentials; enable Phone and configure an SMS provider (such as Twilio or Vonage). Native database repositories, Realtime subscriptions, storage uploads, Agora voice rooms, wallet/gift transactions, push notifications, full moderation, and device testing remain in progress. Agora native calling/voice-room integration, wallet/gift transactions, push notifications, full moderation, and the remaining screen flows are also pending.

The existing React/Capacitor application and its Supabase migrations remain untouched as the current product/backend reference. A successful debug build alone must not be described as full YallaChat parity or production readiness.
