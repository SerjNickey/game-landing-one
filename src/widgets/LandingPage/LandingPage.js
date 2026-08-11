import { Header } from "../../components/Header/Header.js";
import "./LandingPage.css";

export const LandingPage = () => {
  const el = document.createElement("div");
  el.className = "landing-page__container";
  el.append(Header());
  return el;
};
