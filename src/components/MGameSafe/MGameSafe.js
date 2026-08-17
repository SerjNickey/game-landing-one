import { createGameSafe } from "../../hooks/createGameSafe.js";
import { MGameSafeOpened } from "../MGameSafeOpened/MGameSafeOpened.js";
import { useSelector } from "../../hooks/useSelector.js";
import "./MGameSafe.css";

export const MGameSafe = () => {
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "common";

  return createGameSafe({
    selectedSafeId,
    classPrefix: "m-game-safe",
    size: 180,
    stroke: 8,
    cursorRadiusOffset: -14,
    cursorSize: 30,
    createOpened: MGameSafeOpened,
  });
};
