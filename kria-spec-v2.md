# Kria (קריאה) — Product Specification v2.1

---

## Overview

Kria is a home-use Hebrew fluency app for Orthodox Jewish children in grades 5–7 attending supplemental (twice-weekly) Hebrew school. It trains reading speed, pronunciation, and fluency in weekday Shacharit davening — not comprehension, not letter identification. The child uses it independently. The parent monitors progress through the same app interface, no separate login required.

---

## Core Design Principles

**Chunk-based fluency, not letter-by-letter decoding.** The app trains pattern recognition at the phrase level, the same way Japanese reading apps train kanji recognition rather than stroke-by-stroke construction. A fluent davener sees מֶלֶךְ חַי וְקַיָּם as a single gestalt unit, not six letters.

**The siddur is the corpus.** Every word the child masters is a word they will actually encounter. No invented practice sentences. No abstract vocabulary drills.

**AI as a patient, knowledgeable older sibling.** Feedback is smart, direct, and specific — not babyish, not harsh. It names the exact word, explains what went wrong, and tells the child what to practice next.

**Progress is visible, personal, and non-competitive.** No leaderboards. No comparisons to other kids. All motivation is individual — streaks, badges, fluency scores improving over time.

**Anxiety-aware interaction design.** No countdown timers. No red failure states. No punishing mechanics. Urgency is created through positive forward momentum, never through threat of loss.

---

## Target User

| Attribute | Detail |
|---|---|
| Primary user | Child, grades 5–7 |
| Setting | Home, independent use |
| School context | Supplemental / twice-weekly Hebrew school |
| Denomination | Orthodox |
| Nusach | Nusach Ari (Chabad) |
| Customer (purchaser) | Parent |
| Usage model | Child uses app alone; parent views same progress screen |

---

## Pronunciation & Text Standards

- **Dialect:** Nusach Ari (Chabad). TTS voice model trained on or validated against authentic Chabad recordings. Explore licensing Chabad.org recordings as reference audio before committing to synthetic TTS.
- **Text:** Full nikud (vowel points) throughout all levels. No trop.
- **Nikud stripping:** Unlocked after a prayer's Boss Round scores 90+. Optional challenge mode only — never required. Completing a prayer without nikud earns a special Hard Mode badge.
- **Transliteration:** Available on-demand only. Finite per activity unit (3 hints in early levels, decreasing by 1 per mastery tier, floor of 1). Framed as a smart tool, not a crutch. Hint usage is logged and shown in the progress report.

---

## Curriculum

### Scope
Weekday Shacharit, key portions. Nusach Ari text. To be validated by a knowledgeable educator before content is finalized.

### Prayer Sequence

| Level | Prayer | Hebrew | Notes |
|---|---|---|---|
| 1 | Modeh Ani | מוֹדֶה אֲנִי | Short, familiar, perfect entry point |
| 2 | Asher Yatzar | אֲשֶׁר יָצַר | Moderate length, repetitive structure aids SRS |
| 3 | Elohai Neshama | אֱלֹהַי נְשָׁמָה | Poetic, moderate difficulty |
| 4 | Birkot HaShachar | בִּרְכוֹת הַשַּׁחַר | Split into sub-units by blessing |
| 5 | Barchu | בָּרְכוּ | Very short; high-stakes (public recitation context) |
| 6 | Shema | שְׁמַע יִשְׂרָאֵל | Central text; treated as its own arc |
| 7 | VeAhavta | וְאָהַבְתָּ | Follows Shema; dense, fast-paced |
| 8 | Emet VeYatziv | אֱמֶת וְיַצִּיב | Less familiar; good intermediate challenge |
| 9 | Amidah (opening brachot) | עֲמִידָה | Long; split into 3–4 sub-units |
| 10 | Aleinu | עָלֵינוּ | Strong closer; widely known |
| 11 | Adon Olam | אֲדוֹן עוֹלָם | Reward unlock; familiar melody, confidence builder |

Adon Olam is unlocked only after completing Level 10. Its familiarity makes it feel like a victory lap.

### Prayer Unit Structure

Each prayer is broken into **chunks** — meaningful phrase-level units, not individual words, not full sentences. Each chunk has:

- Hebrew text with full nikud
- Transliteration (hidden by default)
- Pre-cached TTS audio at 0.75x, 1.0x, and 1.25x speed
- SRS difficulty rating (1–5)
- Known common error tags (e.g., "drops final syllable," "flattens kamatz")

