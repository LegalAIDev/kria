import { createContext, useContext, useState, useCallback } from "react";
import { initialGameState, GameState } from "@/data/gameState";

interface GameContextType {
  state: GameState;
  addXp: (amount: number) => void;
  useHint: () => void;
  setEnergy: (energy: number) => void;
  setPrayerActivity: (prayerId: string | null, activity: GameState["currentActivity"]) => void;
  addBossScore: (prayerId: string, score: number) => void;
  setUserName: (name: string) => void;
  recordChunkConfidence: (chunkId: string, confidencePct: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialGameState);

  const addXp = useCallback((amount: number) => {
    setState(s => ({ ...s, xp: s.xp + amount }));
  }, []);

  const useHint = useCallback(() => {
    setState(s => ({ ...s, hintsRemaining: Math.max(0, s.hintsRemaining - 1) }));
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

  return (
    <GameContext.Provider value={{ state, addXp, useHint, setEnergy, setPrayerActivity, addBossScore, setUserName, recordChunkConfidence }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
