# SOP: Web App vs Android App — Standard Operating Procedure for Claude Code

This document defines **exactly when and how** Claude Code should handle changes for the web app and Android app. The two are separate builds from the same `src/` codebase.

---

## Core Rule

**The web app is live-reloading. The Android APK is a frozen snapshot.**

| Artifact | How it gets code | Update mechanism |
|----------|-----------------|------------------|
| Web (dev) | `npm run dev` serves `src/` live | Instant on file save |
| Web (prod) | Vercel auto-deploys from `main` | Push to `main` triggers deploy |
| Android APK | Bundles `dist/` at build time | Must rebuild + reinstall APK |

A code change in `src/` is **invisible to Android** until you rebuild. There is no OTA update, no hot-reload, no sync. The APK must be rebuilt and reinstalled on the device.

---

## Decision Matrix

Use this to determine what to do when the user requests a change:

### Step 1: Identify the scope

| User says | Scope | Action after code edit |
|-----------|-------|----------------------|
| "Fix this" / "Change this" (no platform mentioned) | **Web only** | Done. No rebuild. |
| "Fix this on web" | **Web only** | Done. No rebuild. |
| "Fix this on Android" | **Android** | Rebuild APK (Procedure B). |
| "Fix this on both" / "Fix this everywhere" | **Both** | Rebuild APK (Procedure B). |
| "Build Android" / "Update the APK" / "Rebuild" | **Android build only** | Run Procedure B (no code edits). |
| "Deploy" / "Push to production" | **Web prod** | Push to `main`. Vercel handles it. |

**Default assumption:** If the user does not specify a platform, treat it as **web only**.

### Step 2: Identify what changed

| What changed | Affects web? | Affects Android? | Android rebuild needed? |
|-------------|-------------|-----------------|----------------------|
| Any file in `src/` (components, contexts, utils, types) | Yes | Yes, but only after rebuild | Only if user requested Android |
| `capacitor.config.ts` | No | Yes | Yes |
| `build-android.sh` | No | Yes (build process) | Yes, if building |
| `package.json` (new dependency) | Yes | Yes | Yes — new deps must be bundled |
| `vite.config.ts` | Yes (dev server + build) | Yes (build output changes) | Yes, if building |
| `vercel.json` | Yes (prod headers/routing) | No | No |
| `public/` static assets | Yes | Yes | Yes, if building |
| `supabase-schema.sql` | Neither directly — run in Supabase SQL Editor | Neither | No |
| `.env.local` / `.env.example` | Web dev only | No (Android uses hardcoded creds in build script) | No |

---

## Procedure A: Web-Only Change

This is the default procedure. Use when no Android rebuild is requested.

```
1. Edit source files in src/
2. Verify change works (if dev server is running, changes are live)
3. git add <changed files>
4. git commit -m "<type>: <description>"
5. git push   (auto-deploys to Vercel production)
```

**That's it.** No build commands, no sync, no APK.

### When web prod needs a cache-bust

If a user reports the production site shows stale content after push:
```bash
# Trigger a fresh Vercel deploy
git commit --allow-empty -m "chore: trigger Vercel rebuild to clear cache"
git push
```

---

## Procedure B: Android APK Rebuild

Use when the user explicitly requests Android changes or an APK rebuild.

### Prerequisites
- Java 17 installed (macOS Homebrew: `/opt/homebrew/opt/openjdk@17`)
- `android/` directory exists (run `npx cap add android` if missing)
- Dependencies installed (`npm install`)

### Steps

```bash
# Option 1: Use the build script (recommended — handles everything)
./build-android.sh

# Option 2: Manual steps (if build script fails or needs customization)
npm run build                    # Step 1: Build web assets into dist/
npx cap sync android             # Step 2: Copy dist/ into android project
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
cd android && ./gradlew assembleDebug && cd ..   # Step 3: Build APK
```

