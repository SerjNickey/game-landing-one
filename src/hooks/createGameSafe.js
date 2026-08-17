import confetti from "canvas-confetti";

const MIDDLE_SIZE = 170;
const MIDDLE_TICK_RADIUS = 79;
const FILL_DURATION_MS = 4000;
const GREEN_RATIO = 0.15;
const VIBE_CLICK_MS = 25;
const VIBE_GAP_MS = 75;
const VIBE_PATTERN = [
  VIBE_CLICK_MS,
  VIBE_GAP_MS,
  VIBE_CLICK_MS,
  VIBE_GAP_MS,
  VIBE_CLICK_MS,
  VIBE_GAP_MS,
  VIBE_CLICK_MS,
  VIBE_GAP_MS,
];
const VIBE_REPEAT_MS = VIBE_PATTERN.reduce((sum, ms) => sum + ms, 0);
/** New cursor asset already points up (tip at 12 o'clock). */
const CURSOR_TIP_ROTATE_DEG = 0;
const CONFETTI_COLORS = ["#FF2D2D", "#FF6A00", "#FFB800", "#FFE566", "#E10600"];
const FLASH_HOLD_MS = 120;
const FLASH_FADE_MS = 450;

/**
 * @param {{
 *   selectedSafeId: string,
 *   classPrefix: string,
 *   size: number,
 *   stroke: number,
 *   cursorRadiusOffset: number,
 *   cursorSize: number,
 *   createOpened: (opts: { safeId: string }) => HTMLElement,
 * }} options
 */
