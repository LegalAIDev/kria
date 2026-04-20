import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { RotateCcw, ChevronRight, Check, Star } from "lucide-react";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChunkScramble() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { addXp, completeActivity } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);
  const chunks = prayer?.chunks ?? [];

  function makeWordPool() {
    const allWords = chunks.flatMap(chunk =>
      chunk.hebrew.split(/\s+/).map((word, i) => ({
        id: `${chunk.id}-${i}`,
        word,
        chunkId: chunk.id,
      }))
    );
    return shuffleArray(allWords);
  }

  const [wordPool, setWordPool] = useState(makeWordPool);
  const [placed, setPlaced] = useState<typeof wordPool>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const totalWords = chunks.flatMap(c => c.hebrew.split(/\s+/)).length;

  function placeWord(item: typeof wordPool[0]) {
    setWordPool(prev => prev.filter(w => w.id !== item.id));
    setPlaced(prev => [...prev, item]);
    setIsChecked(false);
  }

  function removeWord(item: typeof wordPool[0]) {
    setPlaced(prev => prev.filter(w => w.id !== item.id));
    setWordPool(prev => [...prev, item]);
    setIsChecked(false);
  }

  function checkAnswer() {
    const correctOrder = chunks.flatMap(chunk =>
      chunk.hebrew.split(/\s+/).map((word, i) => `${chunk.id}-${i}`)
    );
    const placedOrder = placed.map(w => w.id);
    const correct = JSON.stringify(correctOrder) === JSON.stringify(placedOrder);
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      const xp = 100;
      setXpEarned(xp);
      addXp(xp);
      if (prayerId) completeActivity(prayerId, "scramble", false);
      setTimeout(() => setCompleted(true), 1200);
    } else if (placed.length > 0) {
      const partialPct = placed.filter((w, i) => w.id === correctOrder[i]).length / totalWords;
      if (partialPct >= 0.5) {
        const partialXp = Math.round(50 * partialPct);
        addXp(partialXp);
      }
    }
  }

  function claimPartialAndContinue() {
    const correctOrder = chunks.flatMap(chunk =>
      chunk.hebrew.split(/\s+/).map((word, i) => `${chunk.id}-${i}`)
    );
    const correctCount = placed.filter((w, i) => w.id === correctOrder[i]).length;
    const partialXp = Math.round((correctCount / totalWords) * 75);
    if (partialXp > 0) {
      addXp(partialXp);
      setXpEarned(partialXp);
    }
    if (prayerId) completeActivity(prayerId, "scramble", false);
    setCompleted(true);
  }

  function reset() {
    setWordPool(makeWordPool());
    setPlaced([]);
    setIsChecked(false);
    setIsCorrect(false);
  }

  if (!prayer) {
    setLocation("/");
    return null;
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="screen-chunk-scramble">
        <TopBar showBack onBack={() => setLocation(`/prayer/${prayerId}`)} title="Chunk Scramble" />
        <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 bg-accent/15 rounded-full flex items-center justify-center">
            <Star className="w-10 h-10 text-accent" />
          </div>
          <div className="text-center">
            <div className="font-syne font-bold text-2xl text-foreground mb-2">
              {isCorrect ? "Scramble Solved!" : "Good effort!"}
            </div>
            {xpEarned > 0 && (
              <div className="font-sans text-muted-foreground">+{xpEarned} bonus XP earned</div>
            )}
          </div>
          <button
            data-testid="button-next-bossround"
            onClick={() => setLocation(`/prayer/${prayerId}/bossround`)}
            className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Next: Boss Round
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLocation(`/prayer/${prayerId}`)}
            className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to prayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="screen-chunk-scramble">
      <TopBar showBack onBack={() => setLocation(`/prayer/${prayerId}`)} title="Chunk Scramble" />

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <p className="font-sans text-sm text-muted-foreground">
            Put the words in the right order
          </p>
          <span className="font-sans text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">+100 XP</span>
        </div>
        <p className="font-sans text-xs text-muted-foreground mb-4">
          Already know it? Tap "I know this" to skip and still earn XP.
        </p>

        {/* Answer area */}
        <div
          className={`min-h-24 bg-card border-2 rounded-2xl p-4 mb-3 transition-all ${
            isChecked
              ? isCorrect
                ? "border-primary bg-primary/5"
                : "border-amber-400/50 bg-amber-50/50"
              : "border-dashed border-border"
          }`}
          data-testid="drop-zone"
        >
          {placed.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground/50 text-center py-4">
              Tap words below to place them here
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
              {placed.map((item) => (
                <button
                  key={item.id}
                  data-testid={`placed-word-${item.id}`}
                  onClick={() => removeWord(item)}
                  className="font-hebrew bg-primary/10 text-primary border border-primary/20 rounded-xl px-3 py-1.5 transition-all hover:bg-primary/20 active:scale-95"
                  style={{ fontSize: "22px", lineHeight: "1.8" }}
                >
                  {item.word}
                </button>
              ))}
            </div>
          )}
        </div>

        {isChecked && !isCorrect && (
          <div className="text-center text-sm font-sans mb-3 py-2 px-4 rounded-xl bg-amber-50 text-amber-700">
            Not quite — try rearranging, or skip if you need to
          </div>
        )}
        {isChecked && isCorrect && (
          <div className="text-center text-sm font-sans mb-3 py-2 px-4 rounded-xl bg-primary/10 text-primary">
            Correct! Great work!
          </div>
        )}

        {/* Word bank */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-4 flex-1">
          <p className="font-sans text-xs text-muted-foreground mb-3 uppercase tracking-wide">Word Bank</p>
          <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
            {wordPool.map((item) => (
              <button
                key={item.id}
                data-testid={`bank-word-${item.id}`}
                onClick={() => placeWord(item)}
                className="font-hebrew bg-card border border-border rounded-xl px-3 py-1.5 transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95 shadow-sm"
                style={{ fontSize: "22px", lineHeight: "1.8" }}
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            data-testid="button-reset-scramble"
            onClick={reset}
            className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:border-primary/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            data-testid="button-check-scramble"
            onClick={checkAnswer}
            disabled={placed.length === 0}
            className={`flex-1 py-3 rounded-xl font-syne font-semibold flex items-center justify-center gap-2 transition-all ${
              placed.length === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            <Check className="w-4 h-4" />
            Check
          </button>
        </div>

        {/* Skip / partial credit button */}
        <button
          data-testid="button-skip-scramble"
          onClick={claimPartialAndContinue}
          className="mt-3 w-full font-sans text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
        >
          {placed.length >= Math.ceil(totalWords / 2) ? "I know this — count what I have" : "Skip for now →"}
        </button>
      </div>
    </div>
  );
}
