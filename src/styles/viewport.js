import { breakpoints } from "./breakpoints.js";

export const MOBILE_MEDIA_QUERY = `(max-width: ${breakpoints.max1024})`;

export function isMobileViewport() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}
