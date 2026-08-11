import { ActionTypes } from "./actions.js";

export const initialState = {
  lang: "en",
  currentStep: "landing",
};

export function appReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_LANGUAGE:
      return { ...state, lang: action.payload };
    case ActionTypes.SET_CURRENT_STEP:
      if (state.currentStep === action.payload) return state;
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
}
