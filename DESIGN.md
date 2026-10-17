---
name: Élan
description: Bodyweight restart, one full-screen moment at a time, read from the floor.
colors:
  void: "#0a0a0a"
  ink: "#121316"
  mist: "#2a2f39"
  sand: "#c7b9a6"
  paper: "#f2f2f0"
  text-soft: "rgba(242, 242, 240, 0.74)"
  text-faint: "rgba(242, 242, 240, 0.56)"
  line: "rgba(242, 242, 240, 0.16)"
typography:
  count:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "clamp(8rem, 52vw, 13rem)"
    fontWeight: 500
    lineHeight: 0.82
    fontFeature: "\"tnum\""
  display:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "clamp(3.4rem, 17vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 12vw, 4rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "clamp(1.9rem, 8.5vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 0.95
  statement:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 600
    lineHeight: 1.05
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  lede:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 450
    letterSpacing: "0.2em"
  button:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    letterSpacing: "0.26em"
rounded:
  hair: "2px"
  control: "6px"
  round: "50%"
spacing:
  gutter: "20px"
  tab-height: "64px"
  stack-tight: "10px"
  stack: "14px"
  rail-gap: "18px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "56px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.void}"
  button-outline:
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "56px"
  rail-button:
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    width: "52px"
  rail-button-pressed:
    textColor: "{colors.sand}"
  icon-button:
    backgroundColor: "rgba(10, 10, 10, 0.45)"
    textColor: "{colors.paper}"
    rounded: "{rounded.round}"
    size: "44px"
  segment:
    backgroundColor: "rgba(242, 242, 240, 0.26)"
    rounded: "{rounded.hair}"
    height: "3px"
  segment-done:
    backgroundColor: "{colors.paper}"
  segment-current:
    backgroundColor: "{colors.sand}"
  tab-bar:
    backgroundColor: "rgba(10, 10, 10, 0.92)"
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
    height: "64px"
  tab-active:
    textColor: "{colors.paper}"
  filter-tab:
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
    padding: "8px 0"
  filter-tab-active:
    textColor: "{colors.paper}"
  toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: Élan

## Overview

**Creative North Star: "Flux plein écran"**

Each moment of a session owns the whole screen: one exercise, one number, one action, and the next moment is a single vertical flick away. The world is a full-bleed vertical media feed on a near-black ground. A public-domain photo of the move sits full width in its own 3:2 frame, its top and bottom edges dissolving into a blurred, darkened copy of itself that fills the rest of the screen; the text block rises out of that faded lower edge under a bottom scrim. Story-style segments at the top say where you are, a right-hand rail of glyphs carries the secondary controls, and one white button carries the primary action.

The system is dark-only by choice and replaced an earlier light/dark orange "bento" UI of cards, pills and KPI tiles; that dashboard vocabulary is the confirmed rejection. White is the interface colour. Sand is the single accent and it means "where you are and what is counting". Display type is a tall condensed face set in caps, large enough to read from a mat on the floor; everything else is the quiet system UI stack. Density is low: one idea per screen, generous dark space, no containers.

The phone frame is a single column capped at 480px and centred on wider screens; there is no separate desktop layout.

**Key Characteristics:**
- Full-bleed vertical feed, one complete state per screen, snap between states.
- Photo frame (3:2) with a mask fade over a blurred copy of the same photo; text overlaps the faded edge under a scrim.
- Near-black ground, white interface, one sand accent for progress, current state and the live count.
- Condensed Antonio caps for titles and numbers; system UI for body and spaced-caps labels.
- No cards, no borders around content, no decorative shadows; hairline rules only inside lists.

## Colors

A near-black, warm-white palette with one desaturated sand accent; colour comes from the photographs, not the interface.

### Primary
- **Sand** (`sand`): the only accent. Fills the current story segment, the live count numeral, the countdown track, completed cycle ticks, emphasised words in progress statements and the second line of the finish title, the current level label, a pressed rail glyph, the focus ring and text selection. It always means progress, current position or the number being counted.

### Neutral
- **Void** (`void`): the ground of every screen, the player, the exercise sheet, and the tone every scrim and gradient fades toward (as `rgba(10, 10, 10, a)`).
- **Ink** (`ink`): a half-step lighter ground for photo-less states (the progress item, the finish screen) and the placeholder behind media and tiles.
- **Mist** (`mist`): unfilled cycle ticks and scrollbar thumbs.
- **Paper** (`paper`): all interface text, the primary button fill, the toast, completed story segments, the active filter underline.
- **Paper, soft** (`text-soft`, 74%): ledes, secondary values, spaced-caps labels, the count unit.
- **Paper, faint** (`text-faint`, 56%): inactive tabs and filters, the scroll hint, fine print.
- **Hairline** (`line`, 16%): row dividers in lists and the tab bar's top edge; nothing else.

