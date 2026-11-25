import { Gift, Check, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { toast } from "./ui/sonner";
import { LEVELS, REWARDS, levelFromXp } from "../data/game";
import { useGame } from "../state/game";

export const LevelChip = ({ className = "" }) => {
  const { state, dispatch } = useGame();
  const lvl = levelFromXp(state.xp);
  const a = LEVELS[lvl];
  const b = LEVELS[lvl + 1] ?? a;
  const pct = b > a ? ((state.xp - a) / (b - a)) * 100 : 100;
  const avail = REWARDS.filter((r) => r.level <= lvl && !state.claimed.includes(r.level)).length;

  const claim = (r) => {
    dispatch({ type: "claim", level: r.level });
    toast.success(`Récompense du niveau ${r.level} récupérée`, { description: r.label });
  };

  return (
    <div className={`level-chip panel flex items-center gap-3 p-3 ${className}`} data-testid="level-chip">
      <div className="level-badge" aria-hidden="true">{lvl}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold">Niveau {lvl}</span>
          <span className="font-mono text-xs text-[var(--muted)]" data-testid="level-xp">{state.xp} / {b} XP</span>
        </div>
        <div className="xpbar mt-1.5" role="progressbar" aria-valuemin={a} aria-valuemax={b} aria-valuenow={state.xp} aria-label="Progression de niveau">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 hidden text-xs text-[var(--muted)] sm:block">Niveau {lvl + 1} dans {Math.max(0, b - state.xp)} XP</p>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className="reward-btn" data-testid="level-rewards-trigger-button" aria-label={`Récompenses de niveau, ${avail} disponible(s)`}>
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Récompenses</span>
            {avail > 0 && <span className="reward-count" data-testid="rewards-available-count">{avail}</span>}
          </button>
        </SheetTrigger>
        <SheetContent className="lm-sheet" data-testid="rewards-sheet">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Récompenses de niveau</SheetTitle>
            <SheetDescription className="text-[var(--muted)]">Chaque niveau débloque un lot. Les boosters gagnés rejoignent l’Ouverture.</SheetDescription>
          </SheetHeader>
          <ul className="mt-6 flex flex-col gap-2">
            {REWARDS.map((r) => {
              const done = state.claimed.includes(r.level);
              const open = !done && r.level <= lvl;
              return (
                <li key={r.level} className={`reward-row ${open ? "is-open" : ""} ${done ? "is-done" : ""}`} data-testid={`reward-row-${r.level}`}>
                  <span className="reward-lvl">Niv. {r.level}</span>
                  <span className="flex-1 text-sm">{r.label}</span>
                  {done && <span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Check className="h-3.5 w-3.5" /> Récupérée</span>}
                  {open && (
                    <button type="button" className="btn-gold px-3 py-1.5 text-xs" onClick={() => claim(r)} data-testid={`claim-reward-${r.level}`}>
                      Récupérer
                    </button>
                  )}
                  {!done && !open && <span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Lock className="h-3.5 w-3.5" /> Verrouillée</span>}
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
};
