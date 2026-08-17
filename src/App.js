import { useSelector } from "./hooks/useSelector.js";
import { LandingPage } from "./widgets/LandingPage/LandingPage.js";
import { DesktopSafeClicked } from "./widgets/DesktopSafeClicked/DesktopSafeClicked.js";
import { MobileSafeClicked } from "./widgets/MobileSafeClicked/MobileSafeClicked.js";
import {
  isMobileViewport,
  MOBILE_MEDIA_QUERY,
} from "./styles/viewport.js";

export { MOBILE_MEDIA_QUERY, isMobileViewport };

const App = () => {
  const currentStep = useSelector((state) => state.currentStep);
  const mobile = isMobileViewport();

  const widgets = {
    landing: LandingPage,
    desktopSafeClicked: mobile ? MobileSafeClicked : DesktopSafeClicked,
  };

  const Widget = widgets[currentStep];

  const el = document.createElement("div");
  el.className = "app";

  if (Widget) {
    el.append(Widget());
  }

  return el;
};

export default App;
