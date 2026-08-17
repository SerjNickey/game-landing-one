export function createStore(reducer, preloadedState) {
  let state = preloadedState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener(action));
    return action;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  dispatch({ type: "@@INIT" });

  return { getState, dispatch, subscribe };
}
