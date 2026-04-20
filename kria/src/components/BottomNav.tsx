import { useLocation } from "wouter";
import { Home, BarChart2 } from "lucide-react";

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const items = [
    { path: "/", label: "Home", icon: Home },
    { path: "/progress", label: "Progress", icon: BarChart2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-t border-border">
      <div className="max-w-sm mx-auto flex">
        {items.map(({ path, label, icon: Icon }) => {
          const active = location === path;
          return (
            <button
              key={path}
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => setLocation(path)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-sans text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
