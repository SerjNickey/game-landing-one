import { showLoader, hideLoader } from "../components/Loader/Loader.js";
import { setCurrentStep, setSelectedSafe } from "../store/actions.js";
import { preloadOpenedSafeImages } from "./preloadOpenedSafe.js";
import { preloadSafeClickedImages } from "./preloadImages.js";

export function goToSelectedSafe(dispatch, safeId) {
  showLoader();
  preloadOpenedSafeImages(safeId);
  dispatch(setSelectedSafe(safeId));
  dispatch(setCurrentStep("desktopSafeClicked"));
  preloadSafeClickedImages(safeId).finally(hideLoader);
}
