import { getRenderer, markDirty, refreshLive, registerDynamic, setBusy, unregisterDynamic } from "./glass.js";
import { setTheme } from "./theme.js";

const SERIF_FONT_URL = "https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap";
const CONFETTI_Z = 20000;
const FIREWORK_COLORS = ["#ff2d78", "#ff7a1a", "#b06bff", "#4db8ff", "#ffffff"];
const IMPACT_COLORS = ["#f5f5f7", "#86868b", "#c9c9ce"];
const TRIPLE_TAP_MS = 500;
const KEY_BUFFER = 10;

const sleepFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function loadSerifFont() {
  const preload = () => document.fonts?.load?.('400 1em "Instrument Serif"').catch(() => {});
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = SERIF_FONT_URL;
  link.addEventListener("load", preload, { once: true });
  document.head.append(link);
}

function createConfetti() {
  if (typeof window.confetti?.create !== "function") return () => {};
  const fire = window.confetti.create(null, { resize: true, useWorker: false });
  return (options) => fire({ zIndex: CONFETTI_Z, disableForReducedMotion: true, ...options });
}

export function initEasterEggs({ nameEl, runner, pane }) {
  if (!nameEl || !runner) return;

  const wordEl = nameEl.querySelector(".word");
  const thinkEl = nameEl.querySelector(".think");
  const stage = document.querySelector(".main-content");
  const confetti = createConfetti();
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  let dirtyUntil = 0;
  let running = false;

  loadSerifFont();

  const markNameDirty = (ms) => {
    dirtyUntil = Math.max(dirtyUntil, performance.now() + ms);
  };

  const keepLive = (isActive) => {
    setBusy(true);
    const tick = () => {
      const renderer = getRenderer();
      if (!isActive()) {
        if (renderer) renderer._fastDynamic = false;
        setBusy(false);
        return;
      }
      if (renderer) {
        const dirty = performance.now() < dirtyUntil;
        renderer._fastDynamic = dirty;
        if (dirty) markDirty([nameEl]);
        renderer.render();
      }
      requestAnimationFrame(tick);
    };
    tick();
  };

  const placeRunner = () => {
    const style = getComputedStyle(nameEl);
    const em = parseFloat(style.fontSize);
    const nameRect = nameEl.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    runner.style.fontSize = style.fontSize;
    runner.style.top = `${nameRect.top - stageRect.top + 0.4 * em}px`;
    return stageRect;
  };

  const fade = (to, duration, easing) =>
    wordEl.animate([{ opacity: to ? 0 : 1 }, { opacity: to ? 1 : 0 }], { duration, easing, fill: "forwards" }).finished;

  const swapFace = async (apply) => {
    await fade(0, 380, "ease-in");
    apply();
    wordEl.getAnimations().forEach((animation) => animation.cancel());
    await wordEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out" }).finished;
  };

  const crashIn = async () => {
    registerDynamic(runner);
    let animating = true;
    markNameDirty(900);
    keepLive(() => animating);

    await swapFace(() => nameEl.classList.add("retro"));

    const stageRect = placeRunner();
    runner.classList.add("running");
    nameEl.classList.add("thinking");
    markNameDirty(900);
    thinkEl.animate([{ opacity: 0, bottom: "-0.25em" }, { opacity: 1, bottom: "0.12em" }], {
      duration: 620,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards",
    });
    const stopLeft = wordEl.getBoundingClientRect().left - stageRect.left - runner.getBoundingClientRect().width;
    await runner.animate([{ left: "-60vw" }, { left: `${stopLeft}px` }], {
      duration: 620,
      easing: "cubic-bezier(0.7, 0, 1, 1)",
      fill: "forwards",
    }).finished;

    runner.classList.remove("running");
    nameEl.classList.add("crashed");
    nameEl.classList.remove("thinking");
    markNameDirty(800);

    const hit = wordEl.getBoundingClientRect();
    confetti({
      particleCount: 22,
      spread: 70,
      startVelocity: 24,
      ticks: 50,
      gravity: 1,
      scalar: 0.7,
      origin: { x: hit.left / window.innerWidth, y: (hit.top + hit.height * 0.55) / window.innerHeight },
      colors: IMPACT_COLORS,
    });
    await nameEl.animate(
      [
        { left: "0px" },
        { left: "0.24em", offset: 0.18 },
        { left: "-0.1em", offset: 0.45 },
        { left: "0.04em", offset: 0.72 },
        { left: "0px" },
      ],
      { duration: 720, easing: "ease-out" },
    ).finished;

    animating = false;
    unregisterDynamic(runner);
    refreshLive([nameEl]);
  };

  const crashOut = async () => {
    registerDynamic(runner);
    let animating = true;
    markNameDirty(1300);
    keepLive(() => animating);

    const thinkOut = thinkEl.animate([{ opacity: 1, bottom: "0.12em" }, { opacity: 0, bottom: "-0.3em" }], {
      duration: 520,
      easing: "cubic-bezier(0.4, 0, 1, 1)",
      fill: "forwards",
    }).finished;
    const stageRect = placeRunner();
    const startLeft = `${wordEl.querySelector(".i").getBoundingClientRect().left - stageRect.left}px`;
    runner.style.left = startLeft;
    runner.classList.add("running");
    nameEl.classList.add("leaving");
    nameEl.animate([{ left: "0px" }, { left: "-0.12em", offset: 0.25 }, { left: "0px" }], {
      duration: 520,
      easing: "ease-out",
    });
    await Promise.all([
      runner.animate([{ left: startLeft }, { left: "-60vw" }], {
        duration: 640,
        easing: "cubic-bezier(0.6, 0, 1, 1)",
        fill: "forwards",
      }).finished,
      thinkOut,
    ]);
    runner.classList.remove("running");
    runner.style.left = "";
    nameEl.classList.remove("crashed");
    nameEl.classList.add("leaving", "hold");
    thinkEl.getAnimations().forEach((animation) => animation.cancel());

    markNameDirty(900);
    await swapFace(() => nameEl.classList.remove("retro", "crashed", "leaving", "hold"));

    animating = false;
    unregisterDynamic(runner);
    refreshLive([nameEl]);
  };

  const toggleApple = async () => {
    if (running) return;
    running = true;
    const crashed = nameEl.classList.contains("crashed");
    try {
      if (reduceMotion) {
        nameEl.classList.toggle("retro", !crashed);
        nameEl.classList.toggle("crashed", !crashed);
        await sleepFrame();
        refreshLive([nameEl]);
      } else if (crashed) {
        await crashOut();
      } else {
        await crashIn();
      }
    } finally {
      running = false;
    }
  };

  const fireworks = () => {
    const end = Date.now() + 2500;
    const burst = () => {
      confetti({
        particleCount: 45,
        startVelocity: 32,
        spread: 360,
        ticks: 70,
        gravity: 0.9,
        origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.4 },
        colors: FIREWORK_COLORS,
      });
      if (Date.now() < end) setTimeout(burst, 180 + Math.random() * 140);
    };
    burst();
  };

  const secrets = {
    dark: () => setTheme("dark"),
    light: () => setTheme("light"),
    nabeel: fireworks,
    apple: toggleApple,
  };

  let buffer = "";
  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
    buffer = (buffer + event.key.toLowerCase()).slice(-KEY_BUFFER);
    const word = Object.keys(secrets).find((secret) => buffer.endsWith(secret));
    if (!word) return;
    buffer = "";
    secrets[word]();
  });

  let taps = 0;
  let tapTimer = null;
  document.addEventListener("pointerup", (event) => {
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    const rect = pane?.getBoundingClientRect();
    if (!rect || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    taps += 1;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (taps = 0), TRIPLE_TAP_MS);
    if (taps === 3) {
      taps = 0;
      toggleApple();
    }
  });
}
