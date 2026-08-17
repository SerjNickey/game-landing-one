import { ActionTypes } from "./actions.js";

export const initialState = {
  lang: "en",
  currentStep: "landing",
  selectedSafeId: null,
  infoBlockView: "howDoesItWorks",
};

export function appReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_LANGUAGE:
      return { ...state, lang: action.payload };
    case ActionTypes.SET_CURRENT_STEP:
      if (state.currentStep === action.payload) return state;
      return { ...state, currentStep: action.payload };
    case ActionTypes.SET_SELECTED_SAFE:
      if (state.selectedSafeId === action.payload) return state;
      return { ...state, selectedSafeId: action.payload };
    case ActionTypes.SET_INFO_BLOCK_VIEW:
      if (state.infoBlockView === action.payload) return state;
      return { ...state, infoBlockView: action.payload };
    case ActionTypes.RESET_APP_FLOW:
      return {
        ...state,
        currentStep: initialState.currentStep,
        selectedSafeId: initialState.selectedSafeId,
        infoBlockView: initialState.infoBlockView,
      };
    default:
      return state;
  }
}
