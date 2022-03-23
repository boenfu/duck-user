export interface MobileDeviceDuckUser {
  screenWidth: number;
  screenHeight: number;
  colorDepth: number | undefined;
  // rec2020 includes p3 and p3 includes srgb
  colorGamut: 'rec2020' | 'p3' | 'srgb' | undefined;
  maxTouchPoints: number | undefined;
  hardwareConcurrency: number | undefined;
  deviceMemory: number | undefined;
  platform: string | undefined;
  timezone: string | undefined;
}
