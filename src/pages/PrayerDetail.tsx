import { useParams, useLocation } from "wouter";
import type { ReactNode } from "react";
import { TopBar } from "@/components/TopBar";
import { prayers } from "@/data/prayers";
import { useGame } from "@/context/GameContext";
import { Volume2, CheckCircle2, ChevronRight, Mic, Zap, Star, Lock, BookOpen, Shuffle } from "lucide-react";

type ActivityUnit = "listen" | "chunkflash" | "speedtap" | "scramble" | "bossround";

const UNITS: { id: ActivityUnit; label: string; description: string; icon: ReactNode }[] = [
  { id: "listen", label: "Listen & Follow", description: "Hear it — follow along with each chunk highlighted", icon: <Volume2 className="w-4 h-4" /> },
  { id: "chunkflash", label: "Chunk Flash", description: "See one chunk at a time — practice reading it aloud", icon: <BookOpen className="w-4 h-4" /> },
  { id: "speedtap", label: "Speed Tap", description: "Tap when you can read each chunk — faster = better!", icon: <Zap className="w-4 h-4" /> },
  { id: "scramble", label: "Chunk Scramble", description: "Bonus challenge — put the words back in order", icon: <Shuffle className="w-4 h-4" /> },
  { id: "bossround", label: "Boss Round", description: "Read the whole prayer aloud — AI coaches you", icon: <Mic className="w-4 h-4" /> },
];

export default function PrayerDetail() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const [, setLocation] = useLocation();
  const { state } = useGame();

  const prayer = prayers.find(p => p.id === prayerId);

  if (!prayer || prayer.status === "locked") {
    setLocation("/");
    return null;
  }

  function handleUnitTap(unit: ActivityUnit) {
    setLocation(`/prayer/${prayerId}/${unit}`);
  }

  const completedUnit = prayer.unit;

  const nextUnit = UNITS.find((u, i) => {
    const unitNum = i + 1;
    if (prayer.status === "in-progress" && unitNum === completedUnit) return true;
    return false;
  }) ?? UNITS[0];

  return (
    <div className="min-h-screen bg-background" data-testid="screen-prayer-detail">
      <TopBar showBack onBack={() => setLocation("/")} />

      <div className="max-w-sm mx-auto px-4 pb-8">
        {/* Prayer header */}
        <div className="pt-6 pb-4 text-center">
          <div className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Level {prayer.level}</div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-1">{prayer.nameEnglish}</h1>
          <div className="font-hebrew text-primary" dir="rtl" style={{ fontSize: "30px" }}>{prayer.nameHebrew}</div>
        </div>

        {/* Full text preview */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm text-center">
          <div
            className="font-hebrew text-foreground leading-loose"
            dir="rtl"
            style={{ fontSize: "20px", lineHeight: "2" }}
          >
            {prayer.fullText}
          </div>
        </div>

        {/* Start CTA — only if in-progress */}
        {prayer.status === "in-progress" && (
          <button
            data-testid="button-start-activity"
            onClick={() => handleUnitTap(nextUnit.id)}
            className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all mb-5"
          >
            {nextUnit.id === "listen" ? <Volume2 className="w-5 h-5" /> : nextUnit.id === "bossround" ? <Mic className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            Continue: {nextUnit.label}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Progress */}
        {prayer.status === "in-progress" && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-sans text-sm text-muted-foreground">Progress</span>
              <span className="font-sans text-sm font-medium text-foreground">Step {prayer.unit} of {prayer.totalUnits}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(prayer.unit / prayer.totalUnits) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Unit list */}
        <h2 className="font-syne font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">All activities</h2>
        <div className="space-y-2">
          {UNITS.map((unit, index) => {
            const unitNum = index + 1;
            const isDone = unitNum < completedUnit || prayer.status === "complete";
            const isCurrent = unitNum === completedUnit && prayer.status === "in-progress";
            const isLocked = unitNum > completedUnit && prayer.status === "in-progress" && unit.id !== "scramble" && unit.id !== "bossround";
            const isScramble = unit.id === "scramble";

            return (
              <button
                key={unit.id}
                data-testid={`card-unit-${unit.id}`}
                onClick={() => !isLocked && handleUnitTap(unit.id)}
                disabled={isLocked}
                className={`w-full text-left bg-card border rounded-2xl p-4 transition-all duration-200 shadow-sm ${
                  isLocked
                    ? "border-border opacity-40 cursor-not-allowed"
                    : isCurrent
                    ? "border-primary shadow-md cursor-pointer"
                    : "border-border hover:border-primary/40 cursor-pointer hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isDone ? "bg-primary/15" : isCurrent ? "bg-primary" : "bg-muted"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                    ) : (
                      <span className={isCurrent ? "text-primary-foreground" : "text-muted-foreground"}>
                        {unit.icon}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-sans font-medium text-foreground text-sm">{unit.label}</div>
                      {isScramble && !isLocked && (
                        <span className="font-sans text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">Bonus XP</span>
                      )}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground mt-0.5">{unit.description}</div>
                  </div>

                  {!isLocked && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Boss score history */}
        {state.bossRoundScores[prayer.id] && state.bossRoundScores[prayer.id].length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="font-syne font-semibold text-foreground mb-2 text-sm">Boss Round History</h3>
            <div className="flex gap-2 flex-wrap">
              {state.bossRoundScores[prayer.id].map((score, i) => (
                <div
                  key={i}
                  className={`font-syne font-bold text-base px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                    score >= 90 ? "bg-amber-100 text-amber-700" :
                    score >= 80 ? "bg-slate-100 text-slate-600" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {score >= 90 && <Star className="w-3 h-3" />}
                  {score}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
