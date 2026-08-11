export const ActionTypes = {
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",
};

export function setLanguage(lang) {
  return { type: ActionTypes.SET_LANGUAGE, payload: lang };
}

export function setCurrentStep(step) {
  return { type: ActionTypes.SET_CURRENT_STEP, payload: step };
}
