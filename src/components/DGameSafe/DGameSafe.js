import { createGameSafe } from "../../hooks/createGameSafe.js";
import { DGameSafeOpened } from "../DGameSafeOpened/DGameSafeOpened.js";
import { useSelector } from "../../hooks/useSelector.js";
import { getSafeCopy } from "../../i18n/safes.js";
import "./DGameSafe.css";

export const DGameSafe = () => {
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "common";
  const lang = useSelector((state) => state.lang);
  const copy = getSafeCopy(lang);

  return createGameSafe({
    selectedSafeId,
    classPrefix: "game-safe",
    size: 222,
    stroke: 10,
    cursorRadiusOffset: -18,
    cursorSize: 37,
    holdLabel: copy.holdToOpen,
    stopLabel: copy.stop,
    createOpened: DGameSafeOpened,
  });
};
