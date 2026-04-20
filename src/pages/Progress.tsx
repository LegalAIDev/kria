import { useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { useGame } from "@/context/GameContext";
import { getAvatarTitle, getBossBadgeTier, prayers } from "@/data/prayers";
import { Star, Flame, Zap, BookOpen } from "lucide-react";

export default function Progress() {
  const [, setLocation] = useLocation();
  const { state, getPrayerProgress } = useGame();
  const { current: avatarCurrent, next: avatarNext } = getAvatarTitle(state.xp);

  const completedPrayers = prayers.filter(p => getPrayerProgress(p.id).status === "complete");
  const inProgressPrayers = prayers.filter(p => getPrayerProgress(p.id).status === "in-progress");
  const totalBossAttempts = Object.values(state.bossRoundScores).reduce((sum, arr) => sum + arr.length, 0);
  const recentHintUsage = Object.entries(state.hintUsageByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return (
    <div className="min-h-screen bg-background" data-testid="screen-progress">
      <TopBar showBack onBack={() => setLocation("/")} title="Progress" />

      <div className="max-w-sm mx-auto px-4 pb-8">
        <div className="pt-5 pb-4">
          <h1 className="font-syne font-bold text-2xl text-foreground">Your Progress</h1>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Streak</span>
            </div>
            <div className="font-syne font-bold text-3xl text-foreground">{state.streak}</div>
            <div className="font-sans text-xs text-muted-foreground">days in a row</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-accent fill-accent" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Total XP</span>
            </div>
            <div className="font-syne font-bold text-3xl text-foreground">{state.xp.toLocaleString()}</div>
            <div className="font-sans text-xs text-muted-foreground">experience points</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Prayers</span>
            </div>
            <div className="font-syne font-bold text-3xl text-foreground">{completedPrayers.length}</div>
            <div className="font-sans text-xs text-muted-foreground">of {prayers.length} completed</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wide">Boss Rounds</span>
            </div>
            <div className="font-syne font-bold text-3xl text-foreground">{totalBossAttempts}</div>
            <div className="font-sans text-xs text-muted-foreground">total attempts</div>
          </div>
        </div>

        {/* Avatar title */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm">
          <div className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-1">Avatar Title</div>
          <div className="font-syne font-bold text-xl text-foreground">{avatarCurrent.title}</div>
          <div className="font-hebrew-ui text-base text-muted-foreground" dir="rtl">{avatarCurrent.hebrew}</div>
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="font-sans text-xs text-muted-foreground">{state.xp.toLocaleString()} XP</span>
              <span className="font-sans text-xs text-muted-foreground">{avatarNext.xpThreshold.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((state.xp - avatarCurrent.xpThreshold) / (avatarNext.xpThreshold - avatarCurrent.xpThreshold)) * 100)}%`
                }}
              />
            </div>
            <div className="font-sans text-xs text-primary mt-1">Next: {avatarNext.title}</div>
          </div>
        </div>

        {/* Boss round scores */}
        {Object.keys(state.bossRoundScores).length > 0 && (
          <div className="mb-5">
            <h2 className="font-syne font-bold text-base text-foreground mb-3">Boss Round History</h2>
            <div className="space-y-2">
              {Object.entries(state.bossRoundScores).map(([prayerId, scores]) => {
                const prayer = prayers.find(p => p.id === prayerId);
                if (!prayer) return null;
                const best = Math.max(...scores);
                const badgeTier = getBossBadgeTier(best);
                const points = scores.map((score, i) => {
                  const x = scores.length === 1 ? 0 : (i / (scores.length - 1)) * 100;
                  const y = 100 - score;
                  return `${x},${y}`;
                }).join(" ");
                return (
                  <div key={prayerId} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-sans font-medium text-foreground">{prayer.nameEnglish}</div>
                        <div className="font-hebrew-ui text-sm text-muted-foreground" dir="rtl">{prayer.nameHebrew}</div>
                      </div>
                      <div className={`font-syne font-bold text-xl ${
                        best >= 90 ? "text-amber-500" : best >= 80 ? "text-primary" : "text-accent"
                      }`}>
                        {best}
                      </div>
                    </div>
                    {badgeTier && (
                      <div className="mb-2">
                        <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                          badgeTier === "gold"
                            ? "bg-amber-100 text-amber-700"
                            : badgeTier === "silver"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {badgeTier.charAt(0).toUpperCase() + badgeTier.slice(1)} badge
                        </span>
                      </div>
                    )}
                    {scores.length > 1 && (
                      <div className="mb-3 bg-muted/40 rounded-xl p-2">
                        <div className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Fluency trend</div>
                        <svg viewBox="0 0 100 100" className="w-full h-16">
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            className="text-primary"
                            strokeWidth="4"
                            points={points}
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {scores.map((score, i) => (
                        <div
                          key={i}
                          className={`font-sans text-xs px-2 py-1 rounded-lg ${
                            score >= 90 ? "bg-amber-100 text-amber-700" :
                            score >= 80 ? "bg-slate-100 text-slate-600" :
                            score >= 60 ? "bg-orange-100 text-orange-700" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {score}
                        </div>
                      ))}
                    </div>
                    {scores.length > 1 && (
                      <div className={`font-sans text-xs mt-2 ${
                        scores[scores.length - 1] > scores[scores.length - 2]
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}>
                        {scores[scores.length - 1] > scores[scores.length - 2]
                          ? `↑ Up ${scores[scores.length - 1] - scores[scores.length - 2]} points from last time`
                          : "Keep practicing!"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint trend */}
        <div className="mb-5 bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h2 className="font-syne font-bold text-base text-foreground mb-1">Hint Usage Trend</h2>
          <p className="font-sans text-xs text-muted-foreground mb-3">Last 7 days</p>
          {recentHintUsage.length === 0 ? (
            <div className="font-sans text-sm text-muted-foreground">No hint usage recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {recentHintUsage.map(([day, count], idx) => {
                const prev = idx > 0 ? recentHintUsage[idx - 1][1] : count;
                const trend = idx > 0 ? count - prev : 0;
                return (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="font-sans text-muted-foreground">{day}</span>
                    <span className="font-sans text-foreground">
                      {count} hint{count === 1 ? "" : "s"}
                      {idx > 0 && (
                        <span className={`ml-2 text-xs ${trend <= 0 ? "text-primary" : "text-accent"}`}>
                          {trend === 0 ? "→ steady" : trend < 0 ? `↓ ${Math.abs(trend)}` : `↑ ${trend}`}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Streak badges */}
        {state.streak >= 7 && (
          <div className="mb-5 bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h2 className="font-syne font-bold text-base text-foreground mb-3">Streak Badges</h2>
            <div className="flex flex-wrap gap-2">
              {state.streak >= 7 && (
                <span className="font-sans text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  Week Warrior · 7 days
                </span>
              )}
              {state.streak >= 30 && (
                <span className="font-sans text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Month Master · 30 days
                </span>
              )}
              {state.streak >= 60 && (
                <span className="font-sans text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">
                  Sixty Streak · 60 days
                </span>
              )}
            </div>
          </div>
        )}

        {/* Parent section */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="font-syne font-semibold text-foreground mb-1">For Parents</div>
          <div className="font-sans text-xs text-muted-foreground mb-3">Same screen — no separate login needed</div>
          <div className="space-y-2 text-sm font-sans">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Prayers mastered</span>
              <span className="font-medium text-foreground">{completedPrayers.length} of {prayers.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">In progress</span>
              <span className="font-medium text-foreground">{inProgressPrayers.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Current streak</span>
              <span className="font-medium text-foreground">{state.streak} days</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Boss rounds completed</span>
              <span className="font-medium text-foreground">{totalBossAttempts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
