import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { initialGameState, GameState } from "@/data/gameState";
import { getNextPrayerId } from "@/data/prayers";

interface GameContextType {
  state: GameState;
  addXp: (amount: number) => void;
  useHint: () => void;
  setEnergy: (energy: number) => void;
  setPrayerActivity: (prayerId: string | null, activity: GameState["currentActivity"]) => void;
  addBossScore: (prayerId: string, score: number) => void;
  setUserName: (name: string) => void;
  recordChunkConfidence: (chunkId: string, confidencePct: number) => void;
  completeActivity: (prayerId: string, activity: GameState["currentActivity"], readyToAdvance?: boolean) => void;
  getPrayerProgress: (prayerId: string) => GameState["prayerProgress"][string];
}

const GameContext = createContext<GameContextType | null>(null);
const STORAGE_KEY = "kria-game-state-v1";

function loadInitialState(): GameState {
  if (typeof window === "undefined") return initialGameState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialGameState;
    const parsed = JSON.parse(raw) as Partial<GameState>;

    return {
      ...initialGameState,
      ...parsed,
      bossRoundScores: parsed.bossRoundScores ?? initialGameState.bossRoundScores,
      chunkConfidence: parsed.chunkConfidence ?? initialGameState.chunkConfidence,
    };
  } catch (err) {
    console.warn("Could not load saved game state:", err);
    return initialGameState;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Could not persist game state:", err);
    }
  }, [state]);

  const addXp = useCallback((amount: number) => {
    setState(s => ({ ...s, xp: s.xp + amount }));
  }, []);

  const useHint = useCallback(() => {
    setState(s => {
      if (s.hintsRemaining <= 0) return s;
      const dayKey = new Date().toISOString().slice(0, 10);
      return {
        ...s,
        hintsRemaining: Math.max(0, s.hintsRemaining - 1),
        hintUsageByDay: {
          ...s.hintUsageByDay,
          [dayKey]: (s.hintUsageByDay[dayKey] ?? 0) + 1,
        },
      };
    });
  }, []);

  const setEnergy = useCallback((energy: number) => {
    setState(s => ({ ...s, energy: Math.min(s.maxEnergy, Math.max(0, energy)) }));
  }, []);

  const setPrayerActivity = useCallback((prayerId: string | null, activity: GameState["currentActivity"]) => {
    setState(s => ({ ...s, currentPrayerId: prayerId, currentActivity: activity }));
  }, []);

  const addBossScore = useCallback((prayerId: string, score: number) => {
    setState(s => ({
      ...s,
      bossRoundScores: {
        ...s.bossRoundScores,
        [prayerId]: [...(s.bossRoundScores[prayerId] ?? []), score],
      },
    }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState(s => ({ ...s, userName: name }));
  }, []);

  const recordChunkConfidence = useCallback((chunkId: string, confidencePct: number) => {
    setState(s => ({
      ...s,
      chunkConfidence: {
        ...s.chunkConfidence,
        [chunkId]: confidencePct,
      },
    }));
  }, []);

  const completeActivity = useCallback((prayerId: string, activity: GameState["currentActivity"], readyToAdvance = true) => {
    if (!activity) return;

    setState(s => {
      const existing = s.prayerProgress[prayerId];
      if (!existing) return s;

      const unitByActivity: Record<Exclude<GameState["currentActivity"], null>, number> = {
        listen: 1,
        chunkflash: 2,
        speedtap: 3,
        scramble: 4,
        bossround: 5,
      };

      const activityUnit = unitByActivity[activity];
      const nextProgress = { ...s.prayerProgress };
      const current = nextProgress[prayerId];

      const nextUnit = activity === "bossround"
        ? current.unit
        : Math.min(5, Math.max(current.unit, activityUnit + 1));
      nextProgress[prayerId] = {
        ...current,
        unit: nextUnit,
      };

      if (activity === "bossround" && readyToAdvance) {
        nextProgress[prayerId] = { ...nextProgress[prayerId], status: "complete", unit: 5 };
        const nextPrayerId = getNextPrayerId(prayerId);
        if (nextPrayerId && nextProgress[nextPrayerId]?.status === "locked") {
          nextProgress[nextPrayerId] = { ...nextProgress[nextPrayerId], status: "in-progress", unit: 1 };
        }
      }

      return { ...s, prayerProgress: nextProgress };
    });
  }, []);

  const getPrayerProgress = useCallback((prayerId: string) => {
    return state.prayerProgress[prayerId] ?? { unit: 0, status: "locked" as const };
  }, [state.prayerProgress]);

  return (
    <GameContext.Provider value={{ state, addXp, useHint, setEnergy, setPrayerActivity, addBossScore, setUserName, recordChunkConfidence, completeActivity, getPrayerProgress }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
