---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["styles.css","js/app.js"]
---

# Surface brief: Élan app shell (index.html)

Scope: the whole PWA — home feed, session player, exercise library, exercise sheet. Mode: Operate.
Audience and job: the owner, in their 30s, restarting exercise at home. The home screen gets them into today's session in one tap. During the session the phone lies on the floor and is read from a distance.
Constraints: vanilla HTML/CSS/JS, no build step, offline PWA, French copy kept short, public-domain photos (850×567 landscape, start and end frames).

## Direction contract

THESIS: Each moment of the session owns the whole screen: one exercise, one number, one action, and the next one is a single flick away. The interface refuses the fitness-app dashboard of cards, pills and KPI tiles.

OWN-WORLD: The ground is near-black void (#0a0a0a) and ink (#121316). Photos run full-bleed under a soft bottom scrim. White is the only interface colour. Sand (#c7b9a6) is the single accent, used only for progress and the live count. Display type is a tall condensed face (Antonio) in caps. Body type is the system UI stack. Small labels are spaced caps. There are no cards, borders, gradients or shadows besides the scrim. Thin story-style segments at the top show where you are.

STORY: The user opens the app and sees today's session as a full-screen photo with a giant title. They tap Commencer. Each exercise then fills the screen, the count is readable from the mat, and swiping up moves on. They finish, say how it felt, and the next session waits.

FIRST VIEWPORT: The home screen is a full-bleed photo of the session's first exercise. At the top, 4 thin segments show this week's sessions, with the done ones filled. Low on the left: a spaced-caps kicker (CYCLE 1 · REPRISE · SEMAINE 1), a condensed title at about 18vw (HAUT DU CORPS), a focus line, a meta line (11 MIN · 2 TOURS · 4 EXOS), and a full-width white COMMENCER button. On the right, a rail of glyphs: niveau, son, programme. Below it, one flick away: the session's exercises as full-screen items, then mobilité, then progress.

FORM: vertical full-bleed media feed (dealt challenger pop-culture-shelf-vertical-video-feed-surface, chosen by the user over the assigned "Cahier Seyès", which was candidate 5 of 7 on my list). Seed key b0d983ae. The signature interaction is the vertical snap between complete states: CSS scroll-snap on the home screen; in the player, swiping up completes the step and swiping down goes back, each with a 260 ms single-axis slide (instant under reduced motion).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
