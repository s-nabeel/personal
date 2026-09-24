# nabeel.ca

Personal site. Static HTML, CSS and native ES modules — no build step. Deployed by Cloudflare Pages on every push to `master`.

## Structure

```
index.html              Home page markup
404.html                Not-found page markup (served automatically by Pages)
_headers                Security and cache headers for Cloudflare Pages

styles/
  tokens.css            Colours, glass, fonts, easing, z-index scale, breakpoint overrides
  base.css              Reset, page reveal, focus, view transitions
  layout.css            Stage, glows, headline text, glass pane and mask
  components.css        Glass surfaces, theme toggle, scroll hint, dots, pill, footer
  egg.css               Apple easter egg states (home only)
  404.css               Single-screen overrides for the 404 page

scripts/
  theme-init.js         Blocking theme bootstrap (prevents a wrong-theme flash)
  main.js               Home page entry
  404.js                404 page entry
  modules/
    glass.js            liquidGL setup and the demand-driven render loop
    theme.js            Theme switching, persistence, system preference
    scroll.js           Pill reveal, progress dots, scroll hint
    egg.js              Keyword secrets, triple tap, apple animation, confetti
    clock.js            Footer year and time zone clock
    zoom-lock.js        Pinch and double-tap zoom prevention
    ready.js            Page reveal timing
  vendor/
    liquidGL.js         WebGL glass renderer (MIT)

assets/                 Glow and chevron SVGs
```

## Local development

```bash
npx serve -l 8123 .
```

Open http://localhost:8123. ES modules need a server; opening the files directly will not run the scripts.

## Versioning

`index.html` and `404.html` carry the same `Version` / `Last updated` header, bumped on every commit.
