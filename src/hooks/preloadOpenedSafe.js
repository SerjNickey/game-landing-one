const preloaded = new Set();

function preload(url) {
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.src = url;
}

/** Start fetching opened-safe art as soon as a closed safe is shown. */
export function preloadOpenedSafeImages(safeId) {
  const id = safeId ?? "common";
  preload(`/images/GameSafe/${id}_opened_95PER.webp`);
  preload("/images/GameSafe/first_prize_95PER.webp");
}
