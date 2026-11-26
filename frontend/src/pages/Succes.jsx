import { Check, Gift, Lock } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { PageHead } from "../components/Bits";
import { ASSETS, CARDS, OBJECTIVES, RARITIES, TEAM_MEMBERS, TEAM_OTHERS } from "../data/game";
import { objectiveValue, useGame } from "../state/game";

const Objective = ({ o, state, onClaim }) => {
  const v = Math.min(objectiveValue(state, o), o.target);
  const done = state.objectivesClaimed.includes(o.id);
  const ready = !done && v >= o.target;
  return (
    <article className={`objective panel ${ready ? "is-ready" : ""} ${done ? "is-done" : ""}`} data-testid={`objective-${o.id}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold">{o.label}</p>
        {ready && <span className="ready-dot" aria-hidden="true" />}
      </div>
      <p className="flex items-center gap-2 text-sm text-[var(--muted)]"><Gift className="h-4 w-4" /> {o.reward}</p>
      <div className="flex items-center gap-3">
        <div className="xpbar flex-1"><span style={{ width: `${(v / o.target) * 100}%` }} /></div>
        <span className="font-mono text-sm">{v}/{o.target}</span>
      </div>
      {ready ? (
        <button type="button" className="btn-gold py-3 text-sm" onClick={() => onClaim(o)} data-testid={`claim-objective-${o.id}`}>Récupérer le lot</button>
      ) : (
        <p className="flex items-center gap-1.5 text-sm text-[var(--muted)]" data-testid={`objective-status-${o.id}`}>
          {done ? <><Check className="h-4 w-4" /> Lot récupéré</> : "En cours"}
        </p>
      )}
    </article>
  );
};

export default function Succes() {
  const { state, dispatch } = useGame();
  const tiers = RARITIES.map((r, k) => {
    const tizow = CARDS.some((c) => c.rarity === k && state.owned[c.no]) ? 1 : 0;
    const n = TEAM_OTHERS[k] + tizow;
    return { r, n, got: n >= TEAM_MEMBERS };
  });
  const acquired = tiers.filter((t) => t.got).length;

  const claim = (o) => {
    dispatch({ type: "claimObjective", id: o.id });
    toast.success("Lot récupéré", { description: `${o.reward} · ${o.kind === "cc" ? "ajouté au solde" : "rangé dans le Sac"}` });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="achievements-page">
      <PageHead eyebrow="Objectifs & icônes" title="Succès" />

      <h2 className="stat-label mt-8">Objectifs Cross League</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {OBJECTIVES.map((o) => <Objective key={o.id} o={o} state={state} onClaim={claim} />)}
      </div>

      <section className="icons-panel panel mt-8" data-testid="team-icons">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={ASSETS.aethra} alt="AETHRA" className="h-12 w-12" />
            <div>
              <p className="font-display text-2xl italic">Icônes AETHRA</p>
              <p className="text-sm text-[var(--muted)]">Les {TEAM_MEMBERS} membres au même palier débloquent l’icône.</p>
            </div>
          </div>
          <span className="font-mono text-sm" data-testid="icons-acquired-count">{acquired}/6 acquises</span>
        </div>
        <div className="icons-grid mt-6">
          {tiers.map(({ r, n, got }) => (
            <div key={r.id} className={`icon-tier ${got ? "is-got" : ""}`} style={{ "--r": r.color }} data-testid={`icon-tier-${r.id}`}>
              <span className="icon-medal">
                <img src={ASSETS.aethra} alt="" />
                {got ? <Check className="icon-medal__badge" /> : <Lock className="icon-medal__badge" />}
              </span>
              <span className="min-w-0">
                <b className="block" style={{ color: r.color }}>{r.name}</b>
                <span className="block text-xs text-[var(--muted)]">{n}/{TEAM_MEMBERS} membres</span>
                <span className="pips mt-1.5 w-full max-w-[96px]">{Array.from({ length: TEAM_MEMBERS }, (_, i) => <i key={i} className={i < n ? "on-r" : ""} />)}</span>
              </span>
              <span className={`text-xs font-semibold ${got ? "" : "text-[var(--muted)]"}`}>{got ? "Acquise" : "Verrouillée"}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
