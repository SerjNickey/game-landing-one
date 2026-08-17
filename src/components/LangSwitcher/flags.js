import enFlag from "../../../public/images/LangSwitcher/en.svg";
import ruFlag from "../../../public/images/LangSwitcher/ru.svg";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

export const FLAGS = {
  en: `
    <img src="${enFlag}" alt="English" class="lang-switcher__flag">
  `,
  ru: `
    <img src="${ruFlag}" alt="Russian" class="lang-switcher__flag">
  `,
};
