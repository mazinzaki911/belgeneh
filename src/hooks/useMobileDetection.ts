import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    const platformName = Capacitor.getPlatform();
    setIsNative(Capacitor.isNativePlatform());
    setIsMobile(platformName !== 'web');
    setPlatform(platformName);
  }, []);

  return { isMobile, isNative, platform };
};
