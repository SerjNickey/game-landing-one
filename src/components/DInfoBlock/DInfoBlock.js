import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import { setInfoBlockView } from "../../store/actions.js";
import { getSafeCopy } from "../../i18n/safes.js";
import "./DInfoBlock.css";

const STEP_ICONS = ["one", "two", "three"];

const PRIZE_CARDS = [{ icon: "one" }, { icon: "two" }, { icon: "three" }];

function appendStepCopy(target, step) {
  const title = document.createElement("b");
  title.textContent = `${step.title}:`;
  target.append(title, ` ${step.text}`);
}

function renderHowDoesItWorks(copy) {
  const section = document.createElement("div");
  section.className = "d-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "d-info-block__heading";
  heading.textContent = copy.howTitle;

  const steps = document.createElement("div");
  steps.className = "d-info-block__steps";

  copy.steps.forEach((step, indexValue) => {
    const item = document.createElement("div");
    item.className = "d-info-block__step";

    const index = document.createElement("div");
    index.className = `d-info-block__step-index d-info-block__step-index--${STEP_ICONS[indexValue]}`;
    index.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "d-info-block__step-body";

    const text = document.createElement("div");
    text.className = "d-info-block__step-text";
    appendStepCopy(text, step);

    body.append(text);
    item.append(index, body);
    steps.append(item);
  });

  section.append(heading, steps);
  return section;
}

function renderPrizes(copy) {
  const section = document.createElement("div");
  section.className = "d-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "d-info-block__heading";
  heading.textContent = copy.prizesTitle;

  const cards = document.createElement("div");
  cards.className = "d-info-block__prizes";

  for (const card of PRIZE_CARDS) {
    const el = document.createElement("div");
    el.className = `d-info-block__prize-card d-info-block__prize-card--${card.icon}`;
    el.setAttribute("aria-hidden", "true");
    cards.append(el);
  }

  section.append(heading, cards);
  return section;
}

/**
 * Desktop info block under safes list.
 * Views: "howDoesItWorks" | "prizes"
 */
export const DInfoBlock = () => {
  const dispatch = useDispatch();
  const view = useSelector((state) => state.infoBlockView) ?? "howDoesItWorks";
  const lang = useSelector((state) => state.lang);
  const copy = getSafeCopy(lang);
  const isPrizes = view === "prizes";

  const el = document.createElement("div");
  el.className = `d-info-block d-info-block--${view}`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "d-info-block__toggle";
  toggle.textContent = isPrizes ? copy.showRules : copy.showPrizes;
  toggle.addEventListener("click", () => {
    dispatch(setInfoBlockView(isPrizes ? "howDoesItWorks" : "prizes"));
  });

  el.append(
    toggle,
    isPrizes ? renderPrizes(copy) : renderHowDoesItWorks(copy),
  );
  return el;
};
