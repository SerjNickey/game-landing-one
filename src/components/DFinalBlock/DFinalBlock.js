import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import { resetAppFlow } from "../../store/actions.js";
import { getPrize, localizePrize, PRIZES } from "../../constants/prizes.js";
import { getSafeCopy } from "../../i18n/safes.js";
import { PrizeText } from "../PrizeText/PrizeText.js";
import "./DFinalBlock.css";

const CLAIM_SECONDS = 29 * 60 + 59;

function formatTimer(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(clamped / 60)).padStart(2, "0");
  const seconds = String(clamped % 60).padStart(2, "0");
  return `${minutes} : ${seconds}`;
}

/**
 * Final CTA block under safes — shown when the safe is opened.
 */
export const DFinalBlock = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.lang);
  const prizeId = useSelector((state) => state.selectedPrizeId);
  const copy = getSafeCopy(lang);
  const prize = localizePrize(getPrize(prizeId), lang);
  const otherPrizes = PRIZES.filter((item) => item.id !== prize.id);
  const el = document.createElement("div");
  el.className = "d-final-block";

  const claim = document.createElement("div");
  claim.className = "d-final-block__claim";

  const lead = document.createElement("p");
  lead.className = "d-final-block__lead";
  lead.textContent = copy.claimLead;

  const won = document.createElement("p");
  won.className = "d-final-block__won";
  won.append(`${copy.youWon} `);
  const wonPrize = document.createElement("b");
  wonPrize.textContent = prize.label;
  won.append(wonPrize);

  const actions = document.createElement("div");
  actions.className = "d-final-block__actions";

  const claimBtn = document.createElement("button");
  claimBtn.type = "button";
  claimBtn.className = "d-final-block__claim-btn";

  const claimLabel = document.createElement("span");
  claimLabel.className = "d-final-block__claim-label";
  claimLabel.textContent = copy.claimNow;

  const claimTimer = document.createElement("span");
  claimTimer.className = "d-final-block__claim-timer";
  claimTimer.textContent = formatTimer(CLAIM_SECONDS);

  claimBtn.append(claimLabel, claimTimer);

  let remaining = CLAIM_SECONDS;
  let timerId = 0;
  let timerStarted = false;

  const clearTimer = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = 0;
    }
  };

  const startTimer = () => {
    if (timerStarted) return;
    if (getComputedStyle(el).display === "none") return;
    timerStarted = true;
    timerId = window.setInterval(() => {
      remaining -= 1;
      claimTimer.textContent = formatTimer(remaining);
      if (remaining <= 0) clearTimer();
    }, 1000);
  };

  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "d-final-block__refresh-btn";
  refreshBtn.setAttribute("aria-label", copy.refresh);

  const refreshIcon = document.createElement("img");
  refreshIcon.className = "d-final-block__refresh-icon";
  refreshIcon.src = "/images/Global/refresh.svg";
  refreshIcon.alt = "";
  refreshIcon.width = 24;
  refreshIcon.height = 24;
  refreshIcon.draggable = false;

  refreshBtn.append(refreshIcon);
  refreshBtn.addEventListener("click", () => {
    clearTimer();
    dispatch(resetAppFlow());
  });

  actions.append(claimBtn, refreshBtn);
  claim.append(lead, won, actions);

  const divider = document.createElement("div");
  divider.className = "d-final-block__divider";
  divider.setAttribute("aria-hidden", "true");

  const other = document.createElement("div");
  other.className = "d-final-block__other";

  const heading = document.createElement("h2");
  heading.className = "d-final-block__heading";
  heading.textContent = copy.otherPrizes;

  const cards = document.createElement("div");
  cards.className = "d-final-block__prizes";

  for (const otherPrize of otherPrizes) {
    const card = document.createElement("div");
    card.className = "d-final-block__prize-card";
    card.append(
      PrizeText({
        prizeId: otherPrize.id,
        lang,
        className: "d-final-block__prize-text",
      }),
    );
    cards.append(card);
  }

  other.append(heading, cards);
  el.append(claim, divider, other);

  queueMicrotask(() => {
    const page = el.closest(".desktop-safe-clicked__page");
    if (!page) return;
    const observer = new MutationObserver(startTimer);
    observer.observe(page, { childList: true, subtree: true });
    startTimer();
  });

  return el;
};