### Output
```
APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### After building
- The APK must be **manually installed** on the device/emulator
- The previously installed APK does NOT auto-update
- If testing on a connected device: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

---

## Procedure C: Both Platforms

When the user says "fix this on both" or "fix this everywhere":

```
1. Edit source files in src/
2. git add + commit + push        (web is now deployed via Vercel)
3. Run Procedure B                (rebuild Android APK)
```

The order matters: commit first so the web deploy is clean, then rebuild Android from the same committed code.

---

## Platform-Specific Code Locations

These files contain `Capacitor.isNativePlatform()` branching — changes here behave differently on web vs Android:

| File | What it branches on |
|------|-------------------|
| `src/contexts/AuthContext.tsx` | Google Sign-In: OAuth redirect (web) vs native SDK (Android) |
| `src/components/FullUnitCalculator.tsx` | PDF export: browser download (web) vs filesystem + share dialog (Android) |
| `src/hooks/useAndroidBackButton.ts` | Hardware back button — only active on Android |
| `src/hooks/useMobileDetection.ts` | Exposes `isMobile`, `isNative`, `platform` flags |

**When editing these files:** The web branch and mobile branch are in the same file behind `if (Capacitor.isNativePlatform())` guards. Be precise about which branch you're modifying.

### Auth flow divergence (AuthContext.tsx)

```
Web Google Sign-In:
  supabase.auth.signInWithOAuth({ provider: 'google' })
  → Browser redirect to Google → redirect back → session set

Android Google Sign-In:
  GoogleAuth.signIn()  (native SDK)
  → Returns idToken
  → supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
  → Session set
```

Changing one flow does not affect the other. But both share the same `onAuthStateChange` listener and profile loading logic.

### PDF export divergence (FullUnitCalculator.tsx)

```
Web:    html2canvas → jsPDF → browser download (blob URL)
Android: html2canvas → jsPDF → Capacitor Filesystem.writeFile → Share.share()
```

---

## Configuration Files That Affect Each Platform

### Web only
| File | Purpose |
|------|---------|
| `vercel.json` | Production routing, headers, caching |
| `.env.local` | Dev environment variables |
| `vite.config.ts` | Dev server config (port 3000, aliases) |

### Android only
| File | Purpose |
|------|---------|
| `capacitor.config.ts` | App ID, plugins (SplashScreen, StatusBar, GoogleAuth) |
| `build-android.sh` | Build script with hardcoded Supabase credentials |
| `android/` directory | Native Android project (gitignored) |

### Both platforms
| File | Purpose |
|------|---------|
| `package.json` | Dependencies used by both web and bundled Android |
| `src/**/*` | All application source code |
| `public/` | Static assets bundled into both |
| `tsconfig.json` | TypeScript config affects build output |

---

## Common Gotchas

### 1. "I changed the code but Android still shows the old version"
The APK was not rebuilt. Run `./build-android.sh` and reinstall.

### 2. "I added a new npm dependency but Android crashes"
New dependencies must be bundled into the APK. Run:
```bash
npm install
./build-android.sh
```

### 3. "Google Sign-In works on web but not Android"
These are completely separate auth flows. Check:
- Web: Supabase OAuth redirect config in Supabase dashboard
- Android: `GoogleAuth.serverClientId` in `capacitor.config.ts` must match Google Cloud Console client ID

### 4. "Environment variables aren't working on Android"
Android doesn't read `.env.local`. The `build-android.sh` script has **hardcoded** Supabase credentials (lines 12-13). To change them, edit the script directly.

### 5. "The android/ directory is missing"
It's gitignored. Regenerate with:
```bash
npx cap add android
npx cap sync android
```

### 6. "Build fails with JAVA_HOME error"
Java 17 is required. The build script assumes macOS Homebrew path:
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```
Adjust if Java is installed elsewhere.

---

## Quick Reference Card

```
WEB DEV:      npm run dev              → http://localhost:3000
WEB BUILD:    npm run build            → dist/
WEB DEPLOY:   git push to main         → Vercel auto-deploys

ANDROID:      ./build-android.sh       → android/app/build/outputs/apk/debug/app-debug.apk
ANDROID ALT:  npm run android:run      → build + sync + open Android Studio

SYNC ONLY:    npx cap sync android     → copies dist/ to android project (no APK build)
```
