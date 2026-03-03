# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

This is a **static HTML/CSS landing page** for a startup email signup campaign. It is a single-page site with no backend, no build process, and no JavaScript logic. Visitors see a full-screen hero layout and can click a button to sign up via Mailchimp.

## Repository Structure

```
Startup/
├── index.html      # Single-page landing page (entry point)
├── style.css       # Custom styles (loaded after Bootstrap)
├── Header2.jpg     # Full-screen background image (1920×1080)
└── README.md       # Minimal placeholder readme
```

## Technology Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Markup       | HTML5                                   |
| Styling      | CSS3 + Bootstrap 5.3.3 (CDN)           |
| Fonts        | Google Fonts – Montserrat               |
| Signup form  | Mailchimp hosted form (external link)   |
| Build tools  | None                                    |
| Package mgr  | None                                    |
| Tests        | None                                    |

All Bootstrap and font assets are loaded from CDNs; nothing is bundled locally.

## Development Workflow

There is no build step. To work on the site:

1. Open `index.html` directly in a browser, **or**
2. Serve locally with any static file server, e.g.:
   ```bash
   python3 -m http.server 8080
   # then visit http://localhost:8080
   ```

Changes to `index.html` or `style.css` are reflected immediately on browser refresh.

## Key Design Conventions

### Color palette
| Name        | Hex       | Usage                              |
|-------------|-----------|------------------------------------|
| Green       | `#4CDD9F` | Primary button bg, `<hr>` color    |
| Dark green  | `#106F46` | Button hover state                 |

### Typography
- Font family: **Montserrat** (Google Fonts), applied globally via `body/html`
- Heading: uppercase, bold (`text-uppercase` + `<strong>`)

### Layout
- Full-viewport height centering via Bootstrap flex utilities: `d-flex justify-content-center align-items-center vh-100`
- Background image covers the full viewport: `background-size: cover`, `background-attachment: fixed`
- A `.buffer` spacer div (`height: 10rem`) separates the heading from the CTA section

### Buttons
- All `.btn` elements use `border-radius: 300px` (pill shape), bold font, uppercase text
- `.btn-xl` adds generous padding (`1rem 2rem`)
- `.btn-primary` overrides Bootstrap's default blue with the project's green palette

## File Conventions

### index.html
- Bootstrap CSS is loaded **before** `style.css` so custom rules can override defaults
- Bootstrap version is pinned to **5.3.3** — do not upgrade without checking animation behavior (the button grow transition differs across versions; see inline comment)
- The CTA button links to the Mailchimp signup URL: `https://mailchi.mp/d5cb9aa3dded/signup`

### style.css
- Keep custom rules **minimal** — lean on Bootstrap utilities wherever possible
- Vendor-prefixed `background-size` rules (`-webkit-`, `-moz-`, `-o-`) are present for legacy browser support; retain them when modifying background properties

## Deployment

No build artifacts to generate. Deploy by copying the three files (`index.html`, `style.css`, `Header2.jpg`) to any static hosting provider:

- GitHub Pages
- Netlify (drag-and-drop or Git integration)
- AWS S3 static website hosting
- Any web server that can serve static files

## Git Conventions

- Main branch: `master`
- AI-generated feature branches follow the pattern: `claude/<descriptor>-<session-id>`
- Commit messages should be clear and descriptive
- No pre-commit hooks are active; keep commits clean manually
