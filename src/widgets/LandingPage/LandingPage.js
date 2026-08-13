import { Header } from "../../components/Header/Header.js";
import { DGameSafe } from "../../components/DGameSafe/DGameSafe.js";
import { DesktopSafesList } from "../DesktopSafesList/DesktopSafesList.js";
import "./LandingPage.css";

export const LandingPage = () => {
  const el = document.createElement("div");
  el.className = "landing-page__container";
  el.append(Header());
  el.append(DesktopSafesList());
  return el;
};
