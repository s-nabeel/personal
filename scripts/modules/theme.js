import { recaptureSnapshot } from "./glass.js";

const STORAGE_KEY = "theme";
const CHROME_COLORS = { dark: "#000000", light: "#f5f5f7" };
const root = document.documentElement;
const listeners = new Set();
let transitionBusy = false;

function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function currentTheme() {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function onThemeChange(listener) {
  listeners.add(listener);
}

function applyTheme(theme) {
  if (theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  document.getElementById("theme-color")?.setAttribute("content", CHROME_COLORS[theme]);
  listeners.forEach((listener) => listener(theme));
}

function withTransition(apply) {
  if (transitionBusy || typeof document.startViewTransition !== "function") {
    apply();
    return recaptureSnapshot();
  }
  transitionBusy = true;
  const transition = document.startViewTransition(async () => {
    apply();
    await recaptureSnapshot();
  });
  transition.ready.catch(() => {});
  transition.updateCallbackDone.catch(() => {});
  return transition.finished.catch(() => {}).finally(() => {
    transitionBusy = false;
  });
}

export function setTheme(theme, { persist = true } = {}) {
  if (theme !== "light" && theme !== "dark") return;
  if (persist) writeStored(theme);
  if (theme === currentTheme()) return;
  withTransition(() => applyTheme(theme));
}

export function initThemeToggle(button) {
  button?.addEventListener("click", () => setTheme(currentTheme() === "light" ? "dark" : "light"));

  const systemQuery = window.matchMedia?.("(prefers-color-scheme: light)");
  systemQuery?.addEventListener?.("change", (event) => {
    if (!readStored()) setTheme(event.matches ? "light" : "dark", { persist: false });
  });
}
