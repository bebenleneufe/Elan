# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner of the app, in their 30s, getting back into exercise after years away. They use it alone at home, with no coach and no equipment.

## Product Purpose

Élan 30+ walks the user through a 28-day bodyweight program, one short session a day (about 10–15 minutes). Each session is a guided circuit: an animated GIF demonstrates the exercise, timers and rep targets run it, rests come between moves, and audio and haptic cues mark each step. Success means finishing the 28 days without injury and wanting to keep going.

## Positioning

- A gentle restart for people in their 30s, built to rebuild the habit safely rather than push performance.
- No equipment, short sessions, at home: nothing stands between the user and doing the workout.
- An adaptive coach: after each session the user rates the effort (easy / just right / hard), and the volume of the next sessions changes by ±8%. Volume also grows each week.

## Operating Context

- In use, the phone lies on the floor and is read from a distance, often mid-exercise. During a session, timers, the current move and the next action must be readable at arm's length or further, and controls must be large tap targets.
- Outside a session, the phone is in hand: pick today's day, browse the 14 exercises, check progress.
- It is installed as a PWA from GitHub Pages and works offline. A screen wake lock keeps the phone awake during sessions.

## Capabilities and Constraints

- Stack: vanilla HTML/CSS/JS with no build step (`index.html`, `styles.css`, `js/*.js`), deployed on GitHub Pages, with a network-first service worker (`sw.js`).
- Content is in French. Code comments are in Spanish.
- Data model (`js/data.js`):
  - 14 exercises with one GIF each in `assets/gifs/`, three progression levels, coaching cues and muscle groups.
  - Session templates, and a 4-week × 7-day program.
- State lives in localStorage only: streak, completed days, workout history, fitness level (1–3), intensity multiplier, theme, sound toggle.
- Fitness level and intensity scale reps and seconds. Weekly progression adds 8% per week.
- Features: light/dark theme, sound toggle, PWA install button.
- Undecided: whether there is an end-of-program screen, a history view, or a way to resume an interrupted session.
- Open (user feedback, 2026-10-17): the program stopping at 28 days is a limit; it should go further. The user is unsure the program itself is well designed for them. The current GIFs are weak. The current interface has too much text, feels generic, and is not readable from the floor.

## Brand Commitments

- Name: "Élan 30+" (shown as "ÉLAN"), with a lightning-bolt logo.
- Voice: short, direct French in the second person ("tu"/"vous" is not fixed yet). Kept short to stay readable at a glance during effort.

- Nothing visual is sacred: name, logo, GIFs and themes may all change. Behavior must keep working.
- Must not feel aggressive (gym / neon / shouting motivation), gamified (XP, trophies, confetti), or bland.

## Evidence on Hand

- 14 exercise GIFs in `assets/gifs/`.
- App icons in `icons/` and `assets/`.
- There are no testimonials, users, or metrics, and none should be invented.

## Product Principles

1. Readable from the floor: in a session, the timer, the move and the next action win over everything else.
2. Gentle and safe over intense: the tone reassures and never shames. Making a move easier is always one tap away.
3. Zero friction: from opening the app to the first exercise takes one tap.
4. One clear path: the 28-day plan is the spine, and the exercise library supports it.

## Accessibility & Inclusion

- Large tap targets and high-contrast timers, for use at a distance and with sweaty hands.
- Audio and haptic cues back up the visual state changes.
- Respect reduced motion.
