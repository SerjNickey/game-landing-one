import { useDispatch, useSelector } from "../../hooks/useSelector.js";
import {
  setCurrentStep,
  setInfoBlockView,
  setSelectedSafe,
} from "../../store/actions.js";
import { DESKTOP_SAFES } from "../../constants/desktopSafes.js";
import { MInfoBlock } from "../../components/MInfoBlock/MInfoBlock.js";
import { preloadOpenedSafeImages } from "../../hooks/preloadOpenedSafe.js";
import "./MobileSafesList.css";

/** Persist index across remounts so translateX can animate. */
let lastSliderIndex = 0;

function cycleSafeId(currentId, direction) {
  const n = DESKTOP_SAFES.length;
  const idx = Math.max(
    0,
    DESKTOP_SAFES.findIndex((safe) => safe.id === currentId),
  );
  return DESKTOP_SAFES[(idx + direction + n) % n].id;
}

function slideIndex(safeId) {
  const idx = DESKTOP_SAFES.findIndex((safe) => safe.id === safeId);
  return idx < 0 ? 0 : idx;
}

/**
 * Mobile safes carousel — animated track, equal slides, peek neighbors.
 */
export const MobileSafesList = () => {
  const dispatch = useDispatch();
  const selectedSafeId =
    useSelector((state) => state.selectedSafeId) ?? "rare";
  const infoView =
    useSelector((state) => state.infoBlockView) ?? "howDoesItWorks";
  const isPrizes = infoView === "prizes";
  const index = slideIndex(selectedSafeId);
  const activeSafe = DESKTOP_SAFES[index];

  const el = document.createElement("div");
  el.className = "mobile-safes-list";

  const title = document.createElement("div");
  title.className = "mobile-safes-list__title";
  title.textContent = activeSafe.title;

  const slider = document.createElement("div");
  slider.className = "mobile-safes-list__slider";

  const track = document.createElement("div");
  track.className = "mobile-safes-list__track";

  for (const safe of DESKTOP_SAFES) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = [
      "mobile-safes-list__slide",
      `mobile-safes-list__slide--${safe.id}`,
      safe.id === selectedSafeId ? "mobile-safes-list__slide--active" : "",
    ]
      .filter(Boolean)
      .join(" ");
    item.setAttribute("aria-label", safe.title);
    if (safe.id === selectedSafeId) item.setAttribute("aria-current", "true");

    const art = document.createElement("div");
    art.className = `mobile-safes-list__art mobile-safes-list__art--${safe.id}`;
    art.setAttribute("aria-hidden", "true");

    item.append(art);
    item.addEventListener("click", () => {
      preloadOpenedSafeImages(safe.id);
      dispatch(setSelectedSafe(safe.id));
      dispatch(setCurrentStep("desktopSafeClicked"));
    });

    track.append(item);
  }

  slider.append(track);

  const applyTransform = (i, { animate }) => {
    const sliderWidth = slider.clientWidth;
    const slide = track.querySelector(".mobile-safes-list__slide");
    if (!slide || !sliderWidth) return;
    const slideWidth = slide.getBoundingClientRect().width;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const offset = sliderWidth / 2 - slideWidth / 2 - i * (slideWidth + gap);
    track.style.transition = animate
      ? "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const fromIndex = lastSliderIndex;
  lastSliderIndex = index;

  requestAnimationFrame(() => {
    applyTransform(fromIndex, { animate: false });
    requestAnimationFrame(() => {
      applyTransform(index, { animate: fromIndex !== index });
    });
  });

  const onResize = () => applyTransform(index, { animate: false });
  window.addEventListener("resize", onResize);

  const nav = document.createElement("div");
  nav.className = "mobile-safes-list__nav";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "mobile-safes-list__nav-arrow";
  prevBtn.setAttribute("aria-label", "Previous safe");
  prevBtn.textContent = "‹";
  if (index <= 0) {
    prevBtn.classList.add("mobile-safes-list__nav-arrow--hidden");
    prevBtn.disabled = true;
  } else {
    prevBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      dispatch(setSelectedSafe(cycleSafeId(selectedSafeId, -1)));
    });
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "mobile-safes-list__nav-toggle";
  toggleBtn.textContent = isPrizes ? "BACK TO RULES" : "WHAT'S INSIDE?";
  toggleBtn.addEventListener("click", () => {
    dispatch(setInfoBlockView(isPrizes ? "howDoesItWorks" : "prizes"));
  });

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "mobile-safes-list__nav-arrow";
  nextBtn.setAttribute("aria-label", "Next safe");
  nextBtn.textContent = "›";
  if (index >= DESKTOP_SAFES.length - 1) {
    nextBtn.classList.add("mobile-safes-list__nav-arrow--hidden");
    nextBtn.disabled = true;
  } else {
    nextBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      dispatch(setSelectedSafe(cycleSafeId(selectedSafeId, 1)));
    });
  }

  nav.append(prevBtn, toggleBtn, nextBtn);
  el.append(title, slider, nav, MInfoBlock());

  const observer = new MutationObserver(() => {
    if (!el.isConnected) {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    }
  });
  queueMicrotask(() => {
    const parent = el.parentNode;
    if (parent) observer.observe(parent, { childList: true });
  });

  return el;
};
