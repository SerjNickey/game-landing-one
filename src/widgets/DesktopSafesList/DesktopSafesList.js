import { useDispatch } from "../../hooks/useSelector.js";
import { DESKTOP_SAFES } from "../../constants/desktopSafes.js";
import { DInfoBlock } from "../../components/DInfoBlock/DInfoBlock.js";
import { goToSelectedSafe } from "../../hooks/goToSelectedSafe.js";
import "./DesktopSafesList.css";

export const DesktopSafesList = () => {
  const dispatch = useDispatch();
  const el = document.createElement("div");
  el.className = "desktop-safes-list";

  const row = document.createElement("div");
  row.className = "desktop-safes-list__container";

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
      goToSelectedSafe(dispatch, safe.id);
    });

    item.append(title, button);
    row.append(item);
  }

  el.append(row, DInfoBlock());
  return el;
};
