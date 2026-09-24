import { initGlass, startRenderLoop } from "./modules/glass.js";
import { initFooterClock } from "./modules/clock.js";
import { lockZoom } from "./modules/zoom-lock.js";
import { revealWhenReady } from "./modules/ready.js";

const QUIPS = [
  "This page doesn’t exist. Never has.",
  "You’ve scrolled right off the glass.",
  "Nothing to see here. Literally.",
  "I checked twice. It’s not back here either.",
  "Whatever was here, it wasn’t built on the internet.",
];

const quip = document.getElementById("quip");
if (quip) quip.textContent = QUIPS[Math.floor(Math.random() * QUIPS.length)];

revealWhenReady();
lockZoom();
initFooterClock();
initGlass();
startRenderLoop();
