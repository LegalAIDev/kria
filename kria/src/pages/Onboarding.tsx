import { useState } from "react";
import { useGame } from "@/context/GameContext";

export default function Onboarding() {
  const { setUserName } = useGame();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }
    setUserName(trimmed);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" data-testid="screen-onboarding">
      <div className="w-full max-w-xs">
        {/* Logo / wordmark */}
        <div className="text-center mb-10">
          <div className="font-syne font-bold text-primary text-5xl mb-2" dir="rtl">קריאה</div>
          <div className="font-syne font-semibold text-foreground text-2xl tracking-tight">Kria</div>
          <p className="font-sans text-muted-foreground text-sm mt-2">Hebrew fluency for davening</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name-input"
              className="font-sans text-sm font-medium text-foreground block mb-2"
            >
              What's your name?
            </label>
            <input
              id="name-input"
              data-testid="input-user-name"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="Enter your name"
              autoFocus
              className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 font-sans text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {error && (
              <p className="font-sans text-sm text-destructive mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            data-testid="button-start"
            className="w-full bg-primary text-primary-foreground font-syne font-semibold py-4 rounded-2xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all text-base"
          >
            Let's start
          </button>
        </form>

        <p className="font-sans text-xs text-muted-foreground text-center mt-8 leading-relaxed">
          Practice weekday Shacharit prayers at your own pace
        </p>
      </div>
    </div>
  );
}
