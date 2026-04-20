import { prayers } from "@/data/prayers";

export interface PrayerProgress {
  unit: number;
  status: "locked" | "in-progress" | "complete";
}

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
  prayerProgress: Record<string, PrayerProgress>;
  hintUsageByDay: Record<string, number>;
  lastActiveDate: string | null;
}

const initialPrayerProgress: Record<string, PrayerProgress> = prayers.reduce((acc, prayer) => {
  acc[prayer.id] = {
    unit: prayer.unit,
    status: prayer.status,
  };
  return acc;
}, {} as Record<string, PrayerProgress>);

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
  prayerProgress: initialPrayerProgress,
  hintUsageByDay: {},
  lastActiveDate: null,
};