Each prayer level contains **5 sequential unit types**, completed in order:

| Unit | Activity | Description |
|---|---|---|
| 1 | Listen & Follow | Full prayer plays; each chunk highlights as it's read. Passive input at native speed. |
| 2 | Chunk Flash | Individual chunks appear on screen. Child taps to hear, then confirms they can read it. |
| 3 | Speed Tap | Confidence Bar fills as time passes. Child taps when ready. Stars reflect how fully the bar filled. |
| 4 | Chunk Scramble | Words from a prayer line appear scrambled. Child drags them into correct order. |
| 5 | Boss Round | Child reads the full prayer aloud and submits a recording for AI analysis. |

---

## Activity Design

### Listen & Follow
The full prayer plays at native Nusach Ari speed. Each chunk highlights in real time as it is read — karaoke style. No interaction required. Sets the rhythmic model the child will internalize. Available to replay any number of times.

### Chunk Flash
One chunk at a time, large display text. Child can:
- Tap the chunk to hear it (no hint cost — audio is always free)
- Tap the transliteration button to reveal romanization (costs 1 hint)
- Tap "I can read this" to advance

No timer. No pressure. Builds initial visual recognition.

### Speed Tap

The core fluency drill. Designed with anxiety-aware mechanics throughout.

**The Confidence Bar mechanic:**
- A calm teal bar fills *upward* from the bottom of the chunk card as time passes
- The framing is positive: the bar is filling, not depleting
- Stars (1–3) are awarded based on how full the bar is when the child taps — 3 stars if nearly full, 1 star if barely started
- Missing the window entirely (bar completes without a tap) produces no dramatic failure: a soft chime, the bar resets, the next chunk appears
- No red states. No alarm styling. The bar remains teal throughout, shifting to a warm gold wash at the moment of tap

**On correct tap:**
- The Hebrew chunk briefly illuminates — a warm gold wash behind the text, 300ms ease-out, then fades
- XP increments smoothly in the corner
- No explosion, no fanfare — clean and satisfying

**Larger celebrations** are reserved for: completing an entire unit, earning a badge, or a Boss Round score milestone. Those receive full animation, sound, and an XP shower.

**The Energy mechanic** (replaces hearts/lives):
- A small, unobtrusive amber energy meter sits in the top corner
- Energy is *earned* by confident, star-earning taps — it is not lost by wrong answers
- Running low on energy means the session naturally winds down; the app gently suggests a break or a switch to Chunk Flash
- A struggling child's session shortens gracefully rather than ending with a failure screen
- A confident child can sustain a longer session
- Energy fully restores after a Boss Round that scores 60+

**Audio button:** Always visible, never hidden, costs no hints. Tapping it costs reaction time (the bar continues filling) but is never penalized.

**Hint button:** Reveals transliteration for that chunk. Costs 1 hint from the session's hint budget. The bar pauses for 2 seconds to give the child time to read the transliteration, then resumes.

### Chunk Scramble
A complete prayer line's words appear scrambled. Child drags them into correct order. No timer in early levels; optional timed challenge unlocks at higher mastery. Builds phrase-level structural recognition without requiring meaning comprehension.

### Boss Round
The full prayer text is displayed. Child reads aloud and submits the recording.

**Flow:**
1. Child presses record
2. Audio quality check runs in real time (volume, noise floor, minimum duration)
3. If quality is insufficient, child is prompted to re-record with specific, friendly guidance
4. Child presses submit
5. Engaging loading experience activates while AI processes in background
6. Feedback report appears

**Loading experience while AI processes:** Not a spinner. The app activates an engaging interstitial — a rapid-fire Chunk Flash drill on the same prayer's chunks, framed as "Warm up while the Rabbi listens." The child stays in the learning loop. When analysis is ready, a gentle notification pulses and the child can finish the current flashcard or tap through immediately.

**Boss Round gating:** If a child scores below 60, they receive a soft redirect — not a hard block. The app identifies which specific chunks caused the score to drop and suggests returning to practice those before retrying. Language is supportive, not discouraging. The child can still proceed if they choose.

---

## AI System

### Function 1: TTS — Tap to Hear

Available on any word or chunk at any time across all activities. Never gated, never limited.

