# The Futbolist — Style Guide & Design Source of Truth

> **Version:** 1.0 · June 2026  
> **Scope:** `www.thefutbolist.com` — static site at `beyourownagent/`  
> **Tagline:** All or Nothing

---

## 1. Brand Foundation

### Mission
The Futbolist is where unsigned becomes signed. A free-agent club and media platform built to put overlooked players in front of decision-makers — and make them impossible to ignore.

### The Name
The **"-ist"** makes the player the subject of the sentence: a soloist, an artist, a specialist of the game. Not a prospect. Not a trialist. A practitioner of the craft, worthy of a crest.

### Tagline
> **All or Nothing** — the reality of the free agent. There is no draft to fall back on, no guaranteed minutes. You make it or you don't. The brand never softens that. It celebrates it.

---

## 2. The Emblem — Three-Headed Wolf

The **three-headed wolf** is the heart of the identity. A free agent is the lone wolf; The Futbolist is the pack.

| Head | Meaning |
|------|---------|
| **01 — Visibility** | Get seen. The platform makes scouts look. |
| **02 — Brand** | Build the name. A player worth signing is a player worth following. |
| **03 — The Contract** | Close the deal. Visibility and brand exist to get you signed. |

### Master Artwork

**File:** `assets/wolf-crest.png` (root) / `beyourownagent/assets/wolf-crest.png` (course page)

The logo is a **horizontal illustrated wolf** — three heads in profile, dense fur linework, bone-white body with ember red eyes and ember flame tail. Transparent background. Landscape orientation (~2:1 width-to-height).

A second version (`wolf-crest-original-blackbg.png`) exists with a solid black background — for print/merch use only.

**Do not use the placeholder SVG** (heraldic shield shape) in production. All pages should use the PNG.

### Color composition
- Body / linework: `#F4EFE4` (Bone)
- Eyes: `#E8552A` (Ember)
- Flame / tail fire: `#E8552A` (Ember)
- Background: transparent (PNG)

### Sizing in the site

| Context | Constraint | Value |
|---------|-----------|-------|
| Topbar (both pages) | height | `32px`, width auto |
| Footer | height | `40px`, width auto |
| House placeholder | height | `80px`, opacity `0.25` |
| Favicon / apple-touch | square crop | `assets/wolf-crest.png` |

### Logo Lockups

| Lockup | Usage |
|--------|-------|
| **Primary** | Wolf mark left, blackletter wordmark right — topbar and footer |
| **Mark only** | Favicon, app icon, jersey patch, tight spaces |
| **On bone** | Use `wolf-crest-original-blackbg.png` for light print surfaces |

### Logo Rules
**Do:**
- Keep clear space around the mark equal to the wolf's ear height
- Use the transparent PNG on all dark backgrounds
- Let ember be the only color visible beside bone on the mark
- Hold the wordmark's blackletter form exactly as drawn

**Don't:**
- Recolor the wolf — it ships as bone + ember, always
- Stretch or crop into a square for digital (use height-based sizing)
- Add glows, bevels, or drop shadows
- Place the mark directly over a busy photograph without a scrim

---

## 3. Color System

### CSS Custom Properties (`:root`)

```css
--blackout:    #0E0E0F;
--carbon:      #16191B;
--carbon2:     #1E2123;
--bone:        #F4EFE4;
--bone-dim:    rgba(244,239,228,0.55);   /* site */  /  #BDB8AC  /* brand guide */
--ember:       #E8552A;
--ember-deep:  #B5301A;
--ash:         #74787C;
--ash-dim:     #3A3D40;
--line:        rgba(244,239,228,0.12);
--green:       #5FBF6B;   /* defined, reserved for success states */
```

### Palette Reference

| Token | Hex | RGB | Role |
|-------|-----|-----|------|
| **Blackout** | `#0E0E0F` | rgb(14, 14, 15) | Primary canvas — the arena before the player steps on |
| **Bone** | `#F4EFE4` | rgb(244, 239, 228) | Primary text, crest linework, light surfaces — warm, not stark white |
| **Ember** | `#E8552A` | rgb(232, 85, 42) | The signature — accents, CTAs, the fire in the wolf's eyes |
| **Carbon** | `#16191B` | rgb(22, 25, 27) | Card and panel surfaces, one step above blackout |
| **Carbon 2** | `#1E2123` | rgb(30, 33, 35) | Card hover state, stat card background |
| **Ember Deep** | `#B5301A` | rgb(181, 48, 26) | Shadow tone of the flame — hovers, pressed states |
| **Ash** | `#74787C` | rgb(116, 120, 124) | Muted captions, metadata, placeholders — the quiet voice |
| **Ash Dim** | `#3A3D40` | — | Borders, dividers |
| **Green** | `#5FBF6B` | — | Success states (reserved, not yet in production) |

