import { Header } from "../../components/Header/Header.js";
import { GameSafe } from "../../components/GameSafe/GameSafe.js";
import "./LandingPage.css";

export const LandingPage = () => {
  const el = document.createElement("div");
  el.className = "landing-page__container";
  el.append(Header());
  el.append(GameSafe());
  return el;
};