Translucent paper steps used directly in components: unfilled segments (26%), countdown track (20%), outline-button border (55%), outline-button hover wash (8%).

### Named Rules
**The Sand Means Now Rule.** Sand marks progress, the current position and the number being counted. It never fills a button, a background or decoration; if a sand element doesn't answer "where am I / how much is left", it should be paper.

**The Photo Is the Colour Rule.** The interface stays monochrome so the photograph supplies all hue. Don't add a second accent to compete with it.

## Typography

**Display Font:** Antonio (self-hosted variable woff2, weights 400–700, with Arial Narrow fallback)
**Body Font:** system-ui stack (-apple-system, Segoe UI, Roboto, Helvetica Neue)

**Character:** A tall, tight condensed face in caps gives a poster voice that reads across a room; the native UI stack stays out of its way for everything a person reads in hand.

### Hierarchy
- **Count** (500, `clamp(8rem, 52vw, 13rem)`, 0.82, tabular figures): the live seconds or reps in the player, in sand, with a soft-paper unit beside it on the baseline. Deliberately above the 6rem display cap so it reads from the floor.
- **Display** (600, `clamp(3.4rem, 17vw, 6rem)`, 0.9, caps, balanced): the session title on home and the finish title. 6rem is the ceiling for any title.
- **Headline** (600, `clamp(2.6rem, 12vw, 4rem)`, 0.9, caps): feed item titles, the library and sheet titles.
- **Title** (600, `clamp(1.9rem, 8.5vw, 2.6rem)`, 0.95, caps): the exercise name in the player and on the rest screen.
- **Statement** (600, 1.7rem, 1.05, caps): stacked progress sentences; one Antonio size step for target lines (500, 1.6rem, soft paper) and tile names (650, 1.45rem) sits beside it.
- **Body** (400, 16px, 1.45): lists, history rows, cues (1.05rem, 1.4). Lede at 1.05rem in soft paper.
- **Label** (450–500, 0.72rem, 0.2em tracking, uppercase): meta lines, level names, tab and rail labels (rail at 0.16em). Buttons use 0.82rem at 0.26em.

### Named Rules
**The Condensed Caps Rule.** Every title and every big number is Antonio, uppercase, line-height 0.82–0.95. Body and labels never use Antonio.

**The Floor Count Rule.** The live count is the one element allowed past the 6rem display ceiling. Nothing else competes with it on the player screen.

**The Label Sits Below Rule.** Spaced-caps labels describe what is above them (level under exercise name, meta under title) or sit beside the story segments as a status line. They are never stacked as a kicker above a title.

## Layout

A single phone column (`max-width: 480px`, `100dvh`), centred on large screens. Content is inset by one 20px gutter. The home view is a vertical feed with mandatory scroll-snap and `scroll-snap-stop: always`: today's session, warm-up list, one item per exercise, cool-down list, optional mobility, then a photo-less progress item on ink. In the player the same grammar runs by gesture: swipe up completes the step, swipe down goes back.

Each feed item and player stage is bottom-anchored: the photo frame, then the text block pulled up over its faded edge (about −40 to −44px), then the action. Exercise items stack the start and end frames vertically (2px seam) with a gentler mask and a short bottom scrim so the end frame stays undimmed. The right rail is absolutely placed above the text block; text blocks reserve 56–64px on the right for it. The bottom tab bar (64px plus safe-area) appears outside the player. Vertical rhythm inside blocks is 6/10/14/18px; buttons are 56px tall and full width, or paired 34% outline / remaining primary. The library is a two-column grid of 3:4 tiles, edge to edge, 2px seams, under a horizontally scrolling filter row with a right-edge fade.

Safe-area insets are respected at top and bottom on every layer.

## Elevation & Depth

Flat. Depth comes from the photograph and the gradients that settle it into the void, not from raised surfaces. The stack is: blurred, darkened backdrop copy (`blur(26px) brightness(0.42) saturate(0.8)`) → masked 3:2 frame → scrim (light top band, heavy bottom fade to 97% void) → text and controls. Layers (player, sheet) cover the screen completely rather than floating.

