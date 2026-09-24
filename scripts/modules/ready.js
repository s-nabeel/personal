const SETTLE_MS = 250;
const FALLBACK_MS = 1800;

export function revealWhenReady() {
  const reveal = () => document.body.classList.add("ready");
  if (document.readyState === "complete") setTimeout(reveal, SETTLE_MS);
  else window.addEventListener("load", () => setTimeout(reveal, SETTLE_MS), { once: true });
  setTimeout(reveal, FALLBACK_MS);
}