### Color Ratio
Blackout and bone do ~85% of the work. Ember is surgical — one loud CTA per section.

```
BLACKOUT ████████████████████████████████████████████████████████████  60%
BONE     █████████████████████████  25%
CARBON   ████████  8%
EMBER    ███████  7%
```

### Common Alpha Usage
- Glow overlays: `rgba(232, 85, 42, 0.06–0.34)` — ember radials on dark surfaces
- Scrim: `rgba(14, 14, 15, 0.N)` — hero gradient overlays
- Bone overlays on hero text blocks use `backdrop-filter: blur(14px)`

---

## 4. Typography

### Fonts Loaded (Google Fonts)
```
UnifrakturCook:wght@700
Anton
Oswald:wght@400;500;600;700
Inter:wght@400;500;600
Playfair+Display:ital,wght@1,500;1,600
Space Mono:wght@400;700   (brand guide / data contexts)
```

### Font Tokens

```css
--font-blackletter: 'UnifrakturCook', serif;
--font-display:     'Anton', sans-serif;
--font-condensed:   'Oswald', sans-serif;
--font-body:        'Inter', sans-serif;
--font-serif:       'Playfair Display', serif;
```

### Type Roles

| Voice | Family | Weight | Usage |
|-------|--------|--------|-------|
| **Logotype / Masthead** | UnifrakturCook | 700 | Brand name only — wordmark in nav (18px), footer (22px), lockups (34px), cover (52–84px) |
| **Editorial Display** | Anton | Regular | All section headlines and hero text — always uppercase, tight leading (`line-height: 0.95`) |
| **Labels / UI / Eyebrows** | Oswald | 600–700 | Section labels, eyebrows, caps UI copy, stats — `letter-spacing: 0.12em–0.32em`, uppercase |
| **Body Copy** | Inter | 400–600 | Paragraphs, captions, interface — neutral, clean |
| **Italic Accent** | Playfair Display | italic 500–600 | Occasional editorial emphasis within hero headlines |
| **Data / Stats** | Space Mono | 700 | Numbers, stats, jersey data — always set in mono |

### Type Scale

| Context | Size | Notes |
|---------|------|-------|
| Hero headline | `clamp(54px, 8vw, 124px)` | Anton, `line-height: 0.95` |
| Section heads | `clamp(34px, 6vw, 64px)` | Anton |
| Final CTA | `clamp(40px, 7.5vw, 88px)` | Anton |
| Eyebrow / label | 11–13px | Oswald, `letter-spacing: 0.28–0.32em`, uppercase |
| Body lead | 19px | Inter, `color: var(--bone-dim)` |
| Body paragraph | 14–16px | Inter, `line-height: 1.6–1.7` |
| Countdown | `clamp(28px, 5vw, 40px)` | Oswald 700 |
| Price figures | `clamp(30px, 4.2vw, 38px)` | Oswald 700 |
| Stat values | 26–30px | Space Mono 700 |
| Stat labels | 9–10px | Oswald, `letter-spacing: 0.18em`, uppercase |
| Caption / meta | 12px | Oswald or Space Mono |

**Body defaults:**
```css
font-size: 16px;
line-height: 1.6;
-webkit-font-smoothing: antialiased;
```

---

## 5. Layout & Spacing

### Container

```css
--col-max: 1080px;
max-width: var(--col-max);
margin: 0 auto;
padding: 0 clamp(20px, 5vw, 60px);
```

Hero inner max-width extends to `1280px`.

### Section Rhythm

| Context | Padding |
|---------|---------|
| Standard section | `clamp(64px, 9vw, 110px) 0` |
| Generous section | `clamp(72px, 10vw, 120px) 0` |
| Section divider | `1px solid rgba(244,239,228,0.12)` (`var(--line)`) |

### Common Spacing Values
`8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 26 · 28 · 30 · 32 · 36 · 40 · 44 · 52px`

| Pattern | Value |
|---------|-------|
| Card grid gap | `14px` |
| Form row gap | `8–10px` |
| Section label bottom margin | `18px` |

