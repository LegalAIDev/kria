# kria

Static prototype for the Kria Hebrew fluency app.

## Run locally (easiest)

Start the site with Node.js (no extra dependencies required):

```bash
npm start
```

Then open `http://localhost:8080`.

You can also set a custom port:

```bash
PORT=3000 npm start
```

## Netlify deployment setup

If the app is not loading on Netlify, configure the site as a **static publish**:

- **Build command:** *(leave empty)*
- **Publish directory:** `.`

This repo also includes `netlify.toml` so Netlify auto-detects the correct setup:

- Publishes from the repository root.
- Uses no build step.
- Redirects all paths to `index.html` (SPA fallback) so deep links still render.
