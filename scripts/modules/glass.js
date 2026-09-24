const PANE_OPTIONS = {
  target: ".pane",
  snapshot: ".main-content",
  refraction: 0.026,
  bevelDepth: 0.119,
  bevelWidth: 0.057,
  frost: 0,
  specular: true,
  shadow: true,
  reveal: "fade",
};

const WAKE_EVENTS = ["scroll", "wheel", "mousemove", "pointerdown", "pointermove", "touchstart", "touchmove", "keydown", "resize"];
const ACTIVE_WINDOW_MS = 2500;
const IDLE_INTERVAL_MS = 100;

let lastInput = performance.now();
let busy = false;

export function getRenderer() {
  return window.__liquidGLRenderer__ || null;
}

export function initGlass() {
  try {
    if (typeof window.liquidGL === "function") {
      window.liquidGL({ ...PANE_OPTIONS, resolution: Math.min(3, window.devicePixelRatio || 1) });
    }
  } catch (error) {
    console.warn("Glass pane unavailable:", error);
  }
  const ready = !!getRenderer();
  document.documentElement.classList.toggle("no-glass", !ready);
  return ready;
}

export function registerDynamic(target) {
  if (getRenderer() && typeof window.liquidGL?.registerDynamic === "function") {
    window.liquidGL.registerDynamic(target);
  }
}

export function unregisterDynamic(el) {
  const renderer = getRenderer();
  if (!renderer) return;
  renderer._dynamicNodes = renderer._dynamicNodes.filter((node) => node.el !== el);
  renderer._dynMeta?.delete(el);
}

export function markDirty(els) {
  const renderer = getRenderer();
  if (!renderer) return;
  els.forEach((el) => {
    const meta = el && renderer._dynMeta?.get(el);
    if (meta) meta.needsRecapture = true;
  });
}

export function refreshLive(els) {
  markDirty(els);
  getRenderer()?.render();
}

export async function recaptureSnapshot() {
  const renderer = getRenderer();
  if (renderer?.captureSnapshot) await renderer.captureSnapshot();
}

export function setBusy(value) {
  busy = value;
}

export function wake() {
  lastInput = performance.now();
}

export function startRenderLoop({ onFrame } = {}) {
  const renderer = getRenderer();
  if (renderer) {
    if (renderer._rafId) cancelAnimationFrame(renderer._rafId);
    renderer._rafId = null;
    renderer.useExternalTicker = true;
  }

  WAKE_EVENTS.forEach((type) => window.addEventListener(type, wake, { passive: true }));

  let lastRender = 0;
  const frame = (time) => {
    onFrame?.(time);
    const active = getRenderer();
    if (active && !document.hidden) {
      const interval = time - lastInput < ACTIVE_WINDOW_MS || busy ? 0 : IDLE_INTERVAL_MS;
      if (time - lastRender >= interval) {
        lastRender = time;
        active.render();
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
