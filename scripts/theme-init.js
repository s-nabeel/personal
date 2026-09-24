(function () {
  var root = document.documentElement;
  if ("noModule" in document.createElement("script")) root.classList.add("js");

  var stored = null;
  try {
    stored = window.localStorage.getItem("theme");
  } catch (e) {}

  var prefersLight = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
  var light = stored === "light" || (stored !== "dark" && prefersLight);
  if (light) root.setAttribute("data-theme", "light");

  var meta = document.getElementById("theme-color");
  if (meta) meta.setAttribute("content", light ? "#f5f5f7" : "#000000");
})();
