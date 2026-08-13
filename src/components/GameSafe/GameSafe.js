import confetti from "canvas-confetti";
import cursorUrl from "../../../public/images/GameSafe/cursor.png";
import "./GameSafe.css";

const SIZE = 160;
const STROKE = 5;
/** middle.png is 170×170; tick marks sit near r≈79 in source pixels. */
const MIDDLE_SIZE = 170;
const MIDDLE_TICK_RADIUS = 79;
/** Progress + cursor share the tick ring radius (scaled into SIZE). */
const RADIUS = (MIDDLE_TICK_RADIUS * SIZE) / MIDDLE_SIZE;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FILL_DURATION_MS = 4000;
const GREEN_RATIO = 0.15;
/**
 * Safe-dial haptics: short sharp detent + longer silence.
 * (~40 notches / 4s ≈ one click every 100ms)
 */
const VIBE_CLICK_MS = 25;
const VIBE_GAP_MS = 75;
/** Keep pattern short — Android rejects very long arrays. */
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
/**
 * Cursor asset tip points bottom-left (~135deg).
 * Align tip radially outward (up at start) → local rotate -225deg.
 */
const CURSOR_TIP_ROTATE_DEG = -225;
/**
 * Orbit radius for the cursor center relative to the tick ring.
 * 0 = center on ticks; negative pulls toward dial center.
 */
const CURSOR_RADIUS_OFFSET = -18;

/** Warm palette from the prize / confetti mock. */
const CONFETTI_COLORS = ["#FF2D2D", "#FF6A00", "#FFB800", "#FFE566", "#E10600"];

/** White flash hold before fade — image swap happens while fully white. */
const FLASH_HOLD_MS = 120;
const FLASH_FADE_MS = 450;

/**
 * White light flash over the safe + flying confetti.
 * `onCovered` runs while the flash is fully opaque.
 * @param {HTMLElement} host
 * @param {() => void} [onCovered]
 */
function burstConfettiFrom(host, onCovered) {
  const rect = host.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  const flash = document.createElement("div");
  flash.className = "game-safe__flash";
  host.append(flash);

  // Force paint so the flash is visible before we swap art underneath.
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
    flash.classList.add("game-safe__flash--fade");
  }, FLASH_HOLD_MS);

  window.setTimeout(
    () => {
      flash.remove();
    },
    FLASH_HOLD_MS + FLASH_FADE_MS + 50,
  );
}

function createArcCircle(className) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("class", className);
  circle.setAttribute("cx", String(SIZE / 2));
  circle.setAttribute("cy", String(SIZE / 2));
  circle.setAttribute("r", String(RADIUS));
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke-width", String(STROKE));
  circle.setAttribute("stroke-linecap", "butt");
  circle.setAttribute("transform", `rotate(-90 ${SIZE / 2} ${SIZE / 2})`);
  circle.setAttribute("stroke-dasharray", `0 ${CIRCUMFERENCE}`);
  circle.setAttribute("stroke-dashoffset", "0");
  return circle;
}

/** Draw arc segment from start..end on 0..1 range. */
function setArc(circle, start, end) {
  const from = Math.min(1, Math.max(0, start));
  const to = Math.min(1, Math.max(0, end));
  const length = Math.max(0, to - from);

  if (length <= 0) {
    circle.setAttribute("stroke-dasharray", `0 ${CIRCUMFERENCE}`);
    circle.setAttribute("stroke-dashoffset", "0");
    return;
  }

  circle.setAttribute(
    "stroke-dasharray",
    `${length * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
  );
  circle.setAttribute("stroke-dashoffset", String(-from * CIRCUMFERENCE));
}

export const GameSafe = () => {
  const el = document.createElement("div");
  el.className = "game-safe__container";

  const ring = document.createElement("div");
  ring.className = "game-safe__ring";
  ring.style.setProperty(
    "--game-safe-radius",
    `${RADIUS + CURSOR_RADIUS_OFFSET}px`,
  );
  ring.style.setProperty(
    "--game-safe-cursor-rotate",
    `${CURSOR_TIP_ROTATE_DEG}deg`,
  );

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "game-safe__svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("aria-hidden", "true");

  const track = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  track.setAttribute("class", "game-safe__track");
  track.setAttribute("cx", String(SIZE / 2));
  track.setAttribute("cy", String(SIZE / 2));
  track.setAttribute("r", String(RADIUS));
  track.setAttribute("fill", "none");
  track.setAttribute("stroke-width", String(STROKE));

  const redArc = createArcCircle(
    "game-safe__progress game-safe__progress--red",
  );
  const greenArc = createArcCircle(
    "game-safe__progress game-safe__progress--green",
  );

  svg.append(track, redArc, greenArc);

  const cursorOrbit = document.createElement("div");
  cursorOrbit.className = "game-safe__cursor-orbit";

  const cursor = document.createElement("img");
  cursor.className = "game-safe__cursor";
  cursor.src = cursorUrl;
  cursor.alt = "";
  cursor.width = 30;
  cursor.height = 30;
  cursor.draggable = false;
  cursorOrbit.append(cursor);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "game-safe__btn";
  button.textContent = "O";

  let rafId = 0;
  let vibeId = 0;
  let animating = false;
  let won = false;
  /** Filled amount 0..1 */
  let filled = 0;
  /** Random start of the green 15% window, picked once per run. */
  let greenStart = null;

  const setCursor = (value) => {
    // Orbit keeps the marker radial: long axis from center outward.
    cursorOrbit.style.transform = `rotate(${value * 360}deg)`;
  };

  const setFilled = (value) => {
    filled = Math.min(1, Math.max(0, value));

    // Continuous red fill — never split, so color change does not hitch.
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

  const resolveStop = () => {
    if (won || filled <= 0 || greenStart == null) return;

    const greenEnd = greenStart + GREEN_RATIO;
    if (filled >= greenStart && filled <= greenEnd) {
      won = true;
      console.log("You Win!");
      burstConfettiFrom(el, () => {
        // Hidden under opaque blanket — swap closed → open safe art here.
        el.style.backgroundImage = 'url("/images/GameSafe/blue.png")';
        ring.style.visibility = "hidden";
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

    if (!won && !animating && filled < 1) {
      startVibe();
      start();
    }
  });

  const freeze = () => {
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
};
