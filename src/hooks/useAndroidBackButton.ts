import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useAndroidBackButton = (onBack?: () => void) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const handleBackButton = App.addListener('backButton', ({ canGoBack }) => {
      if (onBack) {
        onBack();
      } else if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      handleBackButton.remove();
    };
  }, [onBack]);
};
