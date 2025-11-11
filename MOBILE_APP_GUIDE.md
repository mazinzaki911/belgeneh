# Mobile App (APK) Creation Guide

This guide will help you convert your Belgeneh web app into a native Android APK that works perfectly with all app functions.

---

## 📱 Overview

We'll use **Capacitor** (by Ionic) to wrap your React web app into a native Android app. Capacitor is:
- ✅ Modern and actively maintained
- ✅ Works perfectly with React + Vite
- ✅ Provides native device features
- ✅ Easy to update (just rebuild the web app)
- ✅ Supports PWA features

---

## 🛠️ Prerequisites

### Required Software

1. **Node.js** (already installed) ✅
2. **Android Studio**: https://developer.android.com/studio
   - Download and install Android Studio
   - During setup, install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
     - Android SDK Command-line Tools

3. **Java JDK 11 or higher**
   - Check: `java --version`
   - If not installed: https://www.oracle.com/java/technologies/downloads/

---

## 🚀 Step 1: Install Capacitor

Run these commands in your project directory:

```bash
# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Install Android platform
npm install @capacitor/android

# Install helpful plugins
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

---

## ⚙️ Step 2: Initialize Capacitor

```bash
# Initialize Capacitor
npx cap init

# When prompted, enter:
# App name: Belgeneh
# App ID (reverse domain): com.belgeneh.app
# Web asset directory: dist
```

This creates a `capacitor.config.ts` file.

---

## 📝 Step 3: Configure Capacitor

Edit the generated `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.belgeneh.app',
  appName: 'Belgeneh',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow clear text traffic for local development
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#667eea',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#667eea'
    }
  }
};

export default config;
```

---

## 🏗️ Step 4: Build Web Assets

```bash
# Build your React app for production
npm run build

# Verify the build created 'dist' folder
ls -la dist
```

---

## 📱 Step 5: Add Android Platform

```bash
# Add Android platform
npx cap add android

# This creates an 'android' folder with native Android project
```

---

## 🔧 Step 6: Configure Android App

### A. Update App Icons and Splash Screen

1. **Generate Icons** using: https://icon.kitchen
   - Upload your Belgeneh logo
   - Select "Android" platform
   - Download the generated assets

2. **Replace default icons**:
   ```bash
   # Copy icons to Android resources
   android/app/src/main/res/
   ├── mipmap-hdpi/
   ├── mipmap-mdpi/
   ├── mipmap-xhdpi/
   ├── mipmap-xxhdpi/
   └── mipmap-xxxhdpi/
   ```

3. **Update Splash Screen**:
   ```bash
   # Edit: android/app/src/main/res/values/styles.xml
   ```

### B. Configure Permissions

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.belgeneh.app">

    <!-- Required Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                     android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
                     android:maxSdkVersion="32" />

    <!-- Optional: For file uploads/downloads -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <!-- Activity configuration -->
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### C. Configure App Details

Edit `android/app/src/main/res/values/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Belgeneh</string>
    <string name="title_activity_main">Belgeneh - Real Estate Investment Calculator</string>
    <string name="package_name">com.belgeneh.app</string>
    <string name="custom_url_scheme">com.belgeneh.app</string>
</resources>
```

---

## 📲 Step 7: Update React App for Mobile

### A. Add Mobile-Specific Code

Create `src/hooks/useMobileDetection.ts`:

```typescript
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setIsMobile(Capacitor.getPlatform() !== 'web');
  }, []);

  return { isMobile, isNative, platform: Capacitor.getPlatform() };
};
```

### B. Add Status Bar and Splash Screen

Update `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

function App() {
  useEffect(() => {
    // Configure status bar for mobile
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#667eea' });

      // Hide splash screen when app is ready
      SplashScreen.hide();
    }
  }, []);

  // ... rest of your app
}
```

### C. Handle Back Button (Android)

Create `src/hooks/useAndroidBackButton.ts`:

```typescript
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = App.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/') {
        App.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      }
    });

    return () => {
      handleBackButton.remove();
    };
  }, [navigate, location]);
};
```

---

## 🔨 Step 8: Build the APK

### A. Sync Changes

```bash
# Copy web assets to native project
npx cap copy android

# Or sync (copy + update)
npx cap sync android
```

### B. Open in Android Studio

```bash
# Open Android Studio
npx cap open android
```

### C. Build APK in Android Studio

1. **Wait for Gradle sync** to complete
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. **Wait for build** (first time takes 5-10 minutes)
4. **Find APK** at: `android/app/build/outputs/apk/debug/app-debug.apk`

### D. Build Release APK (Production)

1. **Generate Signing Key**:
   ```bash
   keytool -genkey -v -keystore belgeneh-release-key.keystore -alias belgeneh -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing** in `android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file("../../belgeneh-release-key.keystore")
               storePassword "your-password"
               keyAlias "belgeneh"
               keyPassword "your-password"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK**:
   - Build → Generate Signed Bundle / APK
   - Choose APK
   - Select key store
   - Build

4. **Find Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Step 9: Test the APK

### A. Install on Real Device

```bash
# Enable USB debugging on your Android phone
# Connect phone via USB
# Run:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### B. Test on Emulator

