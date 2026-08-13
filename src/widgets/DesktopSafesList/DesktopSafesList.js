import { useDispatch } from "../../hooks/useSelector.js";
import { setCurrentStep, setSelectedSafe } from "../../store/actions.js";
import { DESKTOP_SAFES } from "../../constants/desktopSafes.js";
import "./DesktopSafesList.css";

export const DesktopSafesList = () => {
  const dispatch = useDispatch();
  const el = document.createElement("div");
  el.className = "desktop-safes-list__container";

  for (const safe of DESKTOP_SAFES) {
    const item = document.createElement("div");
    item.className = `desktop-safes-list__item desktop-safes-list__item--${safe.id}`;

    const title = document.createElement("div");
    title.className = "desktop-safes-list__title";
    title.textContent = safe.title;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `desktop-safes-list__btn desktop-safes-list__btn--${safe.id}`;
    button.setAttribute("aria-label", safe.title);
    button.addEventListener("click", () => {
      dispatch(setSelectedSafe(safe.id));
      dispatch(setCurrentStep("desktopSafeClicked"));
    });

    item.append(title, button);
    el.append(item);
  }

  return el;
};
