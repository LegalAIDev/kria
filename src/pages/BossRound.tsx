import { useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { Mic, MicOff, Volume2, ChevronRight, Home } from "lucide-react";
import { apiUrl, readErrorText } from "@/lib/api";

type Phase = "ready" | "recording" | "processing" | "feedback";

interface FeedbackReport {
  strength: { chunk: string; comment: string };
  areasToWork: { hebrew: string; issue: string; tip: string }[];
  overall: string;
  readyToAdvance: boolean;
  transcript?: string;
}


export default function BossRound() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { addXp, setEnergy, state, addBossScore } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);
  const chunks = prayer?.chunks ?? [];

  const [phase, setPhase] = useState<Phase>("ready");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [flashChunkIndex, setFlashChunkIndex] = useState(0);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = useCallback(async () => {
    if (!prayer || ttsLoading) return;
    setTtsLoading(true);
    try {
      const res = await fetch(apiUrl("/api/prayer/tts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prayer.fullText, voice: "nova" }),
      });
      if (!res.ok) {
        const txt = await readErrorText(res);
        throw new Error(`TTS failed (${res.status})${txt ? `: ${txt}` : ""}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setTtsLoading(false);
    }
  }, [prayer, ttsLoading]);

  async function startRecording() {
    setPhase("recording");
    setRecordSeconds(0);
    audioChunksRef.current = [];
    setAnalyzeError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicError(null);
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(250);
    } catch (err: any) {
      console.error("Microphone error:", err);
      setPhase("ready");
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setMicError("Microphone access was blocked. Please allow microphone access in your browser and try again.");
      } else {
        setMicError("Couldn't access your microphone. Please check your browser settings and try again.");
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setRecordSeconds(s => s + 1);
    }, 1000);
  }

  async function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);

    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
    }

    setPhase("processing");

    let idx = 0;
    flashTimerRef.current = setInterval(() => {
      setFlashChunkIndex(i => (i + 1) % Math.max(chunks.length, 1));
      idx++;
      if (idx > 12) clearInterval(flashTimerRef.current!);
    }, 600);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const CHUNK = 8192;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      }
      const base64 = btoa(binary);

      const res = await fetch(apiUrl("/api/prayer/analyze-reading"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          expectedText: prayer?.fullText ?? "",
          prayerName: prayer?.nameEnglish ?? "",
        }),
      });

      if (flashTimerRef.current) clearInterval(flashTimerRef.current!);

      if (res.ok) {
        const data = await res.json() as { feedback: FeedbackReport; transcript: string };
        const fb: FeedbackReport = {
          strength: data.feedback.strength ?? { chunk: "", comment: "Good reading!" },
          areasToWork: data.feedback.areasToWork ?? [],
          overall: data.feedback.overall ?? "Keep practicing!",
          readyToAdvance: data.feedback.readyToAdvance ?? true,
          transcript: data.transcript,
        };
        setFeedback(fb);
        const scoreXp = fb.readyToAdvance ? 200 : 100;
        addXp(scoreXp);
        addBossScore(prayerId ?? "", fb.readyToAdvance ? 85 : 65);
        if (fb.readyToAdvance) setEnergy(state.maxEnergy);
      } else {
        const txt = await readErrorText(res);
        throw new Error(`Server error (${res.status})${txt ? `: ${txt}` : ""}`);
      }
    } catch (err) {
      console.error("Analyze error:", err);
      if (flashTimerRef.current) clearInterval(flashTimerRef.current!);
      const fallback: FeedbackReport = {
        strength: { chunk: prayer?.chunks[0]?.hebrew ?? "", comment: "You completed the reading — well done!" },
        areasToWork: [],
        overall: "Great effort! Keep practicing and you'll improve every time.",
        readyToAdvance: true,
      };
      setFeedback(fallback);
      addXp(100);
      setAnalyzeError("Couldn't connect to AI coach — here's some general encouragement.");
    }

    setPhase("feedback");
  }

  if (!prayer) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="screen-boss-round">
      <TopBar showBack onBack={() => setLocation(`/prayer/${prayerId}`)} title="Boss Round" />

      <div className="flex-1 max-w-sm mx-auto w-full px-4 py-6 flex flex-col">

        {phase === "ready" && (
          <>
            <div className="text-center mb-5">
              <div className="font-syne font-bold text-xl text-foreground mb-1">Read the full prayer aloud</div>
              <div className="font-sans text-sm text-muted-foreground">Tap record, read clearly, then stop — the AI coach will give you feedback</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-sm text-center">
              <div className="font-hebrew text-foreground leading-loose" dir="rtl" style={{ fontSize: "24px", lineHeight: "2" }}>
                {prayer.fullText}
              </div>
            </div>

            <div className="flex justify-center mb-5">
              <button
                onClick={playTTS}
                disabled={ttsLoading}
                className="bg-card border border-border rounded-xl px-5 py-2.5 flex items-center gap-2 font-sans text-sm text-muted-foreground hover:border-primary/40 transition-all disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4" />
                {ttsLoading ? "Loading..." : "Hear a model reading"}
              </button>
            </div>

            {micError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 font-sans text-sm text-amber-800 mb-4">
                {micError}
              </div>
            )}

            <button
              data-testid="button-start-recording"
              onClick={startRecording}
              className="w-full bg-primary text-primary-foreground font-syne font-semibold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-md hover:opacity-90 active:scale-[0.98] transition-all text-lg"
            >
              <Mic className="w-6 h-6" />
              Start Recording
            </button>

            {state.bossRoundScores[prayerId ?? ""] && (
              <div className="mt-4 font-sans text-xs text-muted-foreground text-center">
                You've done this {state.bossRoundScores[prayerId ?? ""].length} time{state.bossRoundScores[prayerId ?? ""].length !== 1 ? "s" : ""} — keep improving!
              </div>
            )}
          </>
        )}

        {phase === "recording" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-pulse" />
              </div>

              <div>
                <div className="font-syne font-bold text-2xl text-foreground text-center">Recording...</div>
                <div className="font-sans text-muted-foreground text-center mt-1">
                  {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, "0")}
                </div>
              </div>

              <div className="w-full bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
                <div className="font-hebrew text-foreground leading-loose" dir="rtl" style={{ fontSize: "22px", lineHeight: "2" }}>
                  {prayer.fullText}
                </div>
              </div>
            </div>

            {recordSeconds >= 3 && (
              <button
                data-testid="button-stop-recording"
                onClick={stopRecording}
                className="w-full bg-card border-2 border-primary text-primary font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                <MicOff className="w-5 h-5" />
                Stop & Submit
              </button>
            )}
            {recordSeconds < 3 && (
              <div className="font-sans text-xs text-muted-foreground text-center mt-4">Keep reading…</div>
            )}
          </>
        )}

        {phase === "processing" && (
          <>
            <div className="text-center mb-4">
              <div className="font-syne font-semibold text-foreground mb-1">The AI coach is listening…</div>
              <div className="font-sans text-sm text-muted-foreground">Analyzing your reading</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
              <div className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-3">Reviewing chunks</div>
              {chunks.length > 0 && (
                <div className="text-center">
                  <div className="font-hebrew text-foreground transition-all duration-300" dir="rtl" style={{ fontSize: "36px", lineHeight: "1.8" }}>
                    {chunks[flashChunkIndex % chunks.length]?.hebrew}
                  </div>
                  <div className="font-sans text-sm text-muted-foreground mt-2">
                    {chunks[flashChunkIndex % chunks.length]?.transliteration}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </>
        )}

        {phase === "feedback" && feedback && (
          <FeedbackView
            feedback={feedback}
            analyzeError={analyzeError}
            onHome={() => setLocation("/")}
            onRetry={() => setPhase("ready")}
          />
        )}
      </div>
    </div>
  );
}

function FeedbackView({
  feedback,
  analyzeError,
  onHome,
  onRetry,
}: {
  feedback: FeedbackReport;
  analyzeError: string | null;
  onHome: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-4" data-testid="feedback-report">
      {analyzeError && (
        <div className="bg-muted border border-border rounded-xl px-4 py-2 font-sans text-xs text-muted-foreground">
          {analyzeError}
        </div>
      )}

      {/* Overall */}
      <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 text-center">
        <div className="font-sans text-base text-foreground leading-snug">{feedback.overall}</div>
      </div>

      {/* Strength */}
      {feedback.strength?.comment && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="font-sans text-xs text-primary uppercase tracking-wide mb-2">What you did well</div>
          {feedback.strength.chunk && (
            <div className="font-hebrew text-primary text-xl mb-1" dir="rtl">{feedback.strength.chunk}</div>
          )}
          <div className="font-sans text-sm text-foreground">{feedback.strength.comment}</div>
        </div>
      )}

      {/* Areas to work on */}
      {feedback.areasToWork?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-3">Practice these</div>
          <div className="space-y-4">
            {feedback.areasToWork.map((area, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="font-hebrew text-foreground text-xl mb-1" dir="rtl">{area.hebrew}</div>
                <div className="font-sans text-sm text-foreground/80 mb-1.5">{area.issue}</div>
                <div className="font-sans text-sm text-primary bg-primary/8 rounded-xl px-3 py-2">{area.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`rounded-2xl p-4 ${feedback.readyToAdvance ? "bg-primary/10 border border-primary/20" : "bg-accent/10 border border-accent/20"}`}>
        <div className="font-sans text-sm font-medium text-foreground">
          {feedback.readyToAdvance
            ? "You're ready to move on! Great work."
            : "Practice a bit more on the words above, then come back."}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pb-4">
        <button
          data-testid="button-home"
          onClick={onHome}
          className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
        <button
          data-testid="button-retry"
          onClick={onRetry}
          className="w-full bg-card border border-border font-sans text-sm text-muted-foreground py-3 rounded-2xl hover:border-primary/40 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