1. Open Android Studio
2. **Tools → Device Manager**
3. **Create Virtual Device**
4. **Run app** from Android Studio

### C. Testing Checklist

Test all features:
- [ ] Login/Signup works
- [ ] Email verification works
- [ ] All calculators function correctly
- [ ] Dark mode toggles properly
- [ ] Language switching works
- [ ] Data persists (Supabase connection)
- [ ] File uploads work
- [ ] Navigation works smoothly
- [ ] Back button works correctly
- [ ] App doesn't crash on rotation
- [ ] Keyboard doesn't overlap inputs

---

## 🚀 Step 10: Publish to Google Play Store

### A. Prepare for Release

1. **Create Google Play Developer Account**: https://play.google.com/console ($25 one-time fee)

2. **Prepare Assets**:
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (minimum 2, different screen sizes)
   - App description (Arabic + English)
   - Privacy policy URL

3. **Complete App Content Rating**

4. **Set up Pricing & Distribution**

### B. Upload APK

1. **Go to**: Google Play Console
2. **Create new app**
3. **Fill in app details**
4. **Upload AAB** (recommended) or APK
5. **Submit for review**

### C. Build AAB (Android App Bundle)

```bash
# In Android Studio:
Build → Generate Signed Bundle / APK → Android App Bundle
```

AAB is preferred over APK for Play Store as it's smaller and optimized per device.

---

## 🔄 Step 11: Update Workflow

When you update your web app:

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build new APK
npx cap open android
# Then Build → Build APK in Android Studio
```

Or automate with a script:

```bash
#!/bin/bash
# update-mobile.sh

echo "Building web app..."
npm run build

echo "Syncing to Android..."
npx cap sync android

echo "Opening Android Studio..."
npx cap open android

echo "Done! Build APK in Android Studio"
```

---

## ⚡ Advanced Features

### A. Push Notifications

```bash
npm install @capacitor/push-notifications
```

### B. Camera Access

```bash
npm install @capacitor/camera
```

### C. File System

```bash
npm install @capacitor/filesystem
```

### D. Share API

```bash
npm install @capacitor/share
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: "SDK location not found"
**Solution**: Create `android/local.properties`:
```
sdk.dir=/path/to/Android/sdk
```

**Error**: "Gradle sync failed"
**Solution**:
1. File → Invalidate Caches → Invalidate and Restart
2. Or delete `android/.gradle` and rebuild

### APK Won't Install

**Error**: "App not installed"
**Solution**:
1. Uninstall previous version
2. Enable "Install unknown apps" in settings
3. Rebuild with new version code

### White Screen on Launch

**Solution**:
1. Check `capacitor.config.ts` has correct `webDir: 'dist'`
2. Ensure `npm run build` ran successfully
3. Run `npx cap sync android` again

### Supabase Not Connecting

**Solution**:
1. Verify internet permission in AndroidManifest.xml
2. Check `usesCleartextTraffic="true"` if using HTTP
3. Test network connection in app

---

## 📊 App Performance

### Optimize APK Size

1. **Enable minification** in release build
2. **Use ProGuard** for code shrinking
3. **Enable R8** for optimization
4. **Remove unused resources**

Expected size: 5-15 MB

### Improve Load Time

1. **Code splitting** in Vite config
2. **Lazy load** routes
3. **Optimize images**
4. **Use web fonts efficiently**

---

## ✅ Final Checklist

Before publishing:

- [ ] All features tested on real device
- [ ] Release APK/AAB signed properly
- [ ] Version code incremented
- [ ] App permissions documented
- [ ] Privacy policy created
- [ ] Screenshots prepared
- [ ] Store listing completed
- [ ] Age rating obtained
- [ ] Test purchases (if applicable)
- [ ] Backup signing key safely

---

## 📞 Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developers**: https://developer.android.com
- **Google Play Console**: https://play.google.com/console
- **Icon Generator**: https://icon.kitchen
- **Screenshot Tool**: https://screenshots.pro

---

## 🎯 Next Steps

1. Test app thoroughly on multiple devices
2. Gather beta tester feedback
3. Fix any mobile-specific bugs
4. Optimize performance
5. Submit to Play Store
6. Plan iOS version (same process with Capacitor)

Good luck with your mobile app! 🚀
