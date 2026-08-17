import { createGameSafe } from "../../hooks/createGameSafe.js";
import { DGameSafeOpened } from "../DGameSafeOpened/DGameSafeOpened.js";
import { useSelector } from "../../hooks/useSelector.js";
import "./DGameSafe.css";

export const DGameSafe = () => {
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "common";

  return createGameSafe({
    selectedSafeId,
    classPrefix: "game-safe",
    size: 222,
    stroke: 10,
    cursorRadiusOffset: -18,
    cursorSize: 37,
    createOpened: DGameSafeOpened,
  });
};
