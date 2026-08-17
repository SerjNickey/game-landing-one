import { useSelector } from "../../hooks/useSelector.js";
import "./MGameSafeOpened.css";

/**
 * Mobile opened-safe prize screen.
 * @param {{ safeId?: string }} [options]
 */
export const MGameSafeOpened = ({ safeId } = {}) => {
  const fromStore = useSelector((state) => state.selectedSafeId);
  const selectedSafeId = safeId ?? fromStore ?? "common";

  const el = document.createElement("div");
  el.className = `m-game-safe-opened__container m-game-safe-opened__container--${selectedSafeId}`;
  return el;
};
