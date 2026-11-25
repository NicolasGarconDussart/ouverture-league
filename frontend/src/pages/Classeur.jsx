import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../components/ui/dialog";
import { GameCard, Silhouette } from "../components/GameCard";
import { Tilt } from "../components/Tilt";
import { MaskedTitle } from "../components/Bits";
import { ASSETS, CARDS, FINISHES, OTHER_TEAM_OWNED, RARITIES, TEAM_TOTAL, pad } from "../data/game";
import { useGame } from "../state/game";

const Filter = ({ label, value, onChange, options, testId }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className="stat-label">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="lm-select" data-testid={testId} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="lm-pop">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const POSS = [
  { v: "all", l: "Toutes" },
  { v: "owned", l: "Possédées" },
  { v: "missing", l: "À découvrir" },
];

const Detail = ({ card, count, onClose }) => {
  const r = card ? RARITIES[card.rarity] : null;
  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="lm-dialog" data-testid="binder-card-detail">
        {card && (
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <div className="mx-auto w-[200px] sm:w-full">
              {count ? <Tilt max={10}><GameCard card={card} /></Tilt> : <Silhouette card={card} />}
            </div>
            <div className="flex flex-col gap-3">
              <DialogTitle className="font-display text-3xl">{card.player}</DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                {count ? `Possédée · ${count} exemplaire${count > 1 ? "s" : ""}` : "À découvrir dans les boosters Cross League."}
              </DialogDescription>
              <dl className="detail-list">
                <dt>Numéro</dt><dd className="font-mono">{pad(card.no)}/{TEAM_TOTAL}</dd>
                <dt>Rareté</dt><dd style={{ color: r.color }}>{r.name}</dd>
                <dt>Finition</dt><dd>{FINISHES[card.finish]}</dd>
                <dt>Équipe</dt><dd>AETHRA</dd>
                <dt>Rôle</dt><dd>{card.role}</dd>
              </dl>
              <button type="button" className="btn-ghost mt-auto py-3" onClick={onClose} data-testid="binder-detail-close">Fermer</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function Classeur() {
  const { state } = useGame();
  const [params] = useSearchParams();
  const fromDraw = params.get("tirage") === "1" && !!state.lastDraw;
  const drawIds = useMemo(() => state.lastDraw?.ids ?? [], [state.lastDraw]);
  const [rarity, setRarity] = useState("all");
  const [finish, setFinish] = useState("all");
  const [poss, setPoss] = useState("all");
  const [onlyDraw, setOnlyDraw] = useState(false);
  const [detail, setDetail] = useState(null);

  const list = useMemo(
    () =>
      CARDS.filter((c) => {
        const own = !!state.owned[c.no];
        if (rarity !== "all" && String(c.rarity) !== rarity) return false;
        if (finish !== "all" && String(c.finish) !== finish) return false;
        if (poss === "owned" && !own) return false;
        if (poss === "missing" && own) return false;
        if (onlyDraw && !drawIds.includes(c.no)) return false;
        return true;
      }),
    [state.owned, rarity, finish, poss, onlyDraw, drawIds],
  );

  const ownedCount = CARDS.filter((c) => state.owned[c.no]).length;

  useEffect(() => {
    if (!fromDraw) return undefined;
    const t = setTimeout(() => {
      const el = document.querySelector("[data-drawn='true']");
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -120 });
      else el.scrollIntoView({ block: "center" });
    }, 450);
    return () => clearTimeout(t);
  }, [fromDraw]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="binder-page">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Cross League · AETHRA</p>
          <MaskedTitle lines={["Classeur"]} className="font-display text-4xl sm:text-5xl lg:text-6xl" testId="page-title" />
        </div>
        <div className="panel flex items-center gap-4 p-3 lg:min-w-[460px]" data-testid="binder-completion-stats">
          <img src={ASSETS.aethra} alt="AETHRA" className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-sm"><span className="font-semibold">AETxTizow</span><span className="font-mono text-xs">{ownedCount}/24</span></div>
            <div className="xpbar mt-1"><span style={{ width: `${(ownedCount / 24) * 100}%` }} /></div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--muted)]">Équipe {ownedCount + OTHER_TEAM_OWNED}/{TEAM_TOTAL}</span>
              <span className="flex gap-1" aria-label="Progression par rareté">
                {RARITIES.map((r, k) => {
                  const n = CARDS.filter((c) => c.rarity === k && state.owned[c.no]).length;
                  return <i key={r.id} className="rar-dot" style={{ "--r": r.color, "--f": n / 4 }} title={`${r.name} ${n}/4`} />;
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {fromDraw && (
        <div className="draw-banner mt-5" data-testid="binder-draw-banner">
          <span className="text-sm">
            Ton tirage est rangé : <b>{drawIds.length - (state.lastDraw?.dupes?.length ?? 0)} nouvelles</b>, {state.lastDraw?.dupes?.length ?? 0} doublon.
          </span>
          <button type="button" className={`chip ${onlyDraw ? "is-on" : ""}`} onClick={() => setOnlyDraw((v) => !v)} aria-pressed={onlyDraw} data-testid="binder-only-draw-toggle">
            {onlyDraw ? "Tout afficher" : "Voir seulement le tirage"}
          </button>
        </div>
      )}

      <div className="panel mt-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-4" data-testid="binder-filters">
        <Filter label="Équipe" value="aethra" onChange={() => {}} options={[{ value: "aethra", label: "AETHRA" }]} testId="binder-filter-team-select" />
        <Filter label="Rareté" value={rarity} onChange={setRarity} testId="binder-filter-rarity-select" options={[{ value: "all", label: "Toutes" }, ...RARITIES.map((r, k) => ({ value: String(k), label: r.name }))]} />
        <Filter label="Finition" value={finish} onChange={setFinish} testId="binder-filter-finish-select" options={[{ value: "all", label: "Toutes" }, ...FINISHES.map((f, k) => ({ value: String(k), label: f }))]} />
        <div className="col-span-2 flex min-w-0 flex-col gap-1.5 md:col-span-1">
          <span className="stat-label">Possession</span>
          <div className="seg" role="radiogroup" aria-label="Possession" data-testid="binder-filter-owned-toggle">
            {POSS.map((o) => (
              <button key={o.v} type="button" role="radio" aria-checked={poss === o.v} className={poss === o.v ? "is-on" : ""} onClick={() => setPoss(o.v)} data-testid={`binder-owned-${o.v}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-[var(--muted)]" data-testid="binder-result-count">{list.length} variante{list.length > 1 ? "s" : ""} · démo limitée à AETxTizow (001–024)</p>

      <div className="binder-grid mt-3" data-testid="binder-cards-grid">
        {list.map((c, k) => {
          const count = state.owned[c.no] ?? 0;
          const drawn = fromDraw && drawIds.includes(c.no);
          const r = RARITIES[c.rarity];
          return (
            <motion.button
              key={c.no}
              type="button"
              className={`tile ${drawn ? "is-drawn" : ""}`}
              data-drawn={drawn ? "true" : "false"}
              onClick={() => setDetail(c)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(k * 0.015, 0.3) }}
              data-testid={`binder-card-${pad(c.no)}`}
              aria-label={`${c.player} ${pad(c.no)}, ${r.name} ${FINISHES[c.finish]}, ${count ? "possédée" : "à découvrir"}`}
            >
              {count ? <GameCard card={c} /> : <Silhouette card={c} />}
              <span className="mt-2 flex items-center justify-between text-xs">
                <span className="font-mono">{pad(c.no)}</span>
                <span className="font-semibold" style={{ color: r.color }}>{r.short}</span>
              </span>
              <span className="block truncate text-left text-xs text-[var(--muted)]">{FINISHES[c.finish]}{count > 1 ? ` · ×${count}` : ""}</span>
              {drawn && <span className="new-badge">{state.lastDraw?.dupes?.includes(c.no) ? "+1" : "Nouveau"}</span>}
            </motion.button>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-sm text-[var(--muted)]" data-testid="binder-empty">Aucune variante ne correspond à ces filtres.</p>}

      <Detail card={detail} count={detail ? state.owned[detail.no] ?? 0 : 0} onClose={() => setDetail(null)} />
    </main>
  );
}
