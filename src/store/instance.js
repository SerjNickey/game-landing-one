let storeInstance = null;

export function setStoreInstance(store) {
  storeInstance = store;
}

export function getStoreInstance() {
  if (!storeInstance) {
    throw new Error("[store] Store instance is not set yet.");
  }
  return storeInstance;
}
