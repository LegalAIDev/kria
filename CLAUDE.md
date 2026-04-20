# Kria (קריאה) — Project Guide

## What This Is

Kria is a Hebrew fluency app for Orthodox Jewish children (grades 5–7) learning weekday Shacharit davening. It trains reading speed and pronunciation through gamified chunk-based drills — not comprehension, not letter identification.

Full product spec: `kria-spec-v2.md`  
Original UI wireframe: `kria-wireframe.html`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 + TypeScript 5 |
| Routing | Wouter 3 |
| State | React Context (GameContext) — in-memory only |
| Styling | Tailwind CSS 4 (via @theme inline) |
| UI components | Radix UI + shadcn/ui (new-york style) |
| Animations | Framer Motion |
| Hebrew fonts | Frank Ruhl Libre (display), Noto Sans Hebrew (UI) |
| Heading font | Syne |
| Body font | DM Sans |
| TTS | ElevenLabs / Azure Neural TTS (not yet wired) |
| ASR | OpenAI Whisper Hebrew (not yet wired) |
| AI feedback | Claude claude-sonnet-4-20250514 (not yet wired) |
| Backend target | Supabase Edge Functions (not yet set up) |
| Database target | Supabase Postgres (not yet set up) |

---

## Directory Structure

```
kria/
├── kria-spec-v2.md          # Full product specification (source of truth)
├── kria-wireframe.html      # Interactive HTML prototype (5 screens)
├── server.js                # Static file server for production (no API routes)
├── src/
│   ├── App.tsx              # Root — gates on userName, renders Onboarding or Router
│   ├── main.tsx
│   ├── index.css            # Design tokens, font imports, custom animations
│   ├── components/
│   │   ├── BottomNav.tsx    # Fixed bottom nav (Home + Progress tabs)
│   │   ├── TopBar.tsx       # Top bar with optional back button
│   │   └── ui/              # 50+ shadcn/ui components (don't modify)
│   ├── context/
│   │   └── GameContext.tsx  # Centralized game state — no persistence yet
│   ├── data/
│   │   ├── gameState.ts     # GameState interface + initialGameState
│   │   └── prayers.ts       # Prayer data, chunk data, avatar titles
│   ├── lib/
│   │   └── api.ts           # apiUrl() + readErrorText() helpers
│   └── pages/
│       ├── Onboarding.tsx   # Name entry — shown when state.userName is empty
│       ├── Home.tsx         # Prayer map + XP/streak/energy stats
│       ├── PrayerDetail.tsx # Activity list for a prayer
│       ├── ListenFollow.tsx # Unit 1: karaoke-style listen
│       ├── ChunkFlash.tsx   # Unit 2: flashcard drill
│       ├── SpeedTap.tsx     # Unit 3: confidence bar tap drill
│       ├── ChunkScramble.tsx # Unit 4: word ordering puzzle
│       ├── BossRound.tsx    # Unit 5: record + AI feedback
│       └── Progress.tsx     # Stats + boss round history + parent section
```

---

## Design System

### Colors (all defined as CSS variables in `index.css`)

| Role | Token | Hex |
|---|---|---|
| Background | `--background` | `#FAF8F4` warm cream |
| Surface / card | `--card` | `#F2EFE9` deeper cream |
| Primary | `--primary` | `#0D7377` deep teal |
| Secondary accent | `--accent` | `#C9861A` warm gold |
| Success | chart-3 | `#4A7C59` sage green |
| Energy | chart-4 | `#D97706` amber |
| Text | `--foreground` | `#1C1917` warm near-black |
| Muted text | `--muted-foreground` | `#78716C` warm gray |
| Border | `--border` | `#E7E3DC` soft warm gray |

**No red states anywhere in the core learning flow.** Use amber/gold for "needs attention."

### Typography

| Use | Class | Font |
|---|---|---|
| Headings | `font-syne` | Syne 700 |
| Body / labels | `font-sans` | DM Sans |
| Hebrew display (large) | `font-hebrew` | Frank Ruhl Libre — sets `dir="rtl"` |
| Hebrew UI (small) | `font-hebrew-ui` | Noto Sans Hebrew |

Minimum Hebrew display size: **28px** in activities, **42px** in SpeedTap/ChunkFlash cards.

### Interaction

- Card `border-radius`: 16px (`rounded-2xl`)
- Button `border-radius`: 12px (`rounded-xl`)
- State transitions: `200ms ease-in-out`
- Success moments: `300ms ease-out`
- Gold wash on tap: `.gold-wash` class (defined in `index.css`)

---

## Current Implementation Status

### What Works
- All 5 activity page shells exist and render
- Onboarding (name entry) gates the app correctly
- Home page: prayer map, XP, streak, energy, avatar title
- PrayerDetail: activity list with lock/current/done state
- ChunkFlash: chunk display, hint reveal, progress dots, completion
- SpeedTap: chunk display, timer logic (ref-based), hint pause, gold wash, completion
- ChunkScramble: word pool, drag-to-place, check answer, partial credit
- BossRound: mic permission, recording, processing interstitial, feedback display
- Progress: stats summary, boss round history, parent section shell
- Design system: full color palette, fonts, animations all configured

