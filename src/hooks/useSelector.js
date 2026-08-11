import { getStoreInstance } from "../store/instance.js";

export function useSelector(selector) {
  return selector(getStoreInstance().getState());
}

export function useDispatch() {
  return getStoreInstance().dispatch.bind(getStoreInstance());
}
