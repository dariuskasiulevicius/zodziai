# Authoring prompt — turning a school word list into app data

Paste the prompt below into a fresh AI chat, attach the photo of the school sheet (or paste
the words as text), and work through it interactively. The output is pasted into the kid's
`lists_<kid>.json` — or loaded into `editor.html`, which validates it.

Terms used here are defined in [CONTEXT.md](../CONTEXT.md).

---

## The prompt

> I am preparing an English vocabulary list for my child, who is Lithuanian and learning
> English at school. I will give you the list as a photo of the school sheet (printed English
> words, sometimes with part of speech and IPA, with handwritten Lithuanian translations that
> may be hard to read).
>
> Produce JSON entries in exactly this shape:
>
> ```json
> {
>   "en": "animal",
>   "lt": "gyvūnas",
>   "pos": "n",
>   "ipa": "/ˈænɪml/",
>   "note": "",
>   "stage": 1
> }
> ```
>
> Rules:
>
> 1. **`en`** — the English word exactly as printed, including multi-word entries
>    ("watching TV", "the UK") and capital letters for proper nouns ("Australia").
> 2. **`lt`** — the Lithuanian translation. Use the handwriting where you can read it. Where
>    you cannot, supply the standard translation yourself and **mark it for my review**.
>    Never silently guess.
> 3. **`pos`** — one of `n`, `v`, `adj`, `adv`, `prep`, taken from the sheet. Empty if absent.
> 4. **`ipa`** — copy from the sheet if printed, otherwise leave empty. Do not invent it.
> 5. **`note`** — a short *Lithuanian* clarification, and **only** when it is needed to tell
>    two entries apart, e.g. two entries both translating to "didelis". Leave empty otherwise.
> 6. **`stage`** — group the entries into stages of about ten. Rules for stages:
>    - Each stage must **mix easy and hard** words. Never put all the hard ones together.
>      Words that look like their Lithuanian ("Brazil/Brazilija") are easy; long words,
>      multi-word phrases and abstract adjectives ("especially", "unpopular") are hard.
>    - **Do not group words by meaning.** Do not make a stage of countries, or a stage of
>      adjectives. Words that are similar in meaning interfere with each other when learned
>      together. Spread related words across different stages.
>    - Difficulty is the *only* basis for grouping. Stages are identified by number, never named.
>    - Number stages from 1. The last stage may be short.
>
> Checks you must run before showing me anything:
>
> - **Two entries with the same `lt` in one list are an error.** Tell me, and propose a `note`
>   for each rather than choosing for me.
> - Two entries with the same `en` but different `lt` are also an error — same treatment.
> - List anything you could not read on the sheet, and anything you translated yourself.
>
> How to work with me:
>
> Do not dump all ninety entries at once. Go **stage by stage**. Show me one stage, list your
> uncertain readings, wait for my corrections, then continue. At the end, output the complete
> JSON array in one block.

---

## After the AI is done

1. Open `editor.html`, load the kid's file, paste the entries in.
2. The editor re-runs the duplicate and format checks — trust it over the AI.
3. Save, commit, push. The kid's phone picks it up on next open and announces the new list.
