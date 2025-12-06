#!/bin/bash

# Script to create and start Android emulator for testing Belgeneh APK

export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "🚀 Setting up Android Emulator for Belgeneh..."
echo ""

# Create AVD if it doesn't exist
if [ ! -d "$HOME/.android/avd/Belgeneh_Test.avd" ]; then
    echo "📱 Creating virtual device..."
    printf 'no\n' | avdmanager create avd \
        -n Belgeneh_Test \
        -k "system-images;android-34;google_apis;arm64-v8a" \
        -d pixel_6
    echo "✅ Virtual device created!"
    echo ""
else
    echo "✅ Virtual device already exists"
    echo ""
fi

echo "🔧 Starting emulator..."
echo "This will open an Android phone window on your Mac"
echo ""

# Start emulator in background
$ANDROID_HOME/emulator/emulator -avd Belgeneh_Test &

echo ""
echo "⏳ Waiting for emulator to boot (this takes 1-2 minutes)..."
echo ""

# Wait for device to be ready
$ANDROID_HOME/platform-tools/adb wait-for-device

echo "✅ Emulator is ready!"
echo ""
echo "📲 Installing Belgeneh APK..."
echo ""

# Install APK
$ANDROID_HOME/platform-tools/adb install -r android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🎉 Done! Your app should now be visible on the emulator!"
echo ""
echo "Look for 'Belgeneh' in the app drawer and tap to open."
echo ""
echo "To close the emulator, just close the emulator window."
echo ""
