# Glitch Prod

Portfolio site for **Glitch Prod** — a creative video & media agency based in Sfax, Tunisia.

Dark, cinematic single-page site featuring optimized portfolio videos.

## Stack

Static HTML / CSS / JS — no build step. Optimized for Vercel static hosting.

```
index.html      # markup
styles.css      # cinematic dark theme + glitch effects
script.js       # nav, scroll reveals, custom video players
images/         # logo + video posters
videos/         # web-optimized H.264 portfolio clips
vercel.json     # clean URLs + long-lived media caching
```

## Video optimization

Source clips were re-encoded with ffmpeg (H.264, CRF 26, `+faststart`):

| Clip   | Before | After   |
| ------ | ------ | ------- |
| Reel 1 | 28 MB  | 3.4 MB  |
| Reel 2 | 95 MB  | 14.8 MB |

## Deploy

Pushed to GitHub and connected to Vercel — no framework, output served from repo root.

```bash
# local preview
npx serve .
```

## Contact

📍 Sfax, Tunisia · WhatsApp **56 637 236**
