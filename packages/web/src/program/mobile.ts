export function getDuckUser(): {
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
} {
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
    colorGamut: getColorGamut(),
    timezone: getTimezone(),
    // 这两个安卓才有
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
  };
}

// copy from https://github.com/fingerprintjs
function getTimezone(): string {
  const DateTimeFormat = window.Intl?.DateTimeFormat;

  if (DateTimeFormat) {
    const timezone = new DateTimeFormat().resolvedOptions().timeZone;

    if (timezone) {
      return timezone;
    }
  }

  // For browsers that don't support timezone names
  // The minus is intentional because the JS offset is opposite to the real offset
  const offset = -getTimezoneOffset();
  return `UTC${offset >= 0 ? '+' : ''}${Math.abs(offset)}`;
}

function getTimezoneOffset(): number {
  const currentYear = new Date().getFullYear();

  // The timezone offset may change over time due to daylight saving time (DST) shifts.
  // The non-DST timezone offset is used as the result timezone offset.
  // Since the DST season differs in the northern and the southern hemispheres,
  // both January and July timezones offsets are considered.
  return Math.max(
    // `getTimezoneOffset` returns a number as a string in some unidentified cases
    new Date(currentYear, 0, 1).getTimezoneOffset(),
    new Date(currentYear, 6, 1).getTimezoneOffset(),
  );
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
 */
function getColorGamut(): ColorGamut | undefined {
  // rec2020 includes p3 and p3 includes srgb
  for (const gamut of ['rec2020', 'p3', 'srgb'] as const) {
    if (matchMedia(`(color-gamut: ${gamut})`).matches) {
      return gamut;
    }
  }

  return undefined;
}
