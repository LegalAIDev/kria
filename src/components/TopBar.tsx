import { useGame } from "@/context/GameContext";
import { Zap, Flame } from "lucide-react";

interface TopBarProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export function TopBar({ showBack, onBack, title }: TopBarProps) {
  const { state } = useGame();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm sticky top-0 z-20 border-b border-border/50">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
            data-testid="button-back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="font-syne font-bold text-primary text-lg">קריאה</span>
          </div>
        )}
        {title && <span className="font-syne font-semibold text-foreground text-sm">{title}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm font-sans font-medium text-foreground" data-testid="text-xp">
          <Zap className="w-3.5 h-3.5 text-accent fill-accent" />
          <span>{state.xp.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-sans font-medium text-amber-600" data-testid="text-energy">
          {Array.from({ length: state.maxEnergy }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-full transition-all duration-300 ${
                i < state.energy
                  ? "bg-amber-500"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-0.5 text-sm font-medium text-foreground" data-testid="text-streak">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
          <span className="font-sans">{state.streak}</span>
        </div>
      </div>
    </div>
  );
}
