import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { Volume2, ChevronRight, Eye } from "lucide-react";

const ENCOURAGEMENTS = [
  "Nice! Keep going!",
  "You got it!",
  "Great reading!",
  "Excellent!",
  "That's it!",
  "Well done!",
  "Keep it up!",
  "Beautiful!",
  "You're on a roll!",
  "Wonderful!",
];

export default function SpeedTap() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { addXp, setEnergy, state, useHint, recordChunkConfidence } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);
  const chunks = prayer?.chunks ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGoldWash, setIsGoldWash] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  const internalFillRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const BAR_DURATION = 4000;

  const chunk = chunks[currentIndex];

  const startTracking = useCallback(() => {
    const startFill = pausedAtRef.current;
    const remaining = BAR_DURATION * (1 - startFill / 100);
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const pct = startFill + (elapsed / remaining) * (100 - startFill);
      internalFillRef.current = Math.min(100, pct);

      if (pct >= 100) {
        pausedAtRef.current = 0;
        internalFillRef.current = 0;
        setTimeout(() => advanceChunk(), 100);
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, [currentIndex]);

  function stopTracking() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }

  function handleTap() {
    if (completed) return;
    stopTracking();
    const fill = internalFillRef.current;
    const quality = fill >= 80 ? 3 : fill >= 40 ? 2 : 1;

    recordChunkConfidence(chunk?.id ?? "", fill);

    const xp = quality * 25;
    setXpEarned(prev => prev + xp);
    addXp(xp);
    if (quality >= 2) setEnergy(state.energy + 1);

    setIsGoldWash(true);
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setEncouragement(msg);

    setTimeout(() => setIsGoldWash(false), 350);
    setTimeout(() => setEncouragement(null), 1000);

    setTimeout(() => advanceChunk(), 500);
  }

  function advanceChunk() {
    pausedAtRef.current = 0;
    internalFillRef.current = 0;
    setShowTranslit(false);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= chunks.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  function handleHint() {
    if (state.hintsRemaining > 0) {
      useHint();
      setShowTranslit(true);
      stopTracking();
      pausedAtRef.current = internalFillRef.current;
      setTimeout(() => {
        startTracking();
      }, 2000);
    }
  }

  useEffect(() => {
    internalFillRef.current = 0;
    pausedAtRef.current = 0;
    startTracking();
    return () => stopTracking();
  }, [currentIndex]);

  if (!prayer) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="screen-speed-tap">
      <TopBar showBack onBack={() => { stopTracking(); setLocation(`/prayer/${prayerId}`); }} title="Speed Tap" />

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col">
        {!completed ? (
          <>
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {chunks.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-primary"
                      : i < currentIndex
                      ? "w-1.5 bg-primary/40"
                      : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <p className="font-sans text-sm text-muted-foreground text-center mb-4">
              Read it — then tap the card
            </p>

            {/* Main tap area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative w-full">
                <button
                  data-testid="button-chunk-tap"
                  onClick={handleTap}
                  className={`w-full bg-card border-2 rounded-2xl p-8 text-center shadow-md transition-all duration-150 active:scale-[0.97] relative overflow-hidden cursor-pointer ${
                    isGoldWash ? "border-accent/60" : "border-border hover:border-primary/30"
                  }`}
                  style={{ minHeight: "180px" }}
                >
                  {isGoldWash && (
                    <div className="absolute inset-0 rounded-2xl gold-wash pointer-events-none" />
                  )}

                  <div
                    className="font-hebrew text-foreground"
                    dir="rtl"
                    style={{ fontSize: "42px", lineHeight: "1.8" }}
                  >
                    {chunk?.hebrew}
                  </div>

                  {showTranslit && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="font-sans text-muted-foreground">{chunk?.transliteration}</div>
                    </div>
                  )}
                </button>

                {encouragement && (
                  <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="font-syne font-bold text-primary text-lg animate-bounce">
                      {encouragement}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom controls */}
            <div className="mt-6 flex gap-3">
              <button
                data-testid="button-audio-speedtap"
                className="flex-1 bg-card border border-border rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm text-muted-foreground hover:border-primary/40 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                Hear it
              </button>
              <button
                data-testid="button-hint-speedtap"
                onClick={handleHint}
                disabled={state.hintsRemaining === 0 || showTranslit}
                className={`flex-1 bg-card border rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm transition-all ${
                  showTranslit || state.hintsRemaining === 0
                    ? "border-border text-muted-foreground/50 cursor-not-allowed opacity-50"
                    : "border-border text-muted-foreground hover:border-accent/40"
                }`}
              >
                <Eye className="w-4 h-4" />
                Hint ({state.hintsRemaining})
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚡</span>
            </div>
            <div className="text-center">
              <div className="font-syne font-bold text-2xl text-foreground mb-1">Speed Tap Done!</div>
              <div className="font-sans text-muted-foreground">Excellent reading — +{xpEarned} XP</div>
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
              onClick={() => setLocation(`/prayer/${prayerId}/scramble`)}
              className="font-sans text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Try Chunk Scramble for bonus XP →
            </button>
            <button
              onClick={() => setLocation(`/prayer/${prayerId}`)}
              className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to prayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
