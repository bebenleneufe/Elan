# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner of the app, in their 30s, getting back into exercise after years away. They use it alone at home, with no coach and no equipment.

## Product Purpose

Élan walks the user through an open-ended bodyweight program: 4-week cycles of 4 sessions a week (A upper, B lower, C upper, D lower), each about 11–17 minutes, plus an optional mobility session. Each session is a guided circuit: warm-up, a main block in 2–3 rounds, then cool-down. Two public-domain photos (start and end of the movement) demonstrate each exercise, timers and rep targets run it, rests come between moves, and audio and haptic cues mark each step. Success means rebuilding the habit without injury and wanting to keep going.

## Positioning

- A gentle restart for people in their 30s, built to rebuild the habit safely rather than push performance.
- No equipment, short sessions, at home: nothing stands between the user and doing the workout.
- An adaptive coach: after each session the user rates the effort (easy / just right / hard), and the volume of the next sessions changes by ±8%. Volume also grows each week.

## Operating Context

- In use, the phone lies on the floor and is read from a distance, often mid-exercise. During a session, timers, the current move and the next action must be readable at arm's length or further, and controls must be large tap targets.
- Outside a session, the phone is in hand: start the next session, browse the exercises, check progress.
- It is installed as a PWA from GitHub Pages and works offline. A screen wake lock keeps the phone awake during sessions.

## Capabilities and Constraints

- Stack: vanilla HTML/CSS/JS with no build step (`index.html`, `styles.css`, `js/*.js`), deployed on GitHub Pages, with a network-first service worker (`sw.js`).
- Content is in French. Code comments are in Spanish.
- Data model (`js/data.js`):
  - 18 exercises. Main movements have three levels; each level is a real variant with its own photos in `assets/photos/` and its own target. Every exercise has coaching cues and muscle groups.
  - Session templates and the cycle logic (`getProgramPosition`).
- State lives in localStorage only: program session index, workout history, fitness level (1–3), intensity multiplier, hard-rating count for the current cycle, and the sound toggle. The streak is weekly and is computed from history.
- Fitness level and intensity scale reps and seconds. Weekly progression adds 8% per week.
- Features: sound toggle, PWA install button. The interface is dark only; see DESIGN.md.
- Undecided: whether there is a way to resume an interrupted session.
- Addressed on 2026-10-17, following user feedback: the program no longer stops at 28 days, the GIFs are replaced by public-domain photos, and the interface was redesigned for floor reading and less text.

## Brand Commitments

- Name: "Élan 30+" (shown as "ÉLAN"), with a lightning-bolt logo.
- Voice: short, direct French in the second person ("tu"/"vous" is not fixed yet). Kept short to stay readable at a glance during effort.

- Nothing visual was sacred at the 2026-10-17 redesign. The current visual system is recorded in DESIGN.md.
- Must not feel aggressive (gym / neon / shouting motivation), gamified (XP, trophies, confetti), or bland.

## Evidence on Hand

- Exercise photos in `assets/photos/` (free-exercise-db, Unlicense; see `assets/photos/SOURCES.md`).
- App icons in `icons/` and `assets/`.
- There are no testimonials, users, or metrics, and none should be invented.

## Product Principles

1. Readable from the floor: in a session, the timer, the move and the next action win over everything else.
2. Gentle and safe over intense: the tone reassures and never shames. Making a move easier is always one tap away.
3. Zero friction: from opening the app to the first exercise takes one tap.
4. One clear path: the next session is always obvious, and the exercise library supports it.

## Accessibility & Inclusion

- Large tap targets and high-contrast timers, for use at a distance and with sweaty hands.
- Audio and haptic cues back up the visual state changes.
- Respect reduced motion.
