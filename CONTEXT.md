# Dictionary

A phone-friendly static web app that helps two Lithuanian children of different ages
and abilities rehearse the English vocabulary they are given at school, ahead of a written school test.

## Language

### Content

**Word List**:
A named, teacher-given set of words the child must learn for one school test.
_Avoid_: deck, set, lesson, unit

**Entry**:
One English word together with its Lithuanian translation, belonging to exactly one **Word List**.
_Avoid_: word, pair, card

**Kid**:
One child, owning their own **Word Lists** and their own progress.
Nothing is shared between **Kids**, even when the words are identical — they differ in
ability and are tuned separately. One device belongs to exactly one **Kid**.
_Avoid_: user, profile, learner, student, grade

**English Side**:
The English text of an **Entry** — the answer the child must produce and spell correctly.

**Lithuanian Side**:
The Lithuanian text of an **Entry** — shown as the prompt.

**Note**:
A short Lithuanian clarification shown beside the **Lithuanian Side**, explaining which
meaning is being asked. Never part of the answer.
_Avoid_: hint, comment, description

### Practice

**Practice Round**:
A single sitting in the app, covering some or all **Entries** of one **Word List**.
_Avoid_: test, quiz, game, session

**School Test**:
The real written test at school, covering 10–15 **Entries** chosen by the teacher from a
**Word List** and not announced in advance. Never produced by this app — only rehearsed by it.
Because the selection is unknown, the whole **Word List** must be **Ready**; there is no
subset worth studying.
_Avoid_: test (unqualified), exam

**Stage**:
A numbered group of about ten **Entries** within a **Word List**, worked through one at a
time so that a ninety-word list has a visible next step. Each **Stage** deliberately mixes
easy and hard **Entries** and is never grouped by meaning, because words of similar meaning
interfere with each other when learned together. **Stages** are identified by number only.
_Avoid_: chunk, group, level, batch, theme

**Part of Speech**:
The grammatical class printed beside the **English Side** on the school sheet — noun,
adjective, preposition, verb, adverb. Shown with the **Prompt**, and the usual reason two
**Entries** share a **Lithuanian Side**.

**Prompt**:
The **Lithuanian Side** shown to the child, who must supply the **English Side**.

**Recall Direction**:
Which side is shown and which must be produced. The **School Test** direction is
Lithuanian → English; any other direction is practice variety, not rehearsal.

**Answer Mode**:
How the child supplies the **English Side** — typed free text (primary, mirrors the
**School Test**) or multiple choice (variety only, easier than the **School Test**).

**Near-Miss**:
A typed answer one letter away from the **English Side** (two, for long words). Not correct —
the **School Test** would mark it wrong — but it neither earns nor costs progress.

**Streak**:
Consecutive correct answers for one **Entry**. Correct adds one, wrong removes one,
a **Near-Miss** leaves it unchanged. Never drops below zero.

**Ready**:
An **Entry** whose **Streak** has reached the current **Pass**'s threshold, with at least one
of those answers given on a different calendar day. The only signal that predicts the
**School Test**.
_Avoid_: learned, mastered, done, complete

**Pass**:
A full sweep of a **Word List** at a given **Streak** threshold — 3, 5, 7, 9, then 11. When
every **Entry** is **Ready**, the next **Pass** opens and the threshold rises; earlier
**Passes** stay visibly completed. **Stages** do not re-lock: later **Passes** draw from the
whole **Word List**. After the fifth **Pass** the list is finished.
_Avoid_: level (belongs to XP), round, lap, cycle

**Effort**:
Words practised, time spent and days in a row. Rewards showing up. Deliberately kept
separate from **Ready** so that hard work never inflates the readiness figure.

## Relationships

- A **Word List** contains one or more **Entries**
- An **Entry** belongs to exactly one **Word List**
- A **Practice Round** rehearses **Entries** from exactly one **Word List** — mostly from the
  current **Stage**, the rest reviewing earlier ones
- A **Word List** is learned in order to pass one **School Test**
- A **Kid** has many **Word Lists**
- A **Word List** is divided into **Stages** of about ten **Entries**, used only during the
  first **Pass**
- An **Entry** belongs to exactly one **Stage**, assigned when authored and movable by the parent
- A **School Test** samples 10–15 **Entries** from one **Word List**, unannounced
- A **Word List** belongs to exactly one **Kid**; identical words for two **Kids** are
  two separate **Entries**, maintained separately on purpose

## Example dialogue

> **Dev:** "When the child finishes a **Practice Round** with every answer correct, have they passed?"
> **Parent:** "No — they have passed nothing. Only the **School Test** passes or fails. The app just says they are ready."
> **Dev:** "And if they pick every right answer in multiple choice?"
> **Parent:** "That is not the same skill. The **School Test** makes them write the **English Side** from memory, spelling included."
>
> **Dev:** "Two **Entries** both say *didelis*. Which one do I ask for?"
> **Parent:** "Neither, until I fix it. Add a **Note** to each so the child knows which meaning I mean —
> the app must never accept the other one just because it is also correct English."

## Flagged ambiguities

- "test" was used for both the app's exercises and the real school test — resolved:
  the app runs a **Practice Round**; the school runs a **School Test**. The app never
  calls its own exercise a test.
- Recognition (choosing the right English word) and production (writing it) were treated
  as the same achievement — resolved: they are different skills. Only production
  rehearses the **School Test**.
- Content was briefly scoped by school grade — resolved: everything is scoped by **Kid**.
  The children differ in ability and are managed individually; duplicated words across
  **Kids** are accepted as the cost of that.
- "Random" was used for both word selection and word order — resolved: order within a
  **Practice Round** is shuffled, but which **Entries** appear is weighted towards low
  **Streak**. Uniform random selection was rejected as a waste of short practice sessions.
- A parent-curated list of mandatory words mixed into every **Practice Round** was designed
  and then removed — **Stages** with review already keep older words in circulation, and a
  second always-on list would have been a permanent tax on every round.
- Mixing words from older **Word Lists** into practice was considered and rejected — a
  **Practice Round** never draws outside the chosen **Word List**. Words circulate between
  **Stages** within that list, and nowhere else. The child is asked to learn one list at a
  time, completely.
- Accepting synonyms was considered and rejected — an **Entry** is a pair, and only its own
  **English Side** is correct. Two **Entries** sharing a **Lithuanian Side** is an authoring
  error, caught by validation and resolved with a **Note**.
