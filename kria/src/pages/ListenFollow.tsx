import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { Play, Pause, RotateCcw, ChevronRight, Volume2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function ListenFollow() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { addXp } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);
  const [activeChunk, setActiveChunk] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1.0 | 1.25>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  const chunks = prayer?.chunks ?? [];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioBlobUrlRef.current) URL.revokeObjectURL(audioBlobUrlRef.current);
    };
  }, []);

  function stopPlayback() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveChunk(-1);
  }

  function restart() {
    stopPlayback();
    setCompleted(false);
    setTtsError(null);
  }

  function syncChunks(audio: HTMLAudioElement) {
    const duration = audio.duration;
    if (!isFinite(duration) || duration <= 0) return;
    const chunkDuration = duration / chunks.length;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const t = audio.currentTime;
      const idx = Math.min(Math.floor(t / chunkDuration), chunks.length - 1);
      setActiveChunk(idx);
    }, 100);
  }

  async function startPlayback() {
    if (!prayer) return;
    setTtsError(null);
    setTtsLoading(true);

    try {
      const res = await fetch(`${BASE}/api/prayer/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prayer.fullText, voice: "nova" }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`TTS error ${res.status}: ${txt}`);
      }

      const blob = await res.blob();
      if (audioBlobUrlRef.current) URL.revokeObjectURL(audioBlobUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioBlobUrlRef.current = url;

      const audio = new Audio(url);
      audio.playbackRate = speed;
      audioRef.current = audio;

      audio.onloadedmetadata = () => syncChunks(audio);
      audio.ontimeupdate = () => {
        if (audio.duration && isFinite(audio.duration)) {
          const chunkDuration = audio.duration / chunks.length;
          const idx = Math.min(Math.floor(audio.currentTime / chunkDuration), chunks.length - 1);
          setActiveChunk(idx);
        }
      };
      audio.onended = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        setActiveChunk(-1);
        setCompleted(true);
        addXp(50);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setActiveChunk(-1);
        setTtsError("Audio playback failed. Please try again.");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error("TTS error:", err);
      setTtsError(err?.message ?? "Couldn't load audio. Please try again.");
    } finally {
      setTtsLoading(false);
    }
  }

  function pauseResume() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  if (!prayer) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="screen-listen-follow">
      <TopBar showBack onBack={() => setLocation(`/prayer/${prayerId}`)} title="Listen & Follow" />

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col">
        <div className="flex-1 flex items-start">
          <div
            className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm text-center"
            dir="rtl"
          >
            <div className="flex flex-wrap justify-center gap-2" style={{ direction: "rtl" }}>
              {chunks.map((chunk, i) => (
                <span
                  key={chunk.id}
                  data-testid={`chunk-highlight-${i}`}
                  className={`font-hebrew inline-block px-3 py-1.5 rounded-xl transition-all duration-200 ${
                    activeChunk === i
                      ? "bg-primary/15 text-foreground scale-105"
                      : "text-foreground/80"
                  }`}
                  style={{ fontSize: "28px", lineHeight: "1.6" }}
                >
                  {chunk.hebrew}
                </span>
              ))}
            </div>
          </div>
        </div>

        {activeChunk >= 0 && chunks[activeChunk] && (
          <div className="mt-4 bg-accent/10 border border-accent/20 rounded-2xl p-3 text-center">
            <div className="font-sans text-sm text-foreground/80">{chunks[activeChunk].transliteration}</div>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {([0.75, 1.0, 1.25] as const).map(s => (
            <button
              key={s}
              data-testid={`button-speed-${s}`}
              onClick={() => {
                setSpeed(s);
                if (audioRef.current) audioRef.current.playbackRate = s;
              }}
              className={`font-sans text-sm px-4 py-2 rounded-xl transition-all ${
                speed === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {s === 1.0 ? "1.0×" : `${s}×`}
            </button>
          ))}
        </div>

        {ttsError && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 font-sans text-sm text-amber-800">
            {ttsError}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {!completed ? (
            <button
              data-testid="button-play-pause"
              onClick={audioRef.current && !audioRef.current.ended ? pauseResume : startPlayback}
              disabled={ttsLoading}
              className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {ttsLoading ? (
                <><Volume2 className="w-5 h-5 animate-pulse" /> Loading audio…</>
              ) : isPlaying ? (
                <><Pause className="w-5 h-5" /> Pause</>
              ) : (
                <><Play className="w-5 h-5" /> Play Prayer</>
              )}
            </button>
          ) : (
            <>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <div className="font-syne font-semibold text-primary text-lg mb-1">Great listening!</div>
                <div className="font-sans text-sm text-muted-foreground">+50 XP earned</div>
              </div>
              <button
                data-testid="button-replay"
                onClick={restart}
                className="w-full bg-card border border-border text-foreground font-sans py-3 rounded-2xl flex items-center justify-center gap-2 hover:border-primary/40 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                data-testid="button-next-unit"
                onClick={() => setLocation(`/prayer/${prayerId}/chunkflash`)}
                className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Next: Chunk Flash
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <p className="font-sans text-xs text-muted-foreground text-center mt-4">
          You can replay this as many times as you like
        </p>
      </div>
    </div>
  );
}
