const LANDING_IMAGES = [
  "/images/Header/logo_100PER.webp",
  "/images/SafesList/common_95PER.webp",
  "/images/SafesList/rare_95PER.webp",
  "/images/SafesList/epic_95PER.webp",
  "/images/infoBlock/i_one_95PER.webp",
  "/images/infoBlock/i_two_95PER.webp",
  "/images/infoBlock/i_three_95PER.webp",
];

const FALLBACK_MS = 8000;

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function waitForImages(urls) {
  return Promise.race([
    Promise.all(urls.map(loadImage)),
    new Promise((resolve) => {
      setTimeout(resolve, FALLBACK_MS);
    }),
  ]);
}

/** Wait until first-paint landing assets are in cache (or timeout). */
export function preloadLandingImages() {
  return waitForImages(LANDING_IMAGES);
}

/** Wait until closed GameSafe screen assets are in cache (or timeout). */
export function preloadSafeClickedImages(safeId) {
  const id = safeId ?? "common";
  return waitForImages([
    `/images/GameSafe/${id}_closed_95PER.webp`,
    "/images/GameSafe/middle_95PER.webp",
    "/images/GameSafe/cursor_95PER.avif",
  ]);
}
