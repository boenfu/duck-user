import {MobileDeviceKinds} from '@duck-user/core';

import {getColorGamut, getTimezone, getUA} from './@utils';

export interface MobileDeviceKindsOptions {
  /**
   * ignore screenWidth & screenHeight in Wechat
   */
  inWechat?: boolean;
}

export function getKinds({
  inWechat,
}: MobileDeviceKindsOptions = {}): MobileDeviceKinds {
  let ua = getUA();

  return {
    ...(!inWechat
      ? {
          screenWidth: screen.width,
          screenHeight: screen.height,
        }
      : {
          screenWidth: undefined,
          screenHeight: undefined,
        }),
    colorDepth: screen.colorDepth,
    maxTouchPoints: navigator.maxTouchPoints,
    colorGamut: getColorGamut(),
    timezone: getTimezone(),
    deviceModel: ua.device.model,
    deviceVendor: ua.device.vendor,
    osName: ua.os.name,
    osVersion: ua.os.version?.split('.'),
    // 这两个安卓浏览器才取得到
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
  };
}