| Speed | Label | Availability |
|---|---|---|
| 0.75x | Learning Mode | Default in early units |
| 1.0x | Native | Default in later units; always available |
| 1.25x | Challenge | Unlocks after mastery milestone |

TTS speed auto-advances as the child demonstrates fluency. The child can always manually select any available speed. All TTS audio is pre-cached on first use and works fully offline.

### Function 2: Recording Analysis

Triggered by Boss Round submission. Asynchronous — runs in background while child remains engaged.

**Pipeline:**
```
Child audio → Audio quality gate → Whisper ASR (Hebrew)
→ Transcript vs. canonical text comparison
→ Claude analysis → Kid-friendly feedback report
```

**Audio quality gate:** Before upload, the app checks volume level, noise floor, and duration. If any threshold fails:
- Too quiet: "We could barely hear you — try holding the phone closer and speaking up"
- Too noisy: "There's a lot of background noise — try moving somewhere quieter"
- Too short: "It looks like the recording cut off — try again from the beginning"

**Anti-gaming:** Quality gate plus a minimum Hebrew word count requirement (verified by Whisper output) prevents garbage submissions from registering as valid attempts.

**ASR confidence handling:** When Whisper produces a low-confidence transcription, Claude flags it: "Some parts were hard to make out — this feedback may not be fully accurate. A cleaner recording will give you better results."

**Feedback report structure:**

1. **Overall score** (0–100) with delta vs. previous Boss Round attempt
2. **Top strength** — one specific thing done well, with the exact chunk cited
3. **Areas to work on** — specific words or chunks, each with:
   - The Hebrew text
   - What went wrong (e.g., "the kamatz under the kuf should be longer")
   - What to do ("tap the word below to hear it, then practice it 3 times")
4. **Hint usage** — hints used this attempt, with trend vs. previous attempt
5. **Recommendation** — return to practice (score < 60) or advance (score ≥ 60)

**Tone:** Smart, warm, direct. Assumes an intelligent child who can handle honest feedback delivered kindly. Not babyish. Not harsh.

**Example feedback entry:**
> **שֶׁהֶחֱזַרְתָּ** — This is a tough one. You're combining the first two syllables — it sounds like *shech-zar-ta* instead of *she-he-che-zar-ta*. Slow it down: she / he / che / zar / ta. Tap it at 0.75x a few times, then try at full speed.

**Audio storage:** Boss Round recordings are stored. Parent can play them back from the progress screen, with the AI feedback report displayed alongside — both the child's voice and the analysis visible simultaneously.

---

## Gamification

### Core Loop
- **XP** awarded for every completed activity, scaling with accuracy and speed
- **Stars** (1–3 per Speed Tap round based on Confidence Bar fill level) multiply XP
- **Daily streak** maintained by completing any activity for 5+ minutes
- **No competition.** No leaderboards. No friend comparisons. All motivation is personal.

### Energy Mechanic
- Replaces traditional hearts/lives
- Earned through confident reads, not lost through errors
- Session length governed naturally by energy level
- Never produces a punishing "game over" state
- Fully restores after a high-scoring Boss Round

### Transliteration Hints as Resource
- 3 hints per activity unit in early levels
- Decreases by 1 per mastery tier (floor: 1 hint per unit)
- Hint pause: bar pauses for 2 seconds when hint is used during Speed Tap
- Hint usage tracked and displayed in progress report and Boss Round feedback
- Trend over time ("1 hint this week vs. 3 last week") is a primary fluency signal

### Badges

| Badge | Trigger |
|---|---|
| Prayer badge (bronze) | Boss Round score 60–79 |
| Prayer badge (silver) | Boss Round score 80–89 |
| Prayer badge (gold) | Boss Round score 90+ |
| Hard Mode badge | Prayer completed without nikud |
| Streak badges | 7, 30, and 60-day streaks |
| Speed badges | Speed Tap completed under specific time thresholds |

### Avatar Titles

| Title | Hebrew | XP Threshold |
|---|---|---|
| Aleph Apprentice | תַּלְמִיד אָלֶף | 0 |
| Bet Brawler | לוֹחֵם בֵּית | 500 |
| Gimmel Guardian | שׁוֹמֵר גִּימֶל | 1,500 |
| Dalet Decoder | מְפַעֵן דָּלֶת | 3,000 |
| Hey Hero | גִּיבּוֹר הֵא | 6,000 |
| Vav Virtuoso | וִירְטוּאוֹז וָו | 12,000 |

