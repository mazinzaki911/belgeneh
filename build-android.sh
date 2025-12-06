#!/bin/bash

# Build script for Android APK with proper environment variables

set -e  # Exit on error

echo "🚀 Building Belgeneh Android APK with correct credentials..."
echo ""

# Build web app with explicit environment variables
echo "📦 Building web app..."
VITE_SUPABASE_URL=https://vwrctfiphtnnafsjzxev.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cmN0ZmlwaHRubmFmc2p6eGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTM1NjAsImV4cCI6MjA3NjUyOTU2MH0.oDq1DMuP-nC24iVDrIOg0OR48Mp07Re3fcCPORXAGUs \
npm run build

echo "✅ Web app built!"
echo ""

# Sync to Android
echo "🔄 Syncing to Android..."
npx cap sync android

echo "✅ Synced!"
echo ""

# Build APK
echo "📱 Building APK..."
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
cd android && ./gradlew assembleDebug
cd ..

echo "✅ APK built successfully!"
echo ""
echo "📍 APK location:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🎉 Done!"
