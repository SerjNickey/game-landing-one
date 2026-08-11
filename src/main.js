import App from "./App.js";
import "./style.css";
import { setRender, resetHooks } from "./hooks/useState.js";
import { store } from "./store/index.js";

const hot = import.meta.hot;
const root = document.getElementById("root");

sessionStorage.removeItem("experiments:store");
sessionStorage.removeItem("experiments:hooks");

function render() {
  resetHooks();
  root.replaceChildren(App());
}

function logStoreState() {
  console.log("[store state]", store.getState());
}

setRender(render);

if (!hot?.data?.isSubscribed) {
  store.subscribe(() => {
    render();
  });
  store.subscribe(logStoreState);

  if (hot) {
    hot.dispose((data) => {
      data.isSubscribed = true;
    });
  }
}

logStoreState();
render();

if (hot) {
  hot.accept("./App.js", () => {
    render();
  });
}
