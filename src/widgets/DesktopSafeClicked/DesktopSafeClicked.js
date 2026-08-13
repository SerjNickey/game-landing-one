import { Header } from "../../components/Header/Header.js";
import { DGameSafe } from "../../components/DGameSafe/DGameSafe.js";
import { useSelector } from "../../hooks/useSelector.js";
import { arrangeSafesWithCenter } from "../../constants/desktopSafes.js";
import "./DesktopSafeClicked.css";

export const DesktopSafeClicked = () => {
  const selectedSafeId = useSelector((state) => state.selectedSafeId);
  const safes = arrangeSafesWithCenter(selectedSafeId);

  const el = document.createElement("div");
  el.className = "desktop-safe-clicked__page";
  el.append(Header());

  const row = document.createElement("div");
  row.className = "desktop-safe-clicked__container";

  for (const safe of safes) {
    const isCenter = safe.id === selectedSafeId;
    const item = document.createElement("div");
    item.className = [
      "desktop-safe-clicked__item",
      `desktop-safe-clicked__item--${safe.id}`,
      isCenter ? "desktop-safe-clicked__item--center" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const title = document.createElement("div");
    title.className = "desktop-safe-clicked__title";
    title.textContent = safe.title;

    if (isCenter) {
      // Keep the middle slot size, but render DGameSafe instead of safe art.
      const slot = document.createElement("div");
      slot.className = "desktop-safe-clicked__slot";
      slot.setAttribute("aria-current", "true");
      slot.setAttribute("aria-label", safe.title);
      slot.append(DGameSafe());
      item.append(title, slot);
    } else {
      const block = document.createElement("div");
      block.className = `desktop-safe-clicked__safe desktop-safe-clicked__safe--${safe.id}`;
      block.setAttribute("aria-label", safe.title);
      item.append(title, block);
    }

    row.append(item);
  }

  el.append(row);
  return el;
};