---

## Adaptive Difficulty

| Dimension | Early | Advanced |
|---|---|---|
| Nikud | Full | Stripped (optional, unlocked at 90+) |
| Chunk size | Larger phrases | Shorter, more granular units |
| TTS speed default | 0.75x | 1.0x → 1.25x |
| Confidence Bar fill time | Generous | Shorter window |
| Hint availability | 3 per unit | 1 per unit |
| Scramble timer | Off | Optional on |
| SRS frequency | New chunks emphasized | Stumbled chunks resurface |

The SRS engine (SM-2 algorithm) tracks per-chunk mastery. Chunks the child stumbles on resurface more frequently. Mastered chunks fade to periodic review.

---

## Progress Screen

One screen. Same content for child and parent. No separate login. A "For Parents" section at the bottom of the child's progress screen surfaces the same data in parent-friendly framing.

### Child View
- Current streak and XP total
- Prayer completion map (all 11 levels: locked / in-progress / complete)
- Badge collection
- Fluency score graph (Boss Round scores over time, per prayer)
- Hint usage trend (declining over time = visible growth)
- Current avatar title and XP to next title
- Energy level

### Parent Section (same screen, scrolled)
- Fluency score summary across all attempted prayers
- Boss Round recording playback with AI feedback report displayed alongside
- Hint usage trend in parent-readable framing
- Streak history and session time data
- Full AI feedback history (all past Boss Round reports, browsable)

---

## Offline Mode

| Feature | Offline behavior |
|---|---|
| Listen & Follow | Fully available (audio pre-cached) |
| Chunk Flash | Fully available |
| Speed Tap | Fully available |
| Chunk Scramble | Fully available |
| Tap to Hear | Fully available (pre-cached audio) |
| Boss Round recording | Records and stores locally; uploads on reconnect |
| AI feedback | Queued; delivered when connection restored |
| XP and progress sync | Queued; syncs on reconnect |

A persistent, unobtrusive "offline" indicator appears in the app header when disconnected. Pending Boss Round submissions display as "Waiting to send — will analyze when you're back online."

---

## Design System

### Direction
**Warm Modern.** Premium consumer aesthetic. Approachable and sophisticated. Inspired by Headspace, Calm, Apple, and Claude. Mature enough for a 7th grader; inviting enough for a 5th grader. Not a toy. Not a textbook.

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Background | Warm cream | `#FAF8F4` |
| Surface | Deeper cream | `#F2EFE9` |
| Primary accent | Deep teal | `#0D7377` |
| Secondary accent | Warm gold | `#C9861A` |
| Success | Sage green | `#4A7C59` |
| Energy / warmth | Amber | `#D97706` |
| Text primary | Warm near-black | `#1C1917` |
| Text muted | Warm gray | `#78716C` |
| Border | Soft warm gray | `#E7E3DC` |

### Typography

| Use | Font | Notes |
|---|---|---|
| Section headers / titles | Syne (Bold, 700) | Geometric, confident, gives the app graphic identity |
| UI body / labels | DM Sans | Approachable, slightly rounded, reads warmly |
| Hebrew display (large) | Frank Ruhl Libre | Traditional siddur aesthetic; strong nikud at large sizes |
| Hebrew UI / small sizes | Noto Sans Hebrew | Highly legible at small sizes; excellent nikud rendering |

Both Hebrew fonts must be tested with nikud-heavy prayer text at target sizes across iPhone SE, standard Android, and iPad before committing. Minimum Hebrew display size: 28px. Feedback body: 15px minimum. No nikud clipping or overlap permitted at any target screen size.

### Interaction Language
- Card border-radius: 16px
- Button border-radius: 12px
- Soft card shadows (not borders) on elevated surfaces
- Transitions: 200ms ease-in-out for state changes; 300ms ease-out for success moments
- Confidence Bar: teal fill, smooth CSS transition, gold wash on successful tap
- No red states anywhere in the core learning flow
- Larger milestone celebrations: full animation, sound, XP shower — reserved for unit completion, badge earning, Boss Round milestones