### Shadow Vocabulary
- **Glyph halo** (`filter: drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 2px 10px rgba(0,0,0,0.7))`): only on rail glyphs and their labels, which sit directly on photographs; it is a legibility device, not elevation.

### Named Rules
**The Scrim Is the Only Shadow Rule.** No box-shadows on surfaces. Legibility over photos is solved with the scrim, the mask fade, the glyph halo or the 92% void tab bar.

## Shapes

Almost square. Buttons and the toast take a slight 6px corner; segments, ticks and the focus ring a 2px hair radius; the overlay close button is a 44px translucent void circle. Photos and tiles are uncornered and run to the screen edge. Borders appear only as 1px hairlines between list rows and on the outline button; the active filter is a 2px paper underline, not a pill.

## Components

### Buttons
Big, quiet, unmistakable.
- **Shape:** slight corner (6px), 56px tall, full width or in a 34/66 pair.
- **Primary:** paper fill, void text, spaced caps (0.82rem, 0.26em), optional 20px leading glyph. One per screen.
- **Hover / Active / Focus:** primary brightens to pure white; all buttons press to `scale(0.98)`; 160ms on the out-expo curve. Focus is a 2px sand outline, 3px offset.
- **Outline:** transparent with a 55% paper hairline; hover adds an 8% paper wash. Used for secondary actions (+15 s, Passer, Lancer la mobilité, rating choices).

### Glyph Rail (signature)
A right-edge column of Lucide-style line glyphs (24-grid, stroke 1.75, drawn at 28px) each over a short spaced-caps label (Niv. 1, Son, Suivi, Infos, Pause, 15 s), 18px apart, 52px wide, haloed for legibility. Pressed toggles turn sand.

### Story Segments (signature)
3px bars in a flex row with 4px gaps (3px in the player): unfilled 26% paper, done in paper, current in sand. On home they count this week's sessions with a spaced-caps status line beneath; in the player they count steps beside the close button.

### Live Count (signature)
Huge sand Antonio numeral with a soft-paper unit on the baseline, a spaced-caps note beneath when needed (Par côté, En place), and a 2px countdown track whose sand fill scales linearly each second.

### Media Frame (signature)
Full-width 3:2 photo, masked transparent at top (0–14%) and bottom (72–100%), over its own blurred copy. Feed exercise items stack start and end frames; other frames alternate start/end every second (stepped, no crossfade); the rest screen shows the next move dimmed to 45%.

### Navigation
A two-tab bottom bar on 92% void with a hairline top: glyph over spaced-caps label, faint when inactive, paper when active, colour transition 160ms. Library filters are spaced-caps text tabs with a paper underline when active.

### Lists
Unboxed rows separated by hairlines: exercise name left, tabular target right in soft paper; history adds a date column. Coaching cues hang Antonio numerals in a 2rem gutter.

### Tiles
3:4 photo tiles in a 2px-seam grid, bottom gradient to 90% void, Antonio name and a spaced-caps category over it; the photo scales to 1.04 on hover over 400ms.

### Toast
Paper chip with void spaced caps (0.78rem, 650, 0.12em), 6px corner, rising 12px into place over 220ms above the tab bar.

### Motion
State changes slide on one axis: 260ms (`--snap`) on `cubic-bezier(0.16, 1, 0.3, 1)`, entering from 18% offset at 40% opacity. Reduced motion removes slides, the photo alternation, the scroll-hint nudge and the countdown easing.

## Do's and Don'ts

### Do:
- **Do** give each state the whole screen and move between states with a vertical snap (scroll-snap on home, 260ms single-axis slide in the player).
- **Do** show photos in their 3:2 frame with the top/bottom mask fade over a blurred, darkened copy, and let the text block overlap the faded edge under the scrim.
- **Do** set titles and numbers in Antonio caps at line-height 0.82–0.95, and cap titles at 6rem; only the live count exceeds it.
- **Do** keep sand for progress, current position and the live count.
- **Do** put secondary controls on the right glyph rail and keep one paper primary button per screen at 56px.
- **Do** keep stacked start/end frames undimmed; the scrim on exercise items is a short bottom band only.

### Don't:
- **Don't** build cards, pills, KPI tiles or bento grids; this world replaced exactly that.
- **Don't** add a light theme or a second accent colour.
- **Don't** use box-shadows; the scrim, mask fade and rail glyph halo are the whole depth vocabulary.
- **Don't** place a spaced-caps kicker or eyebrow above a title.
- **Don't** use Antonio for body text or labels, or the system stack for titles.
- **Don't** use sand on buttons, backgrounds or decorative marks.
