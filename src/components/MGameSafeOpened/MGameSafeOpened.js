import { useSelector } from "../../hooks/useSelector.js";
import { PrizeText } from "../PrizeText/PrizeText.js";
import "./MGameSafeOpened.css";

/**
 * Mobile opened-safe prize screen.
 * @param {{ safeId?: string }} [options]
 */
export const MGameSafeOpened = ({ safeId } = {}) => {
  const fromStore = useSelector((state) => state.selectedSafeId);
  const prizeId = useSelector((state) => state.selectedPrizeId);
  const lang = useSelector((state) => state.lang);
  const selectedSafeId = safeId ?? fromStore ?? "common";

  const el = document.createElement("div");
  el.className = `m-game-safe-opened__container m-game-safe-opened__container--${selectedSafeId}`;
  el.style.backgroundImage = `url("/images/GameSafe/${selectedSafeId}_opened_95PER.webp")`;
  el.append(
    PrizeText({
      prizeId,
      lang,
      className: "m-game-safe-opened__prize",
    }),
  );
  return el;
};