### Key Screen: Speed Tap Layout
- Hebrew chunk: centered, large (min 42px Frank Ruhl Libre), generous vertical padding
- Confidence Bar: full-width, sits directly below the chunk card, fills upward in teal
- Audio button: bottom left, always visible
- Hint button: bottom right, shows remaining hint count
- Energy meter: top right, small amber indicator
- XP counter: top left
- Star display: appears briefly on tap, then fades — does not persist on screen

---

## Technical Architecture

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | Component-friendly; fast build |
| Styling | Tailwind CSS | Mobile-first; consistent design tokens |
| Hebrew fonts | Frank Ruhl Libre + Noto Sans Hebrew | See typography section |
| Section headings | Syne | Via Google Fonts |
| UI body font | DM Sans | Via Google Fonts |
| TTS audio | ElevenLabs or Azure Neural TTS | Validated against Nusach Ari; pre-cached at 3 speeds |
| Audio recording | MediaRecorder API (browser-native) | WebM/Opus; no native dependency |
| Speech-to-text | OpenAI Whisper (Hebrew model) | Best available Hebrew ASR |
| AI feedback | Claude claude-sonnet-4-20250514 | Feedback report generation |
| Audio quality check | Web Audio API (in-browser) | Runs before upload; no server round-trip |
| SRS engine | Custom SM-2 implementation | Per-chunk mastery state |
| Offline support | Service Worker + IndexedDB | Audio cache; queued sync |
| Backend | Supabase Edge Functions | Audio upload; AI orchestration |
| Database | Supabase (Postgres) | Progress, XP, badges, recordings, SRS state |
| Auth | Supabase Auth | Single family account; child profile model |
| Storage | Supabase Storage | Boss Round audio files |

---

## Content Data Model

```json
{
  "id": "modeh-ani",
  "name_english": "Modeh Ani",
  "name_hebrew": "מוֹדֶה אֲנִי",
  "nusach": "ari",
  "chunks": [
    {
      "id": "ma-01",
      "hebrew": "מוֹדֶה אֲנִי",
      "transliteration": "mo-DEH ah-NEE",
      "audio_urls": {
        "0.75x": "/audio/ma-01-slow.mp3",
        "1.0x": "/audio/ma-01-native.mp3",
        "1.25x": "/audio/ma-01-fast.mp3"
      },
      "srs_difficulty": 2,
      "common_errors": ["dropping final hey", "flat holam vav"]
    },
    {
      "id": "ma-02",
      "hebrew": "לְפָנֶיךָ",
      "transliteration": "leh-fah-NEH-cha",
      "audio_urls": {
        "0.75x": "/audio/ma-02-slow.mp3",
        "1.0x": "/audio/ma-02-native.mp3",
        "1.25x": "/audio/ma-02-fast.mp3"
      },
      "srs_difficulty": 4,
      "common_errors": ["merging with preceding word", "dropping final aleph sound"]
    }
  ]
}
```

---

## Open Questions Requiring Resolution

1. **TTS source:** Synthetic voice (ElevenLabs/Azure) vs. licensed Chabad recordings. The latter is more authentic and pedagogically defensible. Chabad.org has high-quality recordings of virtually every Shacharit prayer — worth pursuing before committing to a synthetic build.

2. **Curriculum validation:** The 11-prayer list should be reviewed by a knowledgeable educator or mashpia familiar with what supplemental school children actually daven and where they most commonly struggle. Confirm whether Pesukei D'Zimra or other sections belong in scope.

3. **Birkot HaShachar structure:** This prayer set is long and episodic. Decide whether it's one level with multiple Boss Rounds or several distinct numbered levels before building the curriculum data model.

4. **Hard Mode unlock timing:** Does nikud stripping unlock per-prayer immediately after a 90+ score, or only after all 11 prayers are complete? Per-prayer unlocking is more motivating — kids earn a Hard Mode badge for Modeh Ani while still working on later prayers.

5. **Parent audio UX:** When a parent plays back a Boss Round recording, the AI feedback report should display alongside it simultaneously. Design this as a first-class experience, not an afterthought.

6. **AI feedback sample set:** Before writing the Claude prompt, write 10–15 example feedback entries by hand covering the full range of error types and score levels. The tone of those samples becomes the spec for the prompt engineer.

7. **Hint granularity:** 3 hints per activity *unit* (more forgiving, recommended for MVP) vs. 3 hints per *session* (more strategic pressure). Confirm before building the hint tracking system.

---

*Kria v2.1 — April 2026*
