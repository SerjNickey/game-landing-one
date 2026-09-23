import { useSelector } from "../../hooks/useSelector.js";
import { getSafeCopy } from "../../i18n/safes.js";
import "./MInfoBlock.css";

const STEP_ICONS = ["one", "two", "three"];

const PRIZE_CARDS = [{ icon: "one" }, { icon: "two" }, { icon: "three" }];

function appendStepCopy(target, step) {
  const title = document.createElement("b");
  title.textContent = `${step.title}:`;
  target.append(title, ` ${step.text}`);
}

function renderHowDoesItWorks(copy) {
  const section = document.createElement("div");
  section.className = "m-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "m-info-block__heading";
  heading.textContent = copy.howTitle;

  const steps = document.createElement("div");
  steps.className = "m-info-block__steps";

  copy.steps.forEach((step, indexValue) => {
    const item = document.createElement("div");
    item.className = "m-info-block__step";

    const index = document.createElement("div");
    index.className = `m-info-block__step-index m-info-block__step-index--${STEP_ICONS[indexValue]}`;
    index.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "m-info-block__step-text";
    appendStepCopy(text, step);

    item.append(index, text);
    steps.append(item);
  });

  section.append(heading, steps);
  return section;
}

function renderPrizes(copy) {
  const section = document.createElement("div");
  section.className = "m-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "m-info-block__heading";
  heading.textContent = copy.prizesTitle;

  const cards = document.createElement("div");
  cards.className = "m-info-block__prizes";

  for (const card of PRIZE_CARDS) {
    const el = document.createElement("div");
    el.className = `m-info-block__prize-card m-info-block__prize-card--${card.icon}`;
    el.setAttribute("aria-hidden", "true");
    cards.append(el);
  }

  section.append(heading, cards);
  return section;
}

/**
 * Mobile info block (no toggle — controlled by parent nav).
 * Views: "howDoesItWorks" | "prizes"
 */
export const MInfoBlock = () => {
  const view = useSelector((state) => state.infoBlockView) ?? "howDoesItWorks";
  const lang = useSelector((state) => state.lang);
  const copy = getSafeCopy(lang);
  const el = document.createElement("div");
  el.className = `m-info-block m-info-block--${view}`;
  el.append(
    view === "prizes" ? renderPrizes(copy) : renderHowDoesItWorks(copy),
  );
  return el;
};
