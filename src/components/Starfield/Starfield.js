import { isMobileViewport, MOBILE_MEDIA_QUERY } from "../../styles/viewport.js";
import "./Starfield.css";

const DESKTOP = {
  count: 10000,
  speed: 0.00024,
};

const MOBILE = {
  count: 120,
  speed: 0.0024,
};

const FAR = 1;
const NEAR = 0.02;

function getSettings() {
  return isMobileViewport() ? MOBILE : DESKTOP;
}

function createStar() {
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random(),
    prevZ: 0,
  };
}

/**
 * Canvas starfield flying toward the viewer. Mount once (outside App remounts).
 */
export const Starfield = () => {
  const canvas = document.createElement("canvas");
  canvas.className = "starfield";
  canvas.setAttribute("aria-hidden", "true");

  const ctx = canvas.getContext("2d", { alpha: false });
  let settings = getSettings();
  let stars = Array.from({ length: settings.count }, createStar);
  let rafId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const applySettings = () => {
    const next = getSettings();
    if (next.count !== settings.count) {
      stars = Array.from({ length: next.count }, createStar);
    }
    settings = next;
  };

  const resize = () => {
    applySettings();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const resetStar = (star) => {
    star.x = Math.random() * 2 - 1;
    star.y = Math.random() * 2 - 1;
    star.z = FAR;
    star.prevZ = FAR;
  };

  const tick = () => {
    ctx.fillStyle = "rgba(10, 10, 10, 1)";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.max(width, height) * 0.55;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillStyle = "#ffffff";
    ctx.lineCap = "round";

    for (const star of stars) {
      star.prevZ = star.z;
      star.z -= settings.speed;

      if (star.z <= NEAR) {
        resetStar(star);
        continue;
      }

      const k = scale / star.z;
      const x = cx + star.x * k;
      const y = cy + star.y * k;
      const prevK = scale / star.prevZ;
      const px = cx + star.x * prevK;
      const py = cy + star.y * prevK;

      const closeness = 1 - star.z;
      const size = 0.4 + closeness * 1.8;
      const alpha = 0.25 + closeness * 0.75;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(tick);
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  resize();

  if (reduced.matches) {
    ctx.fillStyle = "rgba(10, 10, 10, 1)";
    ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      const k = (Math.max(width, height) * 0.55) / Math.max(star.z, 0.08);
      ctx.globalAlpha = 0.35 + (1 - star.z) * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        width / 2 + star.x * k,
        height / 2 + star.y * k,
        0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else {
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.matchMedia(MOBILE_MEDIA_QUERY).addEventListener("change", resize);

  return canvas;
};
