import logoAvif from "../../../public/images/Header/logo_85PER.avif";
import logoWebp from "../../../public/images/Header/logo_100PER.webp";
import "./Header.css";

export const Header = () => {
  const el = document.createElement("header");
  el.className = "header__container";
  el.innerHTML = `
    <picture class="header__logo">
      <source srcset="${logoAvif}" type="image/avif" />
      <img
        class="header__logo-img"
        src="${logoWebp}"
        alt="Planets Casino"
        width="216"
        height="24"
      />
    </picture>
  `;
  return el;
};
