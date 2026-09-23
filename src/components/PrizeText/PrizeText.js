import { getPrize, localizePrize } from "../../constants/prizes.js";
import "./PrizeText.css";

export function PrizeText({ prizeId, lang = "en", className = "" } = {}) {
  const prize = localizePrize(getPrize(prizeId), lang);
  const el = document.createElement("div");
  el.className = ["prize-text", className].filter(Boolean).join(" ");
  el.dataset.prize = prize.id;
  el.setAttribute("aria-label", prize.label);

  const primary = document.createElement("strong");
  primary.textContent = prize.primary;
  el.append(primary);

  prize.lines.forEach((line) => {
    const text = document.createElement("span");
    text.textContent = line;
    el.append(text);
  });

  return el;
}
