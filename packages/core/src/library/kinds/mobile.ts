export interface MobileDeviceKinds {
  screenWidth: number | undefined;
  screenHeight: number | undefined;
  colorDepth: number | undefined;
  // rec2020 includes p3 and p3 includes srgb
  colorGamut: 'rec2020' | 'p3' | 'srgb' | undefined;
  maxTouchPoints: number | undefined;
  hardwareConcurrency: number | undefined;
  timezone: string | undefined;
  osName: string | undefined;
  osVersion: string[] | undefined;
  deviceMemory: number | undefined;
  deviceVendor: string | undefined;
  deviceModel: string | undefined;
}
