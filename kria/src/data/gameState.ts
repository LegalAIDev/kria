export interface GameState {
  userName: string;
  xp: number;
  streak: number;
  energy: number;
  maxEnergy: number;
  hintsRemaining: number;
  currentPrayerId: string | null;
  currentActivity: "listen" | "chunkflash" | "speedtap" | "scramble" | "bossround" | null;
  bossRoundScores: Record<string, number[]>;
  chunkConfidence: Record<string, number>;
}

export const initialGameState: GameState = {
  userName: "",
  xp: 0,
  streak: 0,
  energy: 10,
  maxEnergy: 10,
  hintsRemaining: 3,
  currentPrayerId: "modeh-ani",
  currentActivity: null,
  bossRoundScores: {},
  chunkConfidence: {},
};
