# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Belgeneh is a real estate investment calculator and portfolio management platform built with React 19, TypeScript, Vite, and Supabase. It supports both web (desktop/mobile) and native mobile (Android via Capacitor) with a hybrid authentication system.

## CRITICAL: Web vs Android App Separation (Instructions for Claude Code)

**The web app and Android app are SEPARATE builds.** Code changes to `src/` files only affect the web app immediately. The Android app must be explicitly rebuilt.

### How Claude Code Should Handle User Requests:

| User Says | What To Do |
|-----------|------------|
| "Fix this" or "Change this" (no platform specified) | **Web only** - edit code, done |
| "Fix this on web" | Web only - edit code, done |
| "Fix this on Android" | Edit code, then rebuild Android APK |
| "Fix this on both" / "Fix this everywhere" | Edit code, then rebuild Android APK |
| "Build Android" / "Update the APK" | Run `./build-android.sh` |

### Web App (Default)
- Code changes in `src/` take effect immediately with `npm run dev`
- Pushing to `main` auto-deploys to Vercel (production)
- **No Android rebuild needed for web-only changes**

### Android App
The Android APK bundles the web code at build time. After code changes:
```bash
npm run build              # Build web assets
npx cap sync android       # Copy to Android project
./build-android.sh         # Build new APK
```

**REMEMBER:** The installed Android APK does NOT auto-update. Users must install a new APK to get changes.

## Development Commands

### Web Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

**Note:** No linting or testing commands are configured. TypeScript checking happens at build time.

### Android/Mobile Development
```bash
npm run android:sync   # Build web + sync to Android
npm run android:open   # Open in Android Studio
npm run android:run    # Full workflow: build + sync + open
./build-android.sh     # Build APK directly (debug)
```

**Android Build Requirements:**
- Java 17 required (`build-android.sh` sets JAVA_HOME for macOS Homebrew)
- APK output: `android/app/build/outputs/apk/debug/app-debug.apk`
- Gradle wrapper: `./gradlew assembleDebug` (run from `android/` directory)

### Environment Setup
Copy `.env.example` to `.env.local` and configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `VITE_GEMINI_API_KEY` - Google Gemini API key (optional)

**Important:** Only `VITE_*` prefixed variables are exposed to the client. Never commit `.env.local`.

**Note:** The `build-android.sh` script has hardcoded credentials for convenience during development - in production, use environment variables.

## Architecture Overview

### Application Structure

**Entry Point:** `src/index.tsx` → `App.tsx`

**Provider Hierarchy (Order Matters):**
```
LanguageProvider (i18n + theme)
└── AppSettingsContextProvider
    └── ToastContextProvider
        └── NotificationProvider
            └── AuthContextProvider (auth state)
                └── DataContextProvider (user data - depends on auth)
                    └── UIContextProvider (UI state)
                        └── App
```

**Why This Order:** Language/theme affect all rendering; Auth must load before Data (data requires authenticated user); UI state depends on everything else.

### Navigation Pattern

**No React Router** - Uses enum-based view switching via `UIContext.activeCalculator`. The `App.tsx` component renders different calculators/views based on this state.

**CalculatorType enum** defines all possible views:
- Calculators: `ROI`, `ROE`, `CapRate`, `FullUnitCalculator`, etc.
- Management: `PortfolioManager`, `Dashboard`
- Admin: `AdminDashboard`

Change views using `UIContext.setActiveCalculator(CalculatorType.ROI)`.

### Authentication Flow (Hybrid Web + Mobile)

**Platform Detection:**
```typescript
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();
```

**Web Flow:**
- Google: OAuth redirect via `supabase.auth.signInWithOAuth()`
- Email/Password: Direct auth via `supabase.auth.signInWithPassword()`

**Mobile/Native Flow:**
- Google: Native SDK via `@codetrix-studio/capacitor-google-auth`
  - Gets ID token from native Google Sign-In
  - Exchanges with Supabase: `supabase.auth.signInWithIdToken()`
  - Config in `capacitor.config.ts` → `GoogleAuth.serverClientId`

**Auth Context (`src/contexts/AuthContext.tsx`):**
- Manages `currentUser`, `userProfile`
- Real-time auth listener: `supabase.auth.onAuthStateChange()`
- Session persistence enabled by default
- Admin role check via `is_admin()` database function

**User Profiles:**
- Auth table (`auth.users`) extended by `user_profiles` table
- Auto-created via database trigger on signup
- RLS enforces users can only access own data (admin role bypasses)

### State Management

**Context-based architecture** (no Redux). Each context has single responsibility:

**AuthContext** - Authentication, user management, admin operations
**DataContext** - Saved units, portfolio properties, CRUD operations
**UIContext** - Active view, calculator state, pure UI state
**LanguageContext** - i18n (Arabic/English), theme (light/dark), RTL/LTR
**AppSettingsContext** - Global app config, maintenance mode, tool visibility

**Pattern:** Each context exports combined `State & Actions` interface. Use hooks: `useAuth()`, `useData()`, `useUI()`, `useLanguage()`.