### Border Radius

| Component | Radius |
|-----------|--------|
| Value cards | `5px` |
| Coach cards | `6px` |
| Topbar CTA, share button | `8px` |
| Inputs, primary buttons | `10px` |
| Ladder rows | `12px` |
| Hero form row, confirmation summary | `14px` |
| Brand guide cards / specimens | `14px` |
| Coach badge pills | `100px` |

---

## 6. Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `900px` | Hero goes single-column; aside hides |
| `820px` | Cards and coaches stack; form stacks; week rows reflow |
| `780px` | (Brand guide) grid columns go single; heading sizes reduce |
| `520px` | Topbar wordmark shrinks; countdown units compress |

---

## 7. Components & UI Patterns

### Topbar
Fixed top bar: `--blackout` background with `backdrop-filter: blur` on scroll, ember inline CTA button, UnifrakturCook wordmark.

### Hero
Full-viewport photo (`--hero-img`) with layered composition:
1. `.hero-photo` — background image, `object-fit: cover`
2. `.hero-grade` — `linear-gradient` overlay rooted in `#2a0f08`
3. `.hero-scrim` — additional fade
4. SVG grain (`body::before`) at `opacity: 0.4` via fractal noise filter

### Animated Headline Classes
| Class | Effect |
|-------|--------|
| `.word-strike` | Strike-through animation |
| `.word-hinge` | Italic hinge/rotate |
| `.word-stamp` | Stamp entrance |

### Buttons

```css
/* Primary */
background: var(--ember);
color: var(--blackout);
border-radius: 10px;
font-family: var(--font-condensed);
text-transform: uppercase;
letter-spacing: 0.12em;

/* Hover */
background: var(--ember-deep);
```

### Cards (`value-card`, `coach-card`)
- Background: `var(--carbon)` / hover: `var(--carbon2)`
- Ember accent rule appears on hover (`coach-card`)
- Grid: 3-column, `gap: 14px`

### Pricing Ladder (`.ladder-row`)
- `border-radius: 12px`
- Active/live tier: pulse animation with ember glow

### FAQ Accordion (`.faq-item`)
- JS-toggled `.open` class
- Divider: `var(--line)`

### Form Inputs
```css
background: var(--carbon);
border: 1px solid var(--ash-dim);
color: var(--bone);
border-radius: 10px;
font-family: var(--font-body);
```
Focus: `border-color: var(--ember)`

### Scroll Reveal
```css
.reveal { opacity: 0; transform: translateY(28px); }
.reveal.visible { opacity: 1; transform: none; transition: 0.7s ease; }
```

### Cursor Glow
Desktop-only ember radial that follows the mouse:
```css
background: radial-gradient(circle, rgba(232,85,42,0.34) 0%, transparent 70%);
mix-blend-mode: screen;
```
Disabled via `prefers-reduced-motion`.

---

## 8. Motion & Effects

| Property | Value |
|----------|-------|
| Scroll reveal entrance | `translateY(28px)`, `0.7s ease`, staggered delays |
| Hero entrance | `translateY(18px)`, staggered via CSS delays |
| Pulse (pricing) | CSS keyframe, ember `box-shadow` pulse |
| Grain texture | SVG `<feTurbulence>` fractal noise on `body::before`, `opacity: 0.4` |
| Glass effect (hero form) | `backdrop-filter: blur(14px)` |
| Blend modes | `mix-blend-mode: multiply` (hero layers), `screen` (cursor glow) |

**Reduced motion:** All animations, cursor glow, and grain are disabled via `@media (prefers-reduced-motion: reduce)`.

---

## 9. Voice & Tone

### Core Principles

| # | Principle | Rule |
|---|-----------|------|
| 01 | **Declarative, not hopeful** | State it. Don't plead. "You're a free agent, not a free sample." |
| 02 | **Player is the hero** | The brand is the pack, never the star. The spotlight stays on the player. |
| 03 | **Stakes are real** | Name the pressure. All or Nothing only works if nothing is also on the table. |
| 04 | **Street, not slang-chasing** | Grounded and current — never trying too hard to sound young. |

### We Say / We Don't Say

| We Say | We Don't Say |
|--------|-------------|
| "Get seen. Get signed." | "Chase your dreams!" |
| "Unsigned becomes signed." | "We help athletes succeed." |
| "The pack hunts together." | "Sign up today for our platform." |
| "Your tape is your résumé." | "#blessed #grind" |

