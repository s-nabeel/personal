const DOUBLE_TAP_MS = 300;

export function lockZoom() {
  ["gesturestart", "gesturechange", "gestureend"].forEach((type) =>
    document.addEventListener(type, (event) => event.preventDefault(), { passive: false }),
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.scale !== undefined && event.scale !== 1) event.preventDefault();
    },
    { passive: false },
  );

  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();
      const onControl = event.target instanceof Element && event.target.closest("a, button");
      if (!onControl && now - lastTouchEnd < DOUBLE_TAP_MS) event.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false },
  );
}
