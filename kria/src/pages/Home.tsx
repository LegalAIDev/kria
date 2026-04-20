import { useState } from "react";
import { useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { useGame } from "@/context/GameContext";
import { prayers } from "@/data/prayers";
import { getAvatarTitle } from "@/data/prayers";
import { ChevronRight, CheckCircle2, Lock, CircleDot, Star, Pencil, Check, X } from "lucide-react";

export default function Home() {
  const { state, setUserName } = useGame();
  const [, setLocation] = useLocation();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.userName);

  const { current: avatarCurrent, next: avatarNext } = getAvatarTitle(state.xp);

  const xpToNext = avatarNext.xpThreshold - state.xp;
  const xpProgress = (state.xp - avatarCurrent.xpThreshold) / (avatarNext.xpThreshold - avatarCurrent.xpThreshold);

  function handlePrayerTap(prayer: typeof prayers[0]) {
    if (prayer.status === "locked") return;
    setLocation(`/prayer/${prayer.id}`);
  }

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setUserName(trimmed);
    } else {
      setNameInput(state.userName);
    }
    setEditingName(false);
  }

  function cancelEdit() {
    setNameInput(state.userName);
    setEditingName(false);
  }

  return (
    <div className="min-h-screen bg-background" data-testid="screen-home">
      <TopBar />

      <div className="max-w-sm mx-auto px-4 pb-8">
        {/* Greeting */}
        <div className="pt-6 pb-5">
          <p className="font-sans text-muted-foreground text-sm">Good morning,</p>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                data-testid="input-edit-name"
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") cancelEdit(); }}
                autoFocus
                className="font-syne font-bold text-3xl text-foreground bg-transparent border-b-2 border-primary outline-none w-40 pb-0.5"
              />
              <button data-testid="button-save-name" onClick={saveName} className="text-primary hover:opacity-70 transition-opacity">
                <Check className="w-5 h-5" />
              </button>
              <button data-testid="button-cancel-name" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <h1 className="font-syne font-bold text-3xl text-foreground">{state.userName}</h1>
              <button
                data-testid="button-edit-name"
                onClick={() => { setNameInput(state.userName); setEditingName(true); }}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-0.5"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
            <div className="font-syne font-bold text-2xl text-foreground" data-testid="text-streak-count">{state.streak}</div>
            <div className="font-sans text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">Day Streak</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
            <div className="font-syne font-bold text-2xl text-foreground" data-testid="text-total-xp">{state.xp.toLocaleString()}</div>
            <div className="font-sans text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">Total XP</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
            <div className="flex justify-center gap-0.5 pt-1">
              {Array.from({ length: state.maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-5 rounded-full transition-all ${
                    i < state.energy ? "bg-amber-500" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="font-sans text-xs text-muted-foreground mt-1 uppercase tracking-wide">Energy</div>
          </div>
        </div>

        {/* Avatar title card */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm" data-testid="card-avatar">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Current Title</div>
              <div className="font-syne font-semibold text-foreground text-base">{avatarCurrent.title}</div>
              <div className="font-hebrew-ui text-sm text-muted-foreground mt-0.5" dir="rtl">{avatarCurrent.hebrew}</div>
            </div>
            <div className="text-right">
              <div className="font-sans text-xs text-muted-foreground">{state.xp.toLocaleString()} XP</div>
              <div className="font-sans text-xs text-primary mt-0.5">Next: {avatarNext.title} at {avatarNext.xpThreshold.toLocaleString()}</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, xpProgress * 100)}%` }}
            />
          </div>
          <div className="font-sans text-xs text-muted-foreground mt-1.5">{xpToNext.toLocaleString()} XP to next title</div>
        </div>

        {/* Prayer map */}
        <div className="mb-4">
          <h2 className="font-syne font-bold text-lg text-foreground mb-3">Prayer Map</h2>
          <div className="space-y-2">
            {prayers.map((prayer) => {
              const isLocked = prayer.status === "locked";
              const isComplete = prayer.status === "complete";
              const isInProgress = prayer.status === "in-progress";

              return (
                <button
                  key={prayer.id}
                  data-testid={`card-prayer-${prayer.id}`}
                  onClick={() => handlePrayerTap(prayer)}
                  disabled={isLocked}
                  className={`w-full text-left bg-card border rounded-2xl p-4 transition-all duration-200 shadow-sm ${
                    isLocked
                      ? "border-border opacity-50 cursor-not-allowed"
                      : "border-border hover:border-primary/40 hover:shadow-md active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : isInProgress ? (
                        <CircleDot className="w-6 h-6 text-accent" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-sans text-xs text-muted-foreground">Level {prayer.level}</span>
                        {prayer.badgeTier && (
                          <span className={`font-sans text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            prayer.badgeTier === "gold"
                              ? "bg-amber-100 text-amber-700"
                              : prayer.badgeTier === "silver"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {prayer.badgeTier.charAt(0).toUpperCase() + prayer.badgeTier.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="font-sans font-medium text-foreground text-sm">{prayer.nameEnglish}</div>
                      <div className="font-hebrew-ui text-base text-muted-foreground mt-0.5" dir="rtl">{prayer.nameHebrew}</div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {isComplete && prayer.bossBestScore !== undefined ? (
                        <div>
                          <div className="font-syne font-bold text-primary text-lg">{prayer.bossBestScore}</div>
                          <div className="font-sans text-xs text-muted-foreground">Gold</div>
                        </div>
                      ) : isInProgress ? (
                        <div>
                          <div className="font-sans text-xs text-muted-foreground">In Progress</div>
                          <div className="font-sans text-xs text-accent font-medium">Unit {prayer.unit} of {prayer.totalUnits}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-sans text-xs text-muted-foreground/50">Unlock next</div>
                        </div>
                      )}
                      {!isLocked && <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />}
                    </div>
                  </div>

                  {isInProgress && (
                    <div className="mt-2 ml-11">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
                          style={{ width: `${(prayer.unit / prayer.totalUnits) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Boss Scores / Badges section */}
        <div className="mt-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h3 className="font-syne font-semibold text-foreground mb-3">Recent Boss Rounds</h3>
          {Object.entries(state.bossRoundScores).map(([prayerId, scores]) => {
            const prayer = prayers.find(p => p.id === prayerId);
            if (!prayer) return null;
            return (
              <div key={prayerId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-sans text-sm font-medium text-foreground">{prayer.nameEnglish}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {scores.map((score, i) => (
                      <div
                        key={i}
                        className={`font-sans text-xs px-1.5 py-0.5 rounded ${
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
                </div>
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round((scores[scores.length - 1] / 100) * 3)
                          ? "text-amber-400 fill-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