**Tone in one line:** Short, certain, no excuses. Confidence without arrogance — earned, not gifted.

---

## 10. Asset Inventory

| Asset | Path | Notes |
|-------|------|-------|
| Wolf crest | `beyourownagent/assets/wolf-crest.png` | Primary emblem |
| Hero image | CSS var `--hero-img` → Unsplash URL | Replace with owned photography |
| Coach — Quincy | `beyourownagent/assets/coach-quincy.jpg` | |
| Coach — Jerry | `beyourownagent/assets/coach-jerry.jpg` | |
| Coach — Edson | `beyourownagent/assets/coach-edson.jpg` | |
| Favicon | Root-level or `<link>` in `<head>` | Use wolf crest alone |

---

## 11. File Structure

```
site-deploy/
├── CNAME                            → www.thefutbolist.com
├── index.html                       → Home page (thefutbolist.com)
├── confirmation.html                → JS redirect (preserves ?session_id=)
├── beyourownagent/
│   ├── index.html                   → Be Your Own Agent course page (all design tokens live here)
│   ├── confirmation.html            → Post-deposit confirmation
│   └── assets/
│       ├── wolf-crest.png
│       ├── coach-quincy.jpg
│       ├── coach-jerry.jpg
│       └── coach-edson.jpg
└── .github/workflows/deploy.yml     → GitHub Pages deploy on push to main
```

### Page inventory

| URL | File | Purpose |
|-----|------|---------|
| `thefutbolist.com/` | `index.html` | Home page — introduces the house/team, links to course |
| `thefutbolist.com/beyourownagent/` | `beyourownagent/index.html` | Be Your Own Agent course waitlist page |
| `thefutbolist.com/beyourownagent/confirmation.html` | `beyourownagent/confirmation.html` | Post-deposit Stripe confirmation |

**Note:** All CSS tokens are inline `<style>` blocks inside each HTML file. There is no external CSS file or build system. If a shared token needs updating, it must be updated in `index.html`, `beyourownagent/index.html`, and `beyourownagent/confirmation.html`.

---

## 12. Home Page — Section Reference (`index.html`)

The home page introduces The Futbolist as a free-agent team and house. The Be Your Own Agent course is a subcategory block — not competing brand language.

| Section | Anchor | Pre-launch state |
|---------|--------|-----------------|
| Hero | — | Unsplash placeholder — **swap with owned photography** |
| The Idea | `#idea` | Static — no live-content dependency |
| Watch | `#watch` | "Coming soon" panel + social follow buttons — swap with episode grid when filming begins |
| The House | `#house` | Wolf crest placeholder — replace with house/training photography |
| Apply | `#apply` | Button links to `#` — **add application form URL** |
| Be Your Own Agent | `#learn` | Live — links to `/beyourownagent/` |
| Follow the Journey | `#follow` | `HOME_FORM_ENDPOINT` in JS is blank — **add Worker URL** |
| Footer | — | Partners link points to `#` — **add partnership deck URL** |

Social `href="#"` placeholders in Watch and Follow sections — replace with real profile URLs when accounts are live.

---

## 13. Known Gaps / Tech Debt

| Item | Detail |
|------|--------|
| `--green` token defined but unused | `#5FBF6B` — reserved for success states; not yet implemented |
| `--bone-dim` discrepancy | Site uses `rgba(244,239,228,0.55)`; brand guide defines it as `#BDB8AC` — align on one value |
| Shared CSS | Tokens are duplicated across `index.html`, `beyourownagent/index.html`, and `beyourownagent/confirmation.html`; extract to a shared `styles.css` when adding a build step |
| Hero images | Both pages use Unsplash URLs — replace with owned photography before launch |
| `Space Mono` | Used in brand guide for stat/data contexts; not loaded on live pages (Oswald used for stats instead) |
| Apply form URL | `index.html` Apply CTA links to `#` — add Typeform or `/apply` page URL |
| Social URLs | All social `href="#"` placeholders in `index.html` need real profile URLs |
| Home email endpoint | `HOME_FORM_ENDPOINT` constant in `index.html` is blank — add Worker URL |
| Partners deck | Footer Partners link in `index.html` points to `#` — add PDF or external deck URL |

---

*This document is the single source of truth for The Futbolist visual identity and front-end design system. All new pages, components, and brand applications should reference this guide before deviating.*
