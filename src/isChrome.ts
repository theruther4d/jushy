const isChrome =
  /Chrome/.test(navigator.userAgent) && !/Chromium/.test(navigator.userAgent);

export const isChromeHeadless = isChrome && !(window as any).chrome;
