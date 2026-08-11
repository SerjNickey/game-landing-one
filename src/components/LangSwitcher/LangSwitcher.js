import { useState } from "../../hooks/useState.js";
import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import { setLanguage } from "../../store/actions.js";
import { FLAGS, LANGUAGES } from "./flags.js";
import "./LangSwithcer.css";

let outsideClickHandler = null;

function removeOutsideClick() {
  if (outsideClickHandler) {
    document.removeEventListener("click", outsideClickHandler);
    outsideClickHandler = null;
  }
}

export const LangSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = useSelector((state) => state.lang);
  const dispatch = useDispatch();

  const el = document.createElement("div");
  el.className = "lang-switcher";

  const orderedLanguages = isOpen
    ? [
        ...LANGUAGES.filter((lang) => lang.code === currentLang),
        ...LANGUAGES.filter((lang) => lang.code !== currentLang),
      ]
    : LANGUAGES.filter((lang) => lang.code === currentLang);

  el.innerHTML = `
    <div class="lang-switcher__panel ${isOpen ? "lang-switcher__panel--open" : ""}">
      ${orderedLanguages
        .map(
          (lang) => `
        <button
          type="button"
          class="lang-switcher__option ${lang.code === currentLang ? "lang-switcher__option--active" : ""}"
          data-lang="${lang.code}"
          aria-label="${lang.label}"
        >
          ${FLAGS[lang.code]}
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  el.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  el.querySelectorAll(".lang-switcher__option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      dispatch(setLanguage(lang));
      setIsOpen(false);
    });
  });

  removeOutsideClick();

  if (isOpen) {
    outsideClickHandler = (event) => {
      if (!el.contains(event.target)) {
        removeOutsideClick();
        setIsOpen(false);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", outsideClickHandler);
    }, 0);
  }

  return el;
};
