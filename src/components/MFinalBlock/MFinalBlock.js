import { useDispatch } from "../../hooks/useSelector.js";
import { resetAppFlow } from "../../store/actions.js";
import "./MFinalBlock.css";

const OTHER_PRIZES = [{ icon: "one" }, { icon: "two" }];
const CLAIM_SECONDS = 29 * 60 + 59;

function formatTimer(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(clamped / 60)).padStart(2, "0");
  const seconds = String(clamped % 60).padStart(2, "0");
  return `${minutes} : ${seconds}`;
}

/**
 * Mobile final CTA — shown when the safe is opened.
 */
export const MFinalBlock = () => {
  const dispatch = useDispatch();
  const el = document.createElement("div");
  el.className = "m-final-block";

  const claim = document.createElement("div");
  claim.className = "m-final-block__claim";

  const actions = document.createElement("div");
  actions.className = "m-final-block__actions";

  const claimBtn = document.createElement("button");
  claimBtn.type = "button";
  claimBtn.className = "m-final-block__claim-btn";

  const claimLabel = document.createElement("span");
  claimLabel.textContent = "CLAIM NOW";

  const claimTimer = document.createElement("span");
  claimTimer.className = "m-final-block__claim-timer";
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
  refreshBtn.className = "m-final-block__refresh-btn";
  refreshBtn.setAttribute("aria-label", "Refresh");

  const refreshIcon = document.createElement("img");
  refreshIcon.className = "m-final-block__refresh-icon";
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
  claim.append(actions);

  const divider = document.createElement("div");
  divider.className = "m-final-block__divider";
  divider.setAttribute("aria-hidden", "true");

  const other = document.createElement("div");
  other.className = "m-final-block__other";

  const heading = document.createElement("h2");
  heading.className = "m-final-block__heading";
  heading.textContent = "Other possible prizes";

  const cards = document.createElement("div");
  cards.className = "m-final-block__prizes";

  for (const card of OTHER_PRIZES) {
    const prize = document.createElement("div");
    prize.className = `m-final-block__prize-card m-final-block__prize-card--${card.icon}`;
    prize.setAttribute("aria-hidden", "true");
    cards.append(prize);
  }

  other.append(heading, cards);
  el.append(claim, divider, other);

  queueMicrotask(() => {
    const page = el.closest(".mobile-safe-clicked__page");
    if (!page) return;
    const observer = new MutationObserver(startTimer);
    observer.observe(page, { childList: true, subtree: true });
    startTimer();
  });

  return el;
};
