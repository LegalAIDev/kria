# kria

Static prototype for the Kria Hebrew fluency app.

## Netlify deployment setup

If the app is not loading on Netlify, configure the site as a **static publish**:

- **Build command:** *(leave empty)*
- **Publish directory:** `.`

This repo also includes `netlify.toml` so Netlify auto-detects the correct setup:

- Publishes from the repository root.
- Uses no build step.
- Redirects all paths to `index.html` (SPA fallback) so deep links still render.

## Local preview

Run a static server from the repo root, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
