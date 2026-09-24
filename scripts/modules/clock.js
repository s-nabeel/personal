const ZONES = [
  { id: "America/Los_Angeles", label: "San Francisco, CA." },
  { id: "UTC", label: "UTC." },
];

const formatters = new Map();

function formatterFor(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    );
  }
  return formatters.get(timeZone);
}

export function initFooterClock() {
  const year = document.getElementById("year");
  const toggle = document.getElementById("clock-toggle");
  const label = document.getElementById("clock-label");
  const time = document.getElementById("clock");
  if (year) year.textContent = String(new Date().getFullYear());
  if (!toggle || !label || !time) return;

  let zoneIndex = 0;

  const render = () => {
    time.textContent = formatterFor(ZONES[zoneIndex].id).format(new Date());
  };

  const tick = () => {
    render();
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };

  toggle.addEventListener("click", () => {
    zoneIndex = (zoneIndex + 1) % ZONES.length;
    label.textContent = ZONES[zoneIndex].label;
    render();
  });

  tick();
}
