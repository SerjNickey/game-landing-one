import { showLoader, hideLoader } from "../components/Loader/Loader.js";
import {
  setCurrentStep,
  setSelectedPrize,
  setSelectedSafe,
} from "../store/actions.js";
import { getRandomPrizeId } from "../constants/prizes.js";
import { preloadOpenedSafeImages } from "./preloadOpenedSafe.js";
import { preloadSafeClickedImages } from "./preloadImages.js";

export function goToSelectedSafe(dispatch, safeId) {
  showLoader();
  preloadOpenedSafeImages(safeId);
  dispatch(setSelectedSafe(safeId));
  dispatch(setSelectedPrize(getRandomPrizeId()));
  dispatch(setCurrentStep("desktopSafeClicked"));
  preloadSafeClickedImages(safeId).finally(hideLoader);
}
