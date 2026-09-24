import { initGlass, refreshLive, registerDynamic, startRenderLoop } from "./modules/glass.js?v=9.0.1";
import { initThemeToggle, onThemeChange } from "./modules/theme.js?v=9.0.1";
import { createScroller, initScrollHint, initScrollProgress, registerScrollHintGlass } from "./modules/scroll.js?v=9.0.1";
import { initEasterEggs } from "./modules/egg.js?v=9.0.1";
import { initFooterClock } from "./modules/clock.js?v=9.0.1";
import { lockZoom } from "./modules/zoom-lock.js?v=9.0.1";
import { revealWhenReady } from "./modules/ready.js?v=9.0.1";

const RESIZE_SETTLE_MS = 600;

const nameEl = document.getElementById("name");
const hint = document.getElementById("scroll-hint");
const pane = document.querySelector(".pane");

revealWhenReady();
lockZoom();
initFooterClock();
initThemeToggle(document.getElementById("theme-toggle"));
onThemeChange(() => refreshLive([nameEl]));

nameEl.setAttribute("data-liquidgl-hide", "");
const glassReady = initGlass();
let liveHint = null;
if (glassReady) {
  registerDynamic(nameEl);
  liveHint = registerScrollHintGlass(hint);
}

const lenis =
  typeof window.Lenis === "function" && window.matchMedia?.("(hover: hover)").matches ? new window.Lenis() : null;
startRenderLoop({ onFrame: lenis ? (time) => lenis.raf(time) : undefined });

const scrollTo = createScroller(lenis);
initScrollProgress({
  pillAnchor: document.getElementById("pill-anchor"),
  dots: [...document.querySelectorAll(".scroll-dots__dot")],
  scrollTo,
});
initScrollHint({ hint, target: nameEl, scrollTo });

initEasterEggs({ nameEl, runner: document.getElementById("runner"), pane });

let resizeTimer = null;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => refreshLive([liveHint, nameEl]), RESIZE_SETTLE_MS);
  },
  { passive: true },
);

console.log("%cNABEEL", "color: #ffffff; font-family: monospace; font-size: 24px; font-weight: bold; padding: 10px 0;");
console.log("%cYou found the console. Try typing 'apple' on the page ;)", "color: #a3a3a3; font-family: monospace; font-size: 12px;");
