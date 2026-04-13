# Pulse AI Daily

This is a simple beginner-friendly web app for showing daily AI news and progress updates.

## What this version does

- loads live AI stories from RSS feeds in the browser
- shows a dashboard with AI update cards
- lets you filter by category
- includes a "why it matters" section
- falls back to sample data if live feeds fail

## How to open it

Because this is a static app, you can open `index.html` directly in a browser.

If you want to run it from a local server instead, use:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Important note

This version uses a public RSS-to-JSON service in the browser so it can stay simple and free while you are learning.

That means:

- it should work as a beginner MVP
- it depends on internet access
- in the future, we may want a small backend for more reliability

## Next improvements

- add automatic daily refresh
- add AI-generated summaries
- let you save favorite stories
- publish it online for free with Vercel or Netlify