### What Doesn't Work Yet

See **Bugs & Gaps** section below.

---

## Bugs & Gaps (Prioritized)

### P0 — Broken Core Mechanics

**Bug 1: SpeedTap Confidence Bar is invisible**
- `internalFillRef` tracks fill % via `requestAnimationFrame` but NO DOM element renders the bar
- The core mechanic of this activity (teal bar fills upward → gold wash on tap) simply does not appear
- Fix: Add a positioned `<div>` below the chunk card with height driven by `internalFillRef.current`, updated via a parallel state or direct DOM manipulation
- File: `src/pages/SpeedTap.tsx`

**Bug 2: ChunkFlash audio button is fake**
- `handleAudio()` sets `audioPlaying=true` for 1.5s then clears it — no sound plays
- Spec: tapping audio should call TTS (same API as ListenFollow)
- File: `src/pages/ChunkFlash.tsx:36-39`

**Bug 3: TTS and analysis API routes don't exist**
- `ListenFollow` POSTs to `/api/prayer/tts`
- `BossRound` POSTs to `/api/prayer/analyze-reading`
- `server.js` is a static file server with no API routes — these calls always 404
- Fix options: (a) wire up Supabase Edge Functions, (b) add a dev Express server with OpenAI/ElevenLabs integration
- Files: `server.js`, `src/lib/api.ts`

**Bug 4: No state persistence**
- All game state (XP, streak, energy, boss scores, prayer progress) lives in React Context
- Cleared on every page refresh — a session restart loses everything
- Fix: Persist to `localStorage` on every state mutation (fast MVP) or Supabase (production)
- File: `src/context/GameContext.tsx`

**Bug 5: Prayer progression never advances**
- `prayer.unit` and `prayer.status` are static fields in `prayers.ts`
- Completing ListenFollow → ChunkFlash → SpeedTap does not increment `prayer.unit`
- The progress bar in PrayerDetail never moves; locked prayers stay locked
- Fix: Move progression state into `GameContext` (keyed by prayerId) and mutate on activity completion
- Files: `src/data/prayers.ts`, `src/context/GameContext.tsx`, all activity pages

### P1 — Spec Compliance Gaps

**Bug 6: SpeedTap missing star display**
- Spec: on tap, stars (1–3) briefly appear based on Confidence Bar fill level (≥80%=3, ≥40%=2, else 1)
- Currently calculated but never shown
- File: `src/pages/SpeedTap.tsx:71-73`

**Bug 7: SpeedTap missing energy meter in UI**
- Spec: amber energy meter sits in top corner of SpeedTap screen
- Energy is updated in state but not displayed on this screen
- File: `src/pages/SpeedTap.tsx`

**Bug 8: BossRound score is hardcoded**
- `addBossScore(prayerId, fb.readyToAdvance ? 85 : 65)` — always 85 or 65
- Spec: real 0-100 score from AI analysis, shown with delta vs. previous attempt
- File: `src/pages/BossRound.tsx:165`

**Bug 9: ListenFollow shows transliteration automatically**
- The active chunk's transliteration renders automatically in an amber callout
- Spec: transliteration hidden by default, only revealed by tapping the hint button (costs 1 hint)
- File: `src/pages/ListenFollow.tsx:166-170`

**Bug 10: SRS engine records but never reads**
- `chunkConfidence` is written via `recordChunkConfidence()` in SpeedTap
- Never read anywhere — difficult chunks don't resurface more frequently
- Spec calls for SM-2 algorithm influencing chunk order in ChunkFlash and SpeedTap

### P2 — Missing Features

**11. No badge system**
- Spec: bronze (60–79), silver (80–89), gold (90+) Boss Round badges; streak badges (7/30/60 days); Hard Mode badge
- None implemented; `badgeTier` field exists on Prayer but is never set

**12. No fluency graph on Progress screen**
- Spec: Boss Round scores over time per prayer, as a line graph
- Currently shows only a flat list of score chips

**13. No hint usage trend on Progress screen**
- Spec: declining hint usage over time is a primary fluency signal

**14. No parent recording playback**
- Spec: parent section shows Boss Round recordings with AI feedback alongside
- Current parent section is a static data summary only

**15. No offline support**
- Spec requires Service Worker + IndexedDB for full offline play
- Nothing implemented

**16. Hard Mode (nikud stripping)**
- Unlocks after Boss Round score ≥90; earn a special badge
- Not implemented

**17. TTS pre-caching at 3 speeds**
- Spec: audio pre-cached at 0.75x, 1.0x, 1.25x on first use
- ListenFollow calls live API on every play; no caching

---

## Content Completeness

