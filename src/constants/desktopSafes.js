export const DESKTOP_SAFES = [
  { id: "common", title: "COMMON" },
  { id: "rare", title: "RARE" },
  { id: "epic", title: "EPIC" },
];

/** Rotate queue so `selectedId` sits in the center slot. */
export function arrangeSafesWithCenter(selectedId) {
  const n = DESKTOP_SAFES.length;
  const idx = DESKTOP_SAFES.findIndex((safe) => safe.id === selectedId);
  if (idx < 0) return [...DESKTOP_SAFES];

  const centerIdx = Math.floor(n / 2);
  const rot = (idx - centerIdx + n) % n;
  return [...DESKTOP_SAFES.slice(rot), ...DESKTOP_SAFES.slice(0, rot)];
}
