import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { orderChunksForPractice, prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { Volume2, ChevronRight, Eye, EyeOff } from "lucide-react";
import { apiUrl, readErrorText } from "@/lib/api";

export default function ChunkFlash() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { addXp, state, useHint, completeActivity } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);
  const chunks = orderChunksForPractice(prayer?.chunks ?? [], state.chunkConfidence);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslit, setShowTranslit] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  const chunk = chunks[currentIndex];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
    };
  }, []);

  function handleRead() {
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 400);

    if (currentIndex + 1 >= chunks.length) {
      addXp(75);
      if (prayerId) completeActivity(prayerId, "chunkflash");
      setCompleted(true);
    } else {
      setCurrentIndex(i => i + 1);
      setShowTranslit(false);
    }
  }

  async function handleAudio() {
    if (!prayer) return;
    setAudioPlaying(true);
    setAudioError(null);

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const res = await fetch(apiUrl("/api/prayer/tts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunk?.hebrew ?? "", voice: "nova" }),
      });

      if (!res.ok) {
        const txt = await readErrorText(res);
        throw new Error(`TTS error ${res.status}${txt ? `: ${txt}` : ""}`);
      }

      const blob = await res.blob();
      if (audioBlobUrlRef.current) URL.revokeObjectURL(audioBlobUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioBlobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setAudioPlaying(false);
      audio.onerror = () => {
        setAudioPlaying(false);
        setAudioError("Audio playback failed. Please try again.");
      };

      await audio.play();
    } catch (err: any) {
      setAudioPlaying(false);
      setAudioError(err?.message ?? "Couldn't load audio. Please try again.");
    }
  }

  function handleHint() {
    if (state.hintsRemaining > 0) {
      useHint();
      setShowTranslit(true);
    }
  }

  if (!prayer) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="screen-chunk-flash">
      <TopBar showBack onBack={() => setLocation(`/prayer/${prayerId}`)} title="Chunk Flash" />

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col">
        {!completed ? (
          <>
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-8">
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

            {/* Chunk card */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className={`w-full bg-card border border-border rounded-2xl p-8 shadow-md text-center transition-all duration-300 ${
                  tapEffect ? "scale-[0.97] border-primary/50" : ""
                }`}
                data-testid="card-chunk"
              >
                <div
                  className="font-hebrew text-foreground"
                  dir="rtl"
                  style={{ fontSize: "42px", lineHeight: "1.8" }}
                >
                  {chunk?.hebrew}
                </div>

                {showTranslit && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="font-sans text-muted-foreground text-base">{chunk?.transliteration}</div>
                  </div>
                )}

                {!showTranslit && chunk?.commonErrors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="font-sans text-xs text-muted-foreground">Tap the audio to hear it first</div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 space-y-3">
              {audioError && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 font-sans text-sm text-amber-800">
                  {audioError}
                </div>
              )}

              <button
                data-testid="button-i-can-read"
                onClick={handleRead}
                className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Done
              </button>

              <div className="flex gap-3">
                <button
                  data-testid="button-audio"
                  onClick={handleAudio}
                  className={`flex-1 bg-card border rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm transition-all ${
                    audioPlaying
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${audioPlaying ? "text-primary" : ""}`} />
                  {audioPlaying ? "Playing..." : "Hear it"}
                </button>

                <button
                  data-testid="button-hint"
                  onClick={handleHint}
                  disabled={state.hintsRemaining === 0 || showTranslit}
                  className={`flex-1 bg-card border rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm transition-all ${
                    showTranslit
                      ? "border-primary/30 text-primary/50 cursor-default"
                      : state.hintsRemaining === 0
                      ? "border-border text-muted-foreground/50 cursor-not-allowed opacity-50"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {showTranslit ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Hint ({state.hintsRemaining})
                </button>
              </div>
            </div>

            <div className="font-sans text-xs text-muted-foreground text-center mt-4">
              {currentIndex + 1} of {chunks.length} chunks
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <div className="text-center">
              <div className="font-syne font-bold text-2xl text-foreground mb-2">All chunks done!</div>
              <div className="font-sans text-muted-foreground">+75 XP earned</div>
            </div>
            <button
              data-testid="button-next-unit"
              onClick={() => setLocation(`/prayer/${prayerId}/speedtap`)}
              className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Next: Speed Tap
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              data-testid="button-back-to-prayer"
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
