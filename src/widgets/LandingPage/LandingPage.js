import { Header } from "../../components/Header/Header.js";
import { DesktopSafesList } from "../DesktopSafesList/DesktopSafesList.js";
import { MobileSafesList } from "../MobileSafesList/MobileSafesList.js";
import { isMobileViewport } from "../../styles/viewport.js";
import "./LandingPage.css";

export const LandingPage = () => {
  const el = document.createElement("div");
  el.className = "landing-page__container";
  el.append(Header());
  el.append(isMobileViewport() ? MobileSafesList() : DesktopSafesList());
  return el;
};
