# Žodžiai

A phone app for two Lithuanian children learning English vocabulary for school tests.
Static site, no backend, works offline, added to the home screen.

Domain language: [CONTEXT.md](./CONTEXT.md) · Decisions: [docs/adr/](./docs/adr/) ·
Adding words: [docs/authoring-prompt.md](./docs/authoring-prompt.md)

## How it works

A **Kid** picks a **Word List** (a school unit, ~90 words). The list is split into numbered
**Stages** of ~10 mixed-difficulty words. A **Practice Round** shows the Lithuanian word;
the kid types the English, spelling graded. Three correct answers across at least two days
makes a word **Ready**. When the whole list is Ready, the next **Pass** opens at a higher bar
(3 → 5 → 7 → 9 → 11) and the list starts again from the whole pool, no stages.

The school **School Test** covers 10–15 unannounced words from the list, so the goal is
always the whole list, never a subset.

## Files

```
index.html            the app
editor.html           (v2) parent tool: author and validate lists, move words between stages
sw.js                 service worker
data/
  kids.json           which kids exist
  lists_<kid>.json    that kid's word lists and settings
docs/
  adr/                decisions
  authoring-prompt.md AI prompt for turning a photo of a school sheet into entries
```

### `data/kids.json`

```json
[{ "id": "vardas", "name": "Vardas" }]
```

### `data/lists_<kid>.json`

```json
{
  "kid": "vardas",
  "roundLength": 12,
  "reviewShare": 0.25,
  "collectionTheme": "creatures",
  "lists": [
    {
      "id": "starter-unit",
      "name": "Starter unit",
      "testDate": "2026-10-03",
      "entries": [
        { "en": "animal", "lt": "gyvūnas", "pos": "n", "ipa": "/ˈænɪml/", "note": "", "stage": 1 }
      ]
    }
  ]
}
```

`testDate` is optional. `note` is a Lithuanian clarification, used when two entries would
otherwise share a Lithuanian side. Progress is not in these files — it lives in
`localStorage` on the kid's phone, keyed by `en|lt`, so moving a word between stages or
lists never resets it.

## Answer rules

| Situation | Result |
|---|---|
| Exact match (case-insensitive, spaces collapsed) | Correct, Streak +1 |
| Leading `the` / `a` / `an` / `to` missing or added | Correct |
| One letter wrong (two, if the word is long) | Near-Miss — Streak unchanged, mistake highlighted |
| Right word, missing capital on a proper noun | Near-Miss — "reikia didžiosios raidės" |
| Anything else | Wrong, Streak −1 (never below 0) |

The English input has `autocorrect`, `autocapitalize` and `spellcheck` **off**. Without that
the phone silently fixes the kid's spelling and the app is worthless.

## Round composition

75% current Stage, 25% review of earlier Stages and carried stragglers — both tunable per
kid. Selection is weighted towards low Streak; order is shuffled. Later Passes ignore Stages
and draw from the whole list.

A Stage unlocks the next when **80% of its words have reached the Streak threshold** — note
that this is *not* the same bar as Ready. Ready additionally requires a second day, and
stages must be able to advance on the first evening or the child spends it on the same ten
words. Stragglers carry forward, so one stubborn word can never block progress.

The home screen therefore shows one bar with two fills:

- **blue — "Išmokta N / 91"** — words at the streak threshold. Moves today, can reach 100%
  in a single day, and is what the child watches.
- **green — "Patvirtinta kitą dieną"** — Ready. Cannot move until the next calendar day, and
  is the number that predicts the School Test.

Crossing 80% blue is celebrated once per Pass. A whole list can be taken to 100% blue in one
sitting — about 380 answers at 16 words per round, so roughly an hour — but green stays at 0
until tomorrow, and no emoji are paid until then.

Multiple choice appears only for words at Streak 0 and never advances a Streak — it is a
ramp onto typing, not an alternative to it.

## Rewards

XP: 2 for the first correct answer on a word each day, 0 for repeats that day, 25 when a word
turns Ready, 5 for finishing a round. Levels never go down. Emoji collection sets unlock on
Ready, themed per kid. Day streak counts days with at least one finished round, with one
free freeze per week. Test Day runs the full list, one attempt each, scored — correct
answers advance Streaks, wrong ones never reduce them, XP bonus once per day.

Everything is paid on Ready, never on activity — see
[ADR 0003](./docs/adr/0003-rewards-tied-to-ready.md).

## Status

**v1 is built and runs.** `index.html` + `app.js` + `styles.css` + `sw.js`, no build step, no
dependencies. Open the folder with any static server, or push it to GitHub Pages.

Working today: kid picker, Starter unit for both kids, Stages with the 80% gate, Passes 1–5,
weighted selection, typed answers with near-miss and capital-letter rules, gated multiple
choice, Ready bar, test countdown, emoji collection, offline PWA.

Not yet built (see build order below): `editor.html`, XP and levels, Test Day round, audio,
day streak.

## Build order

**v1** — per-kid JSON, practice round, weighted selection, near-miss handling, Streak/Ready,
Stages with 80% unlock, Passes, countdown and Ready bar, gated multiple choice, emoji
collection, Lithuanian UI with translations, PWA offline.
**v2** — `editor.html` with validation and stage moving, new-list announcement, day streak.
**v3** — XP and levels, Test Day round, audio (speaker button, auto-play setting for home).

Deferred: progress export/backup, sibling score sharing.

## The word data needs your review

`data/lists_kid1.json` and `data/lists_kid2.json` hold all 91 Starter unit words,
transcribed from the photo of the school sheet. The English side, part of speech and IPA come
from the printed text and are reliable. **The Lithuanian side is not** — much of the
handwriting was overwritten and unreadable, so those translations are standard ones, not
necessarily what the teacher wrote.

Worth checking first:

| Word | Used | Handwriting may have said |
|---|---|---|
| bag | krepšys | kuprinė |
| cover | dangtis | viršelis |
| curry | karis | troškinys |
| desk | suolas | rašomasis stalas |
| nice | malonus | gražus |
| sure | tikras | įsitikinęs |

Both kids have the same list. R's round is 16 words, M's is 12 — say the word if M's should be
shorter still, since a round that finishes between classes is worth more than a long one that
gets abandoned.

The children are identified as `kid1`/`kid2` and shown as **R** and **M**, so no real names
appear in this repository. Change the `name` field in `data/kids.json` if you host privately.

## Caching

App shell cache-first. Content files **network-first with a 2s timeout**, falling back to
cache — otherwise a phone serves last week's words after you push new ones. A visible
"words updated" date is part of v2, along with the new-list announcement.
