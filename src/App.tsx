import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider, useGame } from "@/context/GameContext";
import { BottomNav } from "@/components/BottomNav";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import PrayerDetail from "@/pages/PrayerDetail";
import ListenFollow from "@/pages/ListenFollow";
import ChunkFlash from "@/pages/ChunkFlash";
import SpeedTap from "@/pages/SpeedTap";
import ChunkScramble from "@/pages/ChunkScramble";
import BossRound from "@/pages/BossRound";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/progress" component={Progress} />
      <Route path="/prayer/:prayerId" component={PrayerDetail} />
      <Route path="/prayer/:prayerId/listen" component={ListenFollow} />
      <Route path="/prayer/:prayerId/chunkflash" component={ChunkFlash} />
      <Route path="/prayer/:prayerId/speedtap" component={SpeedTap} />
      <Route path="/prayer/:prayerId/scramble" component={ChunkScramble} />
      <Route path="/prayer/:prayerId/bossround" component={BossRound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const { state } = useGame();

  if (!state.userName) {
    return <Onboarding />;
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <div className="pb-16">
        <Router />
      </div>
      <BottomNav />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <AppShell />
          <Toaster />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
