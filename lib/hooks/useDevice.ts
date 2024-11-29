import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isOnline: boolean;
  connection: {
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  battery: {
    level: number;
    charging: boolean;
  } | null;
}

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isOnline: true,
    connection: {
      type: 'unknown',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    },
    battery: null
  });

  useEffect(() => {
    const updateDeviceInfo = async () => {
      // Screen size detection
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      const tablet = window.matchMedia('(min-width: 641px) and (max-width: 1024px)').matches;

      // Network information
      const connection = (navigator as any).connection || {
        type: 'unknown',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50
      };

      // Battery status
      let battery = null;
      try {
        if ('getBattery' in navigator) {
          const batteryManager = await (navigator as any).getBattery();
          battery = {
            level: batteryManager.level,
            charging: batteryManager.charging
          };
        }
      } catch (error) {
        console.warn('Battery status not available');
      }

      setDeviceInfo({
        isMobile: mobile,
        isTablet: tablet,
        isDesktop: !mobile && !tablet,
        isOnline: navigator.onLine,
        connection,
        battery
      });
    };

    // Initial update
    updateDeviceInfo();

    // Event listeners
    const resizeHandler = () => updateDeviceInfo();
    const onlineHandler = () => updateDeviceInfo();
    const offlineHandler = () => updateDeviceInfo();
    const connectionHandler = () => updateDeviceInfo();

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', connectionHandler);
    }

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', connectionHandler);
      }
    };
  }, []);

  return deviceInfo;
}
