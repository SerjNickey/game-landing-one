import { createStore } from "./store.js";
import { appReducer, initialState as appInitialState } from "./reducer.js";
import { setStoreInstance } from "./instance.js";
import { api } from "../api/index.js";

const hot = import.meta.hot;
const preloadedState = hot?.data?.state;

function rootReducer(state, action) {
  const appState =
    state == null
      ? undefined
      : {
          lang: state.lang,
          currentStep: state.currentStep,
          selectedSafeId: state.selectedSafeId,
        };

  const nextApp = appReducer(appState, action);
  const nextApi = api.reducer(state?.[api.reducerPath], action);

  return {
    ...nextApp,
    [api.reducerPath]: nextApi,
  };
}

function getPreloadedState() {
  if (preloadedState) return preloadedState;

  return {
    ...appInitialState,
    [api.reducerPath]: undefined,
  };
}

export const store =
  hot?.data?.store ?? createStore(rootReducer, getPreloadedState());

setStoreInstance(store);

if (hot) {
  hot.dispose((data) => {
    data.store = store;
    data.state = store.getState();
  });
}
