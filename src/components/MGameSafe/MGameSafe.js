import { createGameSafe } from "../../hooks/createGameSafe.js";
import { MGameSafeOpened } from "../MGameSafeOpened/MGameSafeOpened.js";
import { useSelector } from "../../hooks/useSelector.js";
import { getSafeCopy } from "../../i18n/safes.js";
import "./MGameSafe.css";

export const MGameSafe = () => {
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "common";
  const lang = useSelector((state) => state.lang);
  const copy = getSafeCopy(lang);

  return createGameSafe({
    selectedSafeId,
    classPrefix: "m-game-safe",
    size: 180,
    stroke: 8,
    cursorRadiusOffset: -14,
    cursorSize: 30,
    holdLabel: copy.holdToOpen,
    stopLabel: copy.stop,
    createOpened: MGameSafeOpened,
  });
};
