import { useSelector } from "../../hooks/useSelector.js";
import { PrizeText } from "../PrizeText/PrizeText.js";
import "./DGameSafeOpened.css";

/**
 * Opened-safe prize screen (post-unlock).
 * Autonomous — no dial / hold logic.
 * @param {{ safeId?: string }} [options]
 */
export const DGameSafeOpened = ({ safeId } = {}) => {
  const fromStore = useSelector((state) => state.selectedSafeId);
  const prizeId = useSelector((state) => state.selectedPrizeId);
  const lang = useSelector((state) => state.lang);
  const selectedSafeId = safeId ?? fromStore ?? "common";

  const el = document.createElement("div");
  el.className = `game-safe-opened__container game-safe-opened__container--${selectedSafeId}`;
  el.style.backgroundImage = `url("/images/GameSafe/${selectedSafeId}_opened_95PER.webp")`;
  el.append(
    PrizeText({
      prizeId,
      lang,
      className: "game-safe-opened__prize",
    }),
  );
  return el;
};
