import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Backpack, BarChart3, BookOpen, Crown, Home, RotateCcw, Settings2, Store, Trophy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { toast } from "./ui/sonner";
import { ASSETS, PROFILE } from "../data/game";
import { isPro, useGame } from "../state/game";

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
          data-testid="home-link-button"
          onClick={() => nav("/")}
        >
          <Home className="h-4 w-4" /> Revenir à l’accueil
        </button>
        <button
          type="button"
          className="btn-ghost mt-2 w-full py-2.5 text-sm"
          data-testid="reset-demo-button"
          onClick={() => {
            dispatch({ type: "reset" });
            nav("/");
            toast("Démo remise à zéro", { description: "Profil, réserve 3/10, Sac, Marché et Classeur réinitialisés." });
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
        <Link to="/ouverture" data-testid="brand-home-link" aria-label="League Master, Ouverture" className="shrink-0">
          <img src={ASSETS.logo} alt="League Master" className="h-10 w-auto" />
        </Link>
        <div className="hidden items-center gap-2.5 md:flex" data-testid="profile-chip">
          <span className="avatar">{PROFILE.initials}</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{PROFILE.name}{isPro(state) && <span className="pro-pill"><Crown className="h-3 w-3" /> Pro</span>}</span>
            <span className="block text-xs text-[var(--muted)]">{PROFILE.tag} · AETHRA</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="cc-chip" data-testid="cc-balance">{state.cc} CC</span>
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
};

const ITEMS = [
  { id: "boutique", label: "Boutique", icon: Store, to: "/boutique" },
  { id: "classeur", label: "Classeur", icon: BookOpen, to: "/classeur" },
  { id: "marche", label: "Marché", icon: ArrowLeftRight, to: "/marche" },
  { id: "ouverture", label: "Ouverture", to: "/ouverture", main: true },
  { id: "sac", label: "Sac", icon: Backpack, to: "/sac" },
  { id: "succes", label: "Succès", icon: Trophy, to: "/succes" },
  { id: "classements", label: "Classements", icon: BarChart3, to: "/classements" },
];

export const Dock = () => {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const hit = ITEMS.find((it) => !it.main && pathname.startsWith(it.to));
  const active = hit ? hit.id : "ouverture";
  const go = (it) => nav(it.to);
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
            className={`dock-item ${on ? "is-on" : ""} ${it.main ? "is-main" : ""}`}
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