### Database Integration (Supabase)

**API Layer:** `src/lib/api.ts`

Three domain APIs following consistent pattern:
- **savedUnitsAPI** - Real estate analysis units (CRUD)
- **portfolioAPI** - Properties with nested tasks/documents (CRUD + relationships)
- **userProfileAPI** - User profiles, admin user management, usage tracking

**Data Flow:**
```
Component → Context Action → API Call → Supabase → RLS Check → Database
                ↓
          Update Local State
```

**Row Level Security (RLS):**
- All tables enforce RLS policies
- Users access only their own data (`user_id = auth.uid()`)
- Admin role bypasses restrictions via `is_admin()` helper
- Policies defined in `supabase-schema.sql`

**Type Safety:**
- Database types: `src/lib/supabase.ts` (Database interface)
- Application types: `src/types.ts`
- API layer transforms between DB format and app format

**Real-time Data:**
- Auth state change triggers data reload
- Sign-in → loads saved units + portfolio
- Sign-out → clears all local data
- No realtime subscriptions (not needed for this use case)

### Capacitor Mobile Integration

**Key Plugins:**
- `@capacitor/app` - Android back button handling
- `@capacitor/core` - Platform detection
- `@capacitor/filesystem` - PDF export to device
- `@capacitor/share` - Share functionality
- `@codetrix-studio/capacitor-google-auth` - Native Google OAuth

**Platform-Aware Features:**
- PDF Export: Web downloads file; Mobile saves + opens share dialog
- Google Auth: Web uses OAuth redirect; Mobile uses native SDK
- Back button: Android hardware back button custom handling

**Configuration:** `capacitor.config.ts`
- App ID: `com.belgeneh.app`
- Web dir: `dist/` (Vite output)
- Plugin configs: SplashScreen, StatusBar, GoogleAuth

**Custom Hooks for Mobile:**
- `useAndroidBackButton` - Hardware back button handling (`src/hooks/useAndroidBackButton.ts`)
- `useMobileDetection` - Platform detection (`src/hooks/useMobileDetection.ts`)

### Calculator Components

**Two Types:**

**1. Simple Calculators** (ROI, ROE, CapRate, etc.):
- Single-page forms
- Immediate calculation on button click
- Results display
- Can export as PDF

**2. FullUnitCalculator** (Multi-step wizard):
- Step 1: Purchase details (price, payment plan, down payment)
- Step 2: Timeline (contract date, handover date)
- Step 3: Rental & appreciation (rental income, appreciation rate)
- Step 4: Results (comprehensive analysis)
- **State:** Custom reducer hook `useFullUnitCalculatorState`
- **Persistence:** Auto-save to localStorage, can save to database
- **Loading:** Can load previously saved units from database

**Analytics Utilities** (`src/utils/analytics.ts`):
- `calculateUnitAnalytics()` - Computes all metrics (ROI, ROE, Cap Rate, NPV, payback)
- Used by Dashboard for comparative analysis
- Returns both raw numbers and formatted strings

### Portfolio Manager

Separate from calculators - tracks **owned properties** (not prospective investments).

**Property Types:** Apartment, Shop, Office, Clinic

**Features:**
- Property details with type-specific fields
- Task management (maintenance, inspections)
- Document storage (base64-encoded in database)
- Cap Rate calculation per property
- Quality rating: Excellent/Good/Fair/Poor based on Cap Rate

**Metrics:**
- Net Operating Income (NOI) = Annual Rent - Total Expenses
- Cap Rate = NOI / Purchase Price
- Quality thresholds: >10% (Excellent), 7-10% (Good), 4-7% (Fair), <4% (Poor)

### Dashboard

Comparative analysis of all saved units:
- Visualize metrics: ROI, ROE, Cap Rate, Total Cost, Payback Period, NPV
- Bar charts comparing units
- "Best deal" recommendation using weighted scoring across 6 metrics
- Filter and sort capabilities

## Development Guidelines

### Code Style

**TypeScript:**
- Use explicit types for props and state
- API boundaries must have type definitions
- Prefer interfaces over types for object shapes

**Path Aliases:**
```typescript
import { something } from '@/src/utils/something';
```
The `@` alias points to project root (configured in `vite.config.ts` and `tsconfig.json`).

**Components:**
- Functional components with hooks (no class components)
- Extract complex logic into custom hooks
- Use context hooks for global state
- Keep components focused on single responsibility

### Working with Forms

**Currency Inputs:**
- Use `formatCurrency()` and `parseCurrency()` from utils
- Handle localization (Arabic/English number formatting)

**Validation:**
- Client-side validation in components
- Database constraints in schema
- API layer validates before DB operations

### Adding New Calculators

1. Define calculator type in `CalculatorType` enum
2. Create component in `src/components/`
3. Add to switch statement in `App.tsx`
4. Register in Sidebar navigation
5. Add translations to LanguageContext (Arabic + English)

### Working with Supabase

**Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);