export function createGameSafe({
  selectedSafeId,
  classPrefix,
  size,
  stroke,
  cursorRadiusOffset,
  cursorSize,
  createOpened,
}) {
  const radius = (MIDDLE_TICK_RADIUS * size) / MIDDLE_SIZE;
  const circumference = 2 * Math.PI * radius;
  const p = classPrefix;

  const el = document.createElement("div");
  el.className = `${p}__container ${p}__container--${selectedSafeId}`;

  const ring = document.createElement("div");
  ring.className = `${p}__ring`;
  ring.style.setProperty(
    "--game-safe-radius",
    `${radius + cursorRadiusOffset}px`,
  );
  ring.style.setProperty(
    "--game-safe-cursor-rotate",
    `${CURSOR_TIP_ROTATE_DEG}deg`,
  );

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", `${p}__svg`);
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("aria-hidden", "true");

  const createArcCircle = (className) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("class", className);
    circle.setAttribute("cx", String(size / 2));
    circle.setAttribute("cy", String(size / 2));
    circle.setAttribute("r", String(radius));
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke-width", String(stroke));
    circle.setAttribute("stroke-linecap", "butt");
    circle.setAttribute("transform", `rotate(-90 ${size / 2} ${size / 2})`);
    circle.setAttribute("stroke-dasharray", `0 ${circumference}`);
    circle.setAttribute("stroke-dashoffset", "0");
    return circle;
  };

  const setArc = (circle, start, end) => {
    const from = Math.min(1, Math.max(0, start));
    const to = Math.min(1, Math.max(0, end));
    const length = Math.max(0, to - from);
    if (length <= 0) {
      circle.setAttribute("stroke-dasharray", `0 ${circumference}`);
      circle.setAttribute("stroke-dashoffset", "0");
      return;
    }
    circle.setAttribute(
      "stroke-dasharray",
      `${length * circumference} ${circumference}`,
    );
    circle.setAttribute("stroke-dashoffset", String(-from * circumference));
  };

  const track = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  track.setAttribute("class", `${p}__track`);
  track.setAttribute("cx", String(size / 2));
  track.setAttribute("cy", String(size / 2));
  track.setAttribute("r", String(radius));
  track.setAttribute("fill", "none");
  track.setAttribute("stroke-width", String(stroke));

  const redArc = createArcCircle(`${p}__progress ${p}__progress--red`);
  const greenArc = createArcCircle(`${p}__progress ${p}__progress--green`);
  svg.append(track, redArc, greenArc);

  const cursorOrbit = document.createElement("div");
  cursorOrbit.className = `${p}__cursor-orbit`;

  const cursor = document.createElement("img");
  cursor.className = `${p}__cursor`;
  cursor.src = "/images/GameSafe/cursor_95PER.avif";
  cursor.alt = "";
  cursor.width = cursorSize;
  cursor.height = cursorSize;
  cursor.draggable = false;
  cursorOrbit.append(cursor);

  const button = document.createElement("button");
  button.type = "button";
  button.className = `${p}__btn ${p}__btn--idle`;
  button.textContent = "HOLD\nTO OPEN";

  let rafId = 0;
  let vibeId = 0;
  let animating = false;
  let won = false;
  let filled = 0;
  let greenStart = null;

  const setCursor = (value) => {
    cursorOrbit.style.transform = `rotate(${value * 360}deg)`;
  };

  const setFilled = (value) => {
    filled = Math.min(1, Math.max(0, value));
    setArc(redArc, 0, filled);
    if (greenStart == null) {
      setArc(greenArc, 0, 0);
    } else {
      const greenEnd = greenStart + GREEN_RATIO;
      setArc(greenArc, greenStart, Math.min(filled, greenEnd));
    }
    setCursor(filled);
  };

  setCursor(0);

  const startVibe = () => {
    if (!navigator.vibrate || vibeId) return;
    navigator.vibrate(VIBE_PATTERN);
    vibeId = window.setInterval(() => {
      navigator.vibrate?.(VIBE_PATTERN);
    }, VIBE_REPEAT_MS);
  };

  const stopVibe = () => {
    if (vibeId) {
      clearInterval(vibeId);
      vibeId = 0;
    }
    navigator.vibrate?.(0);
  };

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    stopVibe();
    animating = false;
  };

  const reset = () => {
    greenStart = null;
    setFilled(0);
  };

  const burstConfettiFrom = (host, onCovered) => {
    const rect = host.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    const flash = document.createElement("div");
    flash.className = `${p}__flash`;
    host.append(flash);
    flash.getBoundingClientRect();
    onCovered?.();

    const fire = (opts) =>
      confetti({
        origin: { x, y },
        colors: CONFETTI_COLORS,
        shapes: ["square"],
        disableForReducedMotion: true,
        spread: 360,
        zIndex: 40,
        ...opts,
      });

    fire({
      particleCount: 160,
      startVelocity: 28,
      scalar: 1.2,
      ticks: 260,
      gravity: 0.7,
      decay: 0.92,
    });
    fire({
      particleCount: 120,
      startVelocity: 18,
      scalar: 1.4,
      ticks: 280,
      gravity: 0.55,
      decay: 0.93,
    });

    window.setTimeout(() => {
      flash.classList.add(`${p}__flash--fade`);
    }, FLASH_HOLD_MS);

    window.setTimeout(
      () => {
        flash.remove();
      },
      FLASH_HOLD_MS + FLASH_FADE_MS + 50,
    );
  };

  const resolveStop = () => {
    if (won || filled <= 0 || greenStart == null) return;
    const greenEnd = greenStart + GREEN_RATIO;
    if (filled >= greenStart && filled <= greenEnd) {
      won = true;
      burstConfettiFrom(el, () => {
        const opened = createOpened({ safeId: selectedSafeId });
        const flash = el.querySelector(`.${p}__flash`);
        el.replaceWith(opened);
        if (flash) opened.append(flash);
      });
      return;
    }
    reset();
  };

  const start = () => {
    if (won || animating || filled >= 1) return;
    if (greenStart == null) {
      greenStart = Math.random() * (1 - GREEN_RATIO);
    }
    animating = true;
    const startFilled = filled;
    const remaining = 1 - startFilled;
    const duration = FILL_DURATION_MS * remaining;
    let startTs = 0;

    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const progressRatio = duration === 0 ? 1 : (ts - startTs) / duration;
      setFilled(startFilled + remaining * Math.min(1, progressRatio));
      if (filled >= 1) {
        stop();
        resolveStop();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    button.textContent = "STOP";
    button.classList.remove(`${p}__btn--idle`);
    button.classList.add(`${p}__btn--holding`);
    if (!won && !animating && filled < 1) {
      startVibe();
      start();
    }
  });

  const freeze = () => {
    button.textContent = "HOLD\nTO OPEN";
    button.classList.remove(`${p}__btn--holding`);
    button.classList.add(`${p}__btn--idle`);
    if (!animating) return;
    stop();
    resolveStop();
  };

  button.addEventListener("pointerup", freeze);
  button.addEventListener("pointercancel", freeze);
  button.addEventListener("contextmenu", (event) => event.preventDefault());

  ring.append(svg, cursorOrbit, button);
  el.append(ring);
  return el;
}