| Level | Prayer | fullText | Chunks | Status |
|---|---|---|---|---|
| 1 | Modeh Ani | Complete | 5 chunks ✓ | in-progress |
| 2 | Asher Yatzar | Partial (first line only) | 5 chunks ✓ | locked |
| 3 | Elohai Neshama | Partial (first line only) | 3 chunks (incomplete) | locked |
| 4 | Birkot HaShachar | Snippet only | 0 chunks ✗ | locked |
| 5 | Barchu | Snippet only | 0 chunks ✗ | locked |
| 6 | Shema | Snippet only | 0 chunks ✗ | locked |
| 7 | VeAhavta | Snippet only | 0 chunks ✗ | locked |
| 8 | Emet VeYatziv | Snippet only | 0 chunks ✗ | locked |
| 9 | Amidah | Snippet only | 0 chunks ✗ | locked |
| 10 | Aleinu | Snippet only | 0 chunks ✗ | locked |
| 11 | Adon Olam | Snippet only | 0 chunks ✗ | locked |

**Data note:** `prayers.ts:169` has a typo in Vav Virtuoso Hebrew: `"ו ִירְטוּאוֹז וָו"` — extraneous space before ירטואוז. Should be `"וִירְטוּאוֹז וָו"`.

Content for locked prayers needs educator review before finalizing (see Open Questions).

---

## API Contracts (What Needs to Exist)

### POST `/api/prayer/tts`
```json
Request:  { "text": "<hebrew string>", "voice": "nova" }
Response: audio/mpeg blob
```
Used by: ListenFollow, BossRound (hear model reading), ChunkFlash (hear chunk)

### POST `/api/prayer/analyze-reading`
```json
Request: {
  "audioBase64": "<base64 webm/opus>",
  "expectedText": "<full prayer hebrew>",
  "prayerName": "Modeh Ani"
}
Response: {
  "feedback": {
    "score": 0-100,
    "strength": { "chunk": "<hebrew>", "comment": "<string>" },
    "areasToWork": [{ "hebrew": "<chunk>", "issue": "<string>", "tip": "<string>" }],
    "overall": "<string>",
    "readyToAdvance": true/false
  },
  "transcript": "<whisper output>"
}
```
Used by: BossRound

---

## Priority Next Steps

### Sprint 1 — Make the core loop playable end-to-end

1. **Persist state to localStorage** in GameContext — wrap `setState` to also write to `localStorage`, read on init. Blocks everything else from being testable.

2. **Render the Confidence Bar** in SpeedTap — add a `fillPct` state updated from `internalFillRef` every 100ms via `setInterval` (or use a CSS animation approach with a key-reset). Teal fill, gold at tap moment.

3. **Add star display** in SpeedTap — show 1–3 ⭐ icons briefly on tap (fade out after 800ms).

4. **Wire prayer progression** — add `completedActivities: Record<prayerId, Set<activityId>>` to GameContext; unlock next activity and update prayer status when all 5 complete.

5. **Fix transliteration in ListenFollow** — remove the automatic amber callout; gate it behind the hint button.

### Sprint 2 — Make audio work

6. **Build TTS endpoint** — Supabase Edge Function calling ElevenLabs or Azure; return audio blob. Wire ChunkFlash and ListenFollow to it.

7. **Build analysis endpoint** — Supabase Edge Function: receive base64 audio → Whisper → Claude → return structured feedback with real 0-100 score.

8. **Fix BossRound score** — use the real score from the API response; show score number prominently with delta vs. previous attempt.

### Sprint 3 — Polish and progression

9. **Add badge system** — track badge tiers in GameContext; award on Boss Round completion; display in Progress screen.

10. **Add fluency graph to Progress** — line chart of Boss Round scores over time per prayer.

11. **Energy meter in SpeedTap UI** — small amber dots in top corner.

12. **Complete prayer content** — full text + chunk data for all 11 prayers (needs educator review).

---

## Open Questions (from spec)

1. **TTS source**: Synthetic (ElevenLabs/Azure) or licensed Chabad.org recordings? Authentic recordings are more defensible pedagogically.
2. **Curriculum validation**: Confirm 11-prayer sequence with a knowledgeable educator before locking in content.
3. **Birkot HaShachar structure**: One level with multiple Boss Rounds, or several distinct numbered levels?
4. **Hard Mode unlock timing**: Per-prayer immediately after 90+ score, or only after all 11 prayers complete?
5. **Hint granularity**: 3 hints per activity *unit* (recommended MVP) vs. 3 per *session*.
6. **AI feedback samples**: Write 10–15 example feedback entries by hand before writing the Claude prompt — these become the tone spec.

---

## Running Locally

```bash
npm install
npm run dev        # Vite dev server at localhost:5173
```

Environment variables (`.env`):
```
VITE_API_ORIGIN=   # Backend URL (optional; defaults to same origin)
PORT=              # Dev server port (default 5173)
BASE_PATH=         # App base path (default /)
```

No backend is currently wired. TTS and analysis calls will fail until Sprint 2 endpoints exist.
