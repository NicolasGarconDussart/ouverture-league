import { Clock, Crown, Loader2, Sparkles } from "lucide-react";
import { Countdown, Pips } from "./Bits";

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
        <span className="stat-label">Réserve gratuite</span>
        <div className="flex items-end gap-3">
          <span className="stat-big" data-testid="reserve-counter-badge" aria-label={`Réserve ${state.reserve} sur ${state.reserveMax}`}>
            {state.reserve}<small>/{state.reserveMax}</small>
          </span>
        </div>
        <Pips value={state.reserve} max={state.reserveMax} />
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-[var(--ink)]">
          <Clock className="h-4 w-4 text-[var(--gold-hi)]" /> <span className="hidden sm:inline">+1 booster dans</span><span className="sm:hidden">+1 dans</span>
          <Countdown to={state.nextRechargeAt} full={state.reserve >= state.reserveMax} className="font-mono font-semibold" testId="booster-countdown-timer" />
        </p>
      </div>
    );
  if (slide.kind === "team")
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <span className="stat-label">Booster d’équipe · AETHRA</span>
        <span className="stat-big" data-testid="team-booster-count">×{state.teamBoosters}</span>
        <p className="hidden text-sm text-[var(--muted)] sm:block">Gagné avec les récompenses de niveau.</p>
        <ReserveLine state={state} />
      </div>
    );
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="stat-label flex items-center gap-1.5"><Crown className="h-3.5 w-3.5" /> Journalier Pro</span>
      <span className="stat-big" data-testid="pro-card-count">10<small> cartes</small></span>
      <p className="hidden text-sm text-[var(--muted)] sm:block">Un booster par jour, réservé à l’offre Pro. Séparé de la réserve gratuite.</p>
      <ReserveLine state={state} />
    </div>
  );
};

export const OpenPanel = ({ slide, state, canOpen, open, pro, opening, variant }) => {
  const label =
    slide.kind === "reserve" ? (state.reserve > 0 ? "Ouvrir" : "Réserve vide") : slide.kind === "team" ? (state.teamBoosters > 0 ? "Ouvrir" : "Aucun booster") : "Découvrir Pro";
  const action = slide.kind === "pro" ? pro : open;
  return (
    <div className={`open-panel open-panel--${variant} panel`} data-testid="open-panel">
      <Counter slide={slide} state={state} />
      <div className="op-action flex flex-col gap-2">
        <button
          type="button"
          className={slide.kind === "pro" ? "btn-ghost w-full py-4" : "btn-gold btn-open w-full py-4"}
          onClick={action}
          disabled={(slide.kind !== "pro" && !canOpen) || !!opening}
          data-testid={slide.kind === "pro" ? "pro-discover-button" : "open-booster-button"}
        >
          {opening ? <Loader2 className="h-5 w-5 animate-spin" /> : slide.kind === "pro" ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          {opening ? "Ouverture…" : label}
        </button>
        <p className="hidden text-center text-xs text-[var(--muted)] sm:block">{slide.detail}</p>
      </div>
    </div>
  );
};
