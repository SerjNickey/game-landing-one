import { Header } from "../../components/Header/Header.js";
import { MGameSafe } from "../../components/MGameSafe/MGameSafe.js";
import { MInfoBlock } from "../../components/MInfoBlock/MInfoBlock.js";
import { MFinalBlock } from "../../components/MFinalBlock/MFinalBlock.js";
import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import { setInfoBlockView } from "../../store/actions.js";
import { DESKTOP_SAFES } from "../../constants/desktopSafes.js";
import "./MobileSafeClicked.css";

/**
 * Mobile selected-safe screen with interactive MGameSafe.
 */
export const MobileSafeClicked = () => {
  const dispatch = useDispatch();
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "common";
  const infoView =
    useSelector((state) => state.infoBlockView) ?? "howDoesItWorks";
  const isPrizes = infoView === "prizes";
  const safe =
    DESKTOP_SAFES.find((item) => item.id === selectedSafeId) ??
    DESKTOP_SAFES[0];

  const el = document.createElement("div");
  el.className = "mobile-safe-clicked__page";
  el.append(Header());

  const main = document.createElement("div");
  main.className = "mobile-safe-clicked__main";

  const title = document.createElement("div");
  title.className = "mobile-safe-clicked__title";
  title.textContent = safe.title;

  const slot = document.createElement("div");
  slot.className = "mobile-safe-clicked__slot";
  slot.append(MGameSafe());

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "mobile-safe-clicked__nav-toggle";
  toggleBtn.textContent = isPrizes ? "BACK TO RULES" : "WHAT'S INSIDE?";
  toggleBtn.addEventListener("click", () => {
    dispatch(setInfoBlockView(isPrizes ? "howDoesItWorks" : "prizes"));
  });

  main.append(title, slot, toggleBtn);
  el.append(main, MInfoBlock(), MFinalBlock());
  return el;
};
