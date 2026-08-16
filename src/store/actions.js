export const ActionTypes = {
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",
  SET_SELECTED_SAFE: "SET_SELECTED_SAFE",
  SET_INFO_BLOCK_VIEW: "SET_INFO_BLOCK_VIEW",
  RESET_APP_FLOW: "RESET_APP_FLOW",
};

export function setLanguage(lang) {
  return { type: ActionTypes.SET_LANGUAGE, payload: lang };
}

export function setCurrentStep(step) {
  return { type: ActionTypes.SET_CURRENT_STEP, payload: step };
}

export function setSelectedSafe(safeId) {
  return { type: ActionTypes.SET_SELECTED_SAFE, payload: safeId };
}

/** @param {"howDoesItWorks" | "prizes"} view */
export function setInfoBlockView(view) {
  return { type: ActionTypes.SET_INFO_BLOCK_VIEW, payload: view };
}

/** Reset flow to the initial safes list (keeps language). */
export function resetAppFlow() {
  return { type: ActionTypes.RESET_APP_FLOW };
}
