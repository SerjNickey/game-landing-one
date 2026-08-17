import lottie from "lottie-web/build/player/lottie_light";
import animationData from "../../assets/animations/loader.json";
import "./Loader.css";

let animation = null;

export function mountLoader() {
  const overlay = document.getElementById("loader");
  if (!overlay || overlay.querySelector(".loader__lottie")) return;

  const wrap = document.createElement("div");
  wrap.className = "loader__lottie";
  overlay.append(wrap);

  animation = lottie.loadAnimation({
    container: wrap,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  });
}

export function showLoader() {
  const overlay = document.getElementById("loader");
  if (!overlay) return;
  if (!overlay.querySelector(".loader__lottie")) mountLoader();

  overlay.classList.remove("loader--hidden");
  overlay.setAttribute("aria-busy", "true");
  overlay.setAttribute("aria-hidden", "false");
}

export function hideLoader() {
  const overlay = document.getElementById("loader");
  if (!overlay) return;

  overlay.classList.add("loader--hidden");
  overlay.setAttribute("aria-busy", "false");
  overlay.setAttribute("aria-hidden", "true");
}
