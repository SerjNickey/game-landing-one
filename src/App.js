import { useSelector } from "./hooks/useSelector.js";
import { LandingPage } from "./widgets/LandingPage/LandingPage.js";
import { DesktopSafeClicked } from "./widgets/DesktopSafeClicked/DesktopSafeClicked.js";

const widgets = {
  landing: LandingPage,
  desktopSafeClicked: DesktopSafeClicked,
};

const App = () => {
  const currentStep = useSelector((state) => state.currentStep);
  const Widget = widgets[currentStep];

  const el = document.createElement("div");
  el.className = "app";

  if (Widget) {
    el.append(Widget());
  }

  return el;
};

export default App;
