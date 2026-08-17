import { useSelector } from "../../hooks/useSelector.js";
import "./MInfoBlock.css";

const HOW_IT_WORKS_STEPS = [
  {
    icon: "one",
    text: "<b>Press & Hold:</b> Press and hold the handle in the center. The dial will start spinning.",
  },
  {
    icon: "two",
    text: "<b>Watch the zone:</b> A highlighted <b>Hot Zone</b> will appear at a random spot on the scale.",
  },
  {
    icon: "three",
    text: "<b>Time it right:</b> Release your finger exactly when the pointer hits the zone!",
  },
];

const PRIZE_CARDS = [{ icon: "one" }, { icon: "two" }, { icon: "three" }];

function renderHowDoesItWorks() {
  const section = document.createElement("div");
  section.className = "m-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "m-info-block__heading";
  heading.textContent = "How does it work?";

  const steps = document.createElement("div");
  steps.className = "m-info-block__steps";

  for (const step of HOW_IT_WORKS_STEPS) {
    const item = document.createElement("div");
    item.className = "m-info-block__step";

    const index = document.createElement("div");
    index.className = `m-info-block__step-index m-info-block__step-index--${step.icon}`;
    index.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "m-info-block__step-text";
    text.innerHTML = step.text;

    item.append(index, text);
    steps.append(item);
  }

  section.append(heading, steps);
  return section;
}

function renderPrizes() {
  const section = document.createElement("div");
  section.className = "m-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "m-info-block__heading";
  heading.textContent = "Prizes";

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
  const el = document.createElement("div");
  el.className = `m-info-block m-info-block--${view}`;
  el.append(view === "prizes" ? renderPrizes() : renderHowDoesItWorks());
  return el;
};
