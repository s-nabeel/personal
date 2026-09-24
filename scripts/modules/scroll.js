import { currentTheme, onThemeChange } from "./theme.js?v=9.0.1";
import { registerDynamic } from "./glass.js?v=9.0.1";

const DOT_STOPS = [0, 0.54, 1];
const DOT_THRESHOLDS = [0.3, 0.78];
const HINT_HIT_PADDING = 28;
const END_TOLERANCE = 4;

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function createScroller(lenis) {
  return (top) => {
    const target = Math.max(0, Math.min(top, maxScroll()));
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
}

function activeDotIndex(progress) {
  const index = DOT_THRESHOLDS.findIndex((threshold) => progress < threshold);
  return index === -1 ? DOT_THRESHOLDS.length : index;
}

export function initScrollProgress({ pillAnchor, dots, scrollTo }) {
  let activeIndex = -1;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY;
    const max = maxScroll();
    pillAnchor?.classList.toggle("is-visible", max - y <= END_TOLERANCE);
    const index = activeDotIndex(max > 0 ? y / max : 0);
    if (index !== activeIndex) {
      activeIndex = index;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => scrollTo(DOT_STOPS[i] * maxScroll())));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body);
  update();
}

function isInside(event, rect, pad) {
  return (
    event.clientX >= rect.left - pad &&
    event.clientX <= rect.right + pad &&
    event.clientY >= rect.top - pad &&
    event.clientY <= rect.bottom + pad
  );
}

export function initScrollHint({ hint, target, scrollTo }) {
  if (!hint) return;

  const overHint = (event) => {
    const rect = hint.getBoundingClientRect();
    return rect.bottom > 0 && isInside(event, rect, HINT_HIT_PADDING);
  };

  let hoverQueued = false;
  document.addEventListener("mousemove", (event) => {
    if (hoverQueued) return;
    hoverQueued = true;
    requestAnimationFrame(() => {
      hoverQueued = false;
      document.body.classList.toggle("hint-hover", overHint(event));
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    if (!overHint(event)) return;
    const rect = target.getBoundingClientRect();
    scrollTo(window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2);
  });
}

export function registerScrollHintGlass(hint) {
  if (!hint) return null;
  const touchOnly = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;

  if (!touchOnly) {
    registerDynamic(hint);
    return hint;
  }

  const dark = hint.querySelector(".scroll-hint__arrow--dark");
  const light = hint.querySelector(".scroll-hint__arrow--light");
  if (!dark || !light) return null;

  const sources = { dark: dark.src, light: light.src };
  hint.removeAttribute("data-liquidgl-hide");
  light.remove();
  dark.classList.remove("scroll-hint__arrow--dark");
  dark.id = "arrow-touch";
  dark.setAttribute("data-liquidgl-hide", "");

  const syncArrow = () => {
    const wanted = sources[currentTheme()];
    if (dark.src !== wanted) dark.src = wanted;
  };
  syncArrow();
  onThemeChange(syncArrow);
  registerDynamic(dark);
  return dark;
}
