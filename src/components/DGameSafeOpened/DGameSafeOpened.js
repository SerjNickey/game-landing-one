import { useSelector } from "../../hooks/useSelector.js";
import "./DGameSafeOpened.css";

/**
 * Opened-safe prize screen (post-unlock).
 * Autonomous — no dial / hold logic.
 * @param {{ safeId?: string }} [options]
 */
export const DGameSafeOpened = ({ safeId } = {}) => {
  const fromStore = useSelector((state) => state.selectedSafeId);
  const selectedSafeId = safeId ?? fromStore ?? "common";

  const el = document.createElement("div");
  el.className = `game-safe-opened__container game-safe-opened__container--${selectedSafeId}`;
  el.style.backgroundImage = `url("/images/GameSafe/${selectedSafeId}_opened_95PER.webp")`;
  el.style.setProperty(
    "--opened-prize-image",
    'url("/images/GameSafe/first_prize_95PER.webp")',
  );
  return el;
};
