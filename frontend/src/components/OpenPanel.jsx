import { Clock, Crown, Loader2, Sparkles } from "lucide-react";
import { Countdown, Pips } from "./Bits";
import { isPro, proDailyReady } from "../state/game";

const nextMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
};

const ReserveLine = ({ state }) => (
  <p className="flex items-center gap-2 text-xs text-[var(--muted)]" data-testid="reserve-reminder">
    <Clock className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Réserve gratuite</span><span className="sm:hidden">Réserve</span> {state.reserve}/{state.reserveMax} ·{" "}
    <Countdown to={state.nextRechargeAt} full={state.reserve >= state.reserveMax} className="font-mono" />
  </p>
);

const Counter = ({ slide, state }) => {
  if (slide.kind === "reserve")
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <span className="stat-label">Réserve gratuite{isPro(state) && " · Pro"}</span>
        <span className="stat-big" data-testid="reserve-counter-badge" aria-label={`Réserve ${state.reserve} sur ${state.reserveMax}`}>
          {state.reserve}<small>/{state.reserveMax}</small>
        </span>
        <Pips value={state.reserve} max={state.reserveMax} />
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-[var(--ink)]">
          <Clock className="h-4 w-4 text-[var(--gold-hi)]" /> <span className="hidden sm:inline">+1 booster dans</span><span className="sm:hidden">+1 dans</span>
          <Countdown to={state.nextRechargeAt} full={state.reserve >= state.reserveMax} className="font-mono font-semibold" testId="booster-countdown-timer" />
        </p>
      </div>
    );
  if (slide.kind === "team" || slide.kind === "classic")
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <span className="stat-label">{slide.kind === "team" ? "Booster d’équipe · AETHRA" : "Scellés du Sac"}</span>
        <span className="stat-big" data-testid={`${slide.kind}-booster-count`}>×{slide.kind === "team" ? state.teamBoosters : state.sealedClassic}</span>
        <p className="hidden text-sm text-[var(--muted)] sm:block">{slide.kind === "team" ? "Gagné avec les récompenses et les succès." : "Achetés en Boutique, rangés dans le Sac."}</p>
        <ReserveLine state={state} />
      </div>
    );
  const ready = proDailyReady(state);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="stat-label flex items-center gap-1.5"><Crown className="h-3.5 w-3.5" /> Journalier Pro</span>
      <span className="stat-big" data-testid="pro-card-count">10<small> cartes</small></span>
      <p className="text-sm text-[var(--muted)]" data-testid="pro-status">
        {!isPro(state) ? "Réservé à l’offre Pro, en plus de la réserve." : ready ? "Disponible aujourd’hui." : <>Revient dans <Countdown to={nextMidnight()} className="font-mono" /></>}
      </p>
      <ReserveLine state={state} />
    </div>
  );
};

export const OpenPanel = ({ slide, state, canOpen, open, pro, opening, variant }) => {
  const locked = slide.kind === "pro" && !isPro(state);
  const label = locked ? "Découvrir Pro" : canOpen ? "Ouvrir" : slide.kind === "reserve" ? "Réserve vide" : slide.kind === "pro" ? "Déjà ouvert" : "Aucun booster";
  return (
    <div className={`open-panel open-panel--${variant} panel`} data-testid="open-panel">
      <Counter slide={slide} state={state} />
      <div className="op-action flex flex-col gap-2">
        <button
          type="button"
          className={locked ? "btn-ghost w-full py-4" : "btn-gold btn-open w-full py-4"}
          onClick={locked ? pro : open}
          disabled={(!locked && !canOpen) || !!opening}
          data-testid={locked ? "pro-discover-button" : "open-booster-button"}
        >
          {opening ? <Loader2 className="h-5 w-5 animate-spin" /> : locked ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          {opening ? "Ouverture…" : label}
        </button>
        <p className="hidden text-center text-xs text-[var(--muted)] sm:block">{slide.detail}</p>
      </div>
    </div>
  );
};
