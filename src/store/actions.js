export const ActionTypes = {
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",
  SET_SELECTED_SAFE: "SET_SELECTED_SAFE",
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
