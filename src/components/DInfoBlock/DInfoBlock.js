import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import { setInfoBlockView } from "../../store/actions.js";
import "./DInfoBlock.css";

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
  section.className = "d-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "d-info-block__heading";
  heading.textContent = "How does it work?";

  const steps = document.createElement("div");
  steps.className = "d-info-block__steps";

  for (const step of HOW_IT_WORKS_STEPS) {
    const item = document.createElement("div");
    item.className = "d-info-block__step";

    const index = document.createElement("div");
    index.className = `d-info-block__step-index d-info-block__step-index--${step.icon}`;
    index.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "d-info-block__step-body";

    const text = document.createElement("div");
    text.className = "d-info-block__step-text";
    text.innerHTML = step.text;

    body.append(text);
    item.append(index, body);
    steps.append(item);
  }

  section.append(heading, steps);
  return section;
}

function renderPrizes() {
  const section = document.createElement("div");
  section.className = "d-info-block__section";

  const heading = document.createElement("h2");
  heading.className = "d-info-block__heading";
  heading.textContent = "Prizes";

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
  const isPrizes = view === "prizes";

  const el = document.createElement("div");
  el.className = `d-info-block d-info-block--${view}`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "d-info-block__toggle";
  toggle.textContent = isPrizes ? "BACK TO RULES" : "WHAT'S INSIDE?";
  toggle.addEventListener("click", () => {
    dispatch(setInfoBlockView(isPrizes ? "howDoesItWorks" : "prizes"));
  });

  el.append(toggle, isPrizes ? renderPrizes() : renderHowDoesItWorks());
  return el;
};
