import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Backpack, BarChart3, BookOpen, RotateCcw, Settings2, Store, Trophy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { toast } from "./ui/sonner";
import { ASSETS, PROFILE } from "../data/game";
import { useGame } from "../state/game";

const DIRS = [
  { id: "table", short: "Table", full: "Table de collection" },
  { id: "arena", short: "Arène", full: "Arène Cross League" },
];

const DirectionSwitch = () => {
  const { state, dispatch } = useGame();
  const set = (v) => dispatch({ type: "direction", value: v });
  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      set(state.direction === "table" ? "arena" : "table");
    }
  };
  return (
    <div role="radiogroup" aria-label="Direction visuelle" className="dir-switch" onKeyDown={onKey} data-testid="composition-direction-selector">
      {DIRS.map((d) => (
        <button
          key={d.id}
          type="button"
          role="radio"
          aria-checked={state.direction === d.id}
          tabIndex={state.direction === d.id ? 0 : -1}
          title={d.full}
          onClick={() => set(d.id)}
          className={state.direction === d.id ? "is-on" : ""}
          data-testid={`direction-${d.id}`}
        >
          <span className="sm:hidden">{d.short}</span>
          <span className="hidden sm:inline">{d.full}</span>
        </button>
      ))}
    </div>
  );
};

const SettingsMenu = () => {
  const { state, dispatch } = useGame();
  const nav = useNavigate();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="icon-btn" aria-label="Réglages de la démo" data-testid="settings-button">
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="lm-pop w-72" data-testid="settings-popover">
        <p className="stat-label mb-3">Réglages de la démo</p>
        <label className="flex items-center justify-between gap-3 py-2 text-sm">
          <span>
            Mouvement réduit
            <span className="block text-xs text-[var(--muted)]">Coupe inclinaisons, reflets et transitions</span>
          </span>
          <Switch checked={state.reduced} onCheckedChange={(v) => dispatch({ type: "reduced", value: v })} data-testid="reduced-motion-switch" />
        </label>
        <button
          type="button"
          className="btn-ghost mt-3 w-full py-2.5 text-sm"
          data-testid="reset-demo-button"
          onClick={() => {
            dispatch({ type: "reset" });
            nav("/");
            toast("Démo remise à zéro", { description: "Réserve 3/10, profil et classeur réinitialisés." });
          }}
        >
          <RotateCcw className="h-4 w-4" /> Remettre la démo à zéro
        </button>
      </PopoverContent>
    </Popover>
  );
};

export const TopBar = () => {
  const { state } = useGame();
  return (
    <header className="topbar" data-testid="top-bar">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link to="/" data-testid="brand-home-link" aria-label="League Master, Ouverture" className="shrink-0">
          <img src={ASSETS.logo} alt="League Master" className="h-10 w-auto" />
        </Link>
        <div className="hidden items-center gap-2.5 md:flex" data-testid="profile-chip">
          <span className="avatar">{PROFILE.initials}</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{PROFILE.name}</span>
            <span className="block text-xs text-[var(--muted)]">{PROFILE.tag} · AETHRA</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="cc-chip" data-testid="cc-balance">{state.cc} CC</span>
          <DirectionSwitch />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
};

const ITEMS = [
  { id: "boutique", label: "Boutique", icon: Store },
  { id: "classeur", label: "Classeur", icon: BookOpen, to: "/classeur" },
  { id: "marche", label: "Marché", icon: ArrowLeftRight },
  { id: "ouverture", label: "Ouverture", to: "/", main: true },
  { id: "sac", label: "Sac", icon: Backpack },
  { id: "succes", label: "Succès", icon: Trophy },
  { id: "classements", label: "Classements", icon: BarChart3 },
];

export const Dock = () => {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const active = pathname.startsWith("/classeur") ? "classeur" : "ouverture";
  const go = (it) => {
    if (it.to) nav(it.to);
    else toast(`${it.label} · deuxième passe`, { description: "Cet écran sera conçu dans la direction retenue." });
  };
  return (
    <nav className="dock" aria-label="Navigation principale" data-testid="bottom-dock">
      {ITEMS.map((it) => {
        const on = active === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => go(it)}
            aria-current={on ? "page" : undefined}
            aria-label={it.label}
            className={`dock-item ${on ? "is-on" : ""} ${it.main ? "is-main" : ""} ${it.to ? "" : "is-soon"}`}
            data-testid={`dock-${it.id}`}
          >
            {it.main ? (
              <span className="dock-pack"><img src={ASSETS.booster} alt="" /></span>
            ) : (
              <Icon className="h-5 w-5" />
            )}
            <span className="dock-label">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
