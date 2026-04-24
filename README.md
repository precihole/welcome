# Welcome

A Frappe app that displays an animated rocket launch welcome screen for logged-in users. It features a full-screen space background with dynamically generated stars, a GSAP-powered rocket countdown and liftoff animation, and a personalized welcome message.

![Rocket Welcome Animation](https://img.shields.io/badge/Frappe-App-blue)

## Features

- 🚀 **Rocket Launch Animation** — Countdown, engine start, smoke effects, and liftoff powered by GSAP
- ⭐ **Full-Screen Starfield** — 230 dynamically generated stars covering the entire viewport with parallax scrolling
- 🌌 **Space Gradient Background** — Deep space radial gradient for an immersive experience
- 👤 **Personalized Greeting** — Displays the logged-in user's full name ("Welcome Rocket, {Name}!")
- 🔁 **Session-Smart** — Shows only once per user session using `sessionStorage`
- 🧹 **Auto-Cleanup** — Rocket frame and welcome text fade out and remove themselves from the DOM after the animation

## Demo

When a user logs into the Frappe Desk, the app automatically:
1. Displays a countdown (3 → 2 → 1)
2. Starts the rocket engine with shake and smoke effects
3. Launches the rocket upward
4. Shows a personalized "Welcome Rocket" message for 3 seconds
5. Fades out and cleans up

## Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app --branch main $URL_OF_THIS_REPO
bench --site [site-name] install-app welcome
```

## How It Works

### Files

| File | Description |
|------|-------------|
| `welcome/public/js/welcome.js` | Main animation logic, GSAP timeline, star generation, session handling |
| `welcome/public/css/welcome.css` | Rocket styling, star animations, space gradient background |
| `welcome/hooks.py` | Includes JS and CSS in the Frappe Desk header |

### Key Behaviors

- **Guest users**: Animation is skipped entirely
- **Session storage**: The animation is shown only once per session per user
- **Logout cleanup**: Session storage keys are cleared on logout so the animation plays again on next login
- **External dependencies**: GSAP and Google Fonts are loaded dynamically from CDN

### Starfield Generation

Instead of fixed CSS `box-shadow` positions, stars are generated dynamically via JavaScript:

- 150 small stars (2px) — 20s animation
- 80 medium stars (3px) — 40s animation
- Randomly positioned across the full viewport using `vw`/`vh`
- Random animation delays for natural movement

## Configuration

No additional configuration is required. The app hooks into Frappe's Desk automatically via:

```python
# welcome/hooks.py
app_include_css = "/assets/welcome/css/welcome.css"
app_include_js = "/assets/welcome/js/welcome.js"
```

## Development

### Pre-commit

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/welcome
pre-commit install
```

Pre-commit is configured to use the following tools:

- ruff
- eslint
- prettier
- pyupgrade

## Requirements

- Frappe Framework v15+
- Python 3.10+

## Author

**Shubham Mishra** — shubahm@preciholesports.com

## License

MIT