if (error) throw error;
return data;
```

**Upsert Pattern:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .upsert({ id, ...fields })
  .select()
  .single();
```

**Schema Changes:**
1. Update `supabase-schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types in `supabase.ts`
4. Update API layer in `api.ts`

### Mobile Development

**Testing Flow:**
1. Make code changes
2. `npm run build` - Build web app
3. `npx cap sync android` - Sync to native project
4. Open in Android Studio or use `./build-android.sh`

**Platform Detection Pattern:**
```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Mobile-specific code
} else {
  // Web-specific code
}
```

**Using Capacitor Plugins:**
```typescript
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Initialize on mount (mobile only)
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    GoogleAuth.initialize();
  }
}, []);
```

### Internationalization (i18n)

**Adding Translations:**
1. Update `LanguageContext.tsx` in both `translations.ar` and `translations.en`
2. Use translation function: `const t = useLanguage();`
3. Access: `t('key.path.here')`

**RTL Support:**
- RTL automatically applied for Arabic
- Direction set on `<html>` element
- CSS handles layout mirroring

### Admin Features

**Access Control:**
- Admin role assigned in database (`user_profiles.role = 'admin'`)
- Default admin: `said@gmail.com` (set via trigger)
- Check: `userProfile?.role === 'admin'`

**Admin Capabilities:**
- View all users
- Edit user profiles
- Delete users
- View analytics
- Toggle maintenance mode
- Customize app settings (icons, tool visibility)

## Common Patterns

### Loading Saved Units
```typescript
const { savedUnits } = useData();
const unit = savedUnits.find(u => u.id === unitId);
```

### Showing Toasts
```typescript
const { showToast } = useToast();
showToast('Success message', 'success');
showToast('Error message', 'error');
```

### Platform-Specific PDF Export
```typescript
// Web: downloads file
// Mobile: saves to filesystem + opens share dialog
// Implementation in FullUnitCalculator component
```

### Changing Active View
```typescript
const { setActiveCalculator } = useUI();
setActiveCalculator(CalculatorType.ROI);
```

## Database Schema

**Key Tables:**
- `user_profiles` - Extended user data, role, preferences
- `saved_units` - Real estate analysis results
- `portfolio_properties` - Owned properties
- `portfolio_tasks` - Tasks per property
- `portfolio_documents` - Documents per property
- `notifications` - User notifications
- `global_notifications` - System-wide announcements
- `app_settings` - Global app configuration

**Relationships:**
- Properties → Tasks (1:many via `property_id`)
- Properties → Documents (1:many via `property_id`)
- All tables → Users (via `user_id`)

**Functions:**
- `is_admin()` - Check if current user is admin
- Auto-create profile trigger on user signup

## Deployment

**Web (Vercel):**
- Auto-deploys from main branch
- Configure environment variables in Vercel dashboard
- See `DEPLOYMENT.md` for details

**Android APK:**
- Use `./build-android.sh` for local builds
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`
- For production: Configure signing in Android Studio

## Key Files

**Entry Points:**
- `src/index.tsx` - App bootstrap and provider hierarchy
- `src/App.tsx` - Main app component with view routing

**State Management:**
- `src/contexts/AuthContext.tsx` - Authentication and user profile
- `src/contexts/DataContext.tsx` - Saved units and portfolio data
- `src/contexts/UIContext.tsx` - View state and calculator type
- `src/contexts/LanguageContext.tsx` - i18n translations (Arabic/English)

**API Layer:**
- `src/lib/api.ts` - All Supabase CRUD operations
- `src/lib/supabase.ts` - Supabase client and database types

**Core Logic:**
- `src/utils/analytics.ts` - Financial calculations (ROI, ROE, Cap Rate, NPV)
- `src/utils/formatters.ts` - Currency/number formatting
- `src/types.ts` - Application-wide TypeScript types

**Mobile:**
- `capacitor.config.ts` - Capacitor/Android configuration
- `build-android.sh` - APK build script

## Git Workflow (Instructions for Claude Code)

**IMPORTANT:** After completing any code change task, Claude Code MUST commit the changes to git.

### After Every Completed Task
1. Run `git status` to review what changed
2. Run `git diff` to verify the changes are correct
3. Stage the relevant files: `git add <files>` or `git add .`
4. Commit with a descriptive message
5. Push to remote: `git push`

### Commit Message Format
```
fix: description   - Bug fixes
feat: description  - New features
refactor: description - Code restructuring
style: description - UI/styling changes
docs: description  - Documentation updates
```

### What to Commit
- **DO commit:** All code changes in `src/`, config files, CLAUDE.md updates
- **DO NOT commit:** `.env.local`, `node_modules/`, `dist/`, APK files, temporary files

### When NOT to Push
- If the user says "don't push" or "commit only"
- If there are build errors (fix them first)
- If changes are incomplete/work-in-progress

## File Reference Patterns

When referencing code locations, use format: `file_path:line_number`
Example: "Auth state updated in src/contexts/AuthContext.tsx:145"
