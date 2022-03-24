import {MobileDeviceIdentifier} from '@duck-user/core';

import {getColorGamut, getTimezone, getUA} from './utils';

export function getUserIdentifier(): MobileDeviceIdentifier {
  let ua = getUA();

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    maxTouchPoints: navigator.maxTouchPoints,
    colorGamut: getColorGamut(),
    timezone: getTimezone(),
    deviceModel: ua.device.model,
    deviceVendor: ua.device.vendor,
    osName: ua.os.name,
    osVersion: ua.os.version,
    // 这两个安卓浏览器才取得到
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
  };
}
