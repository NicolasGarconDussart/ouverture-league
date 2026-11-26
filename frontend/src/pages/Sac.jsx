import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Package, Tag } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { Booster } from "../components/Booster";
import { GameCard } from "../components/GameCard";
import { Empty, PageHead } from "../components/Bits";
import { FINISHES, RARITIES, RESALE, TEAM_TOTAL, pad } from "../data/game";
import { duplicates, proDailyReady, teamOwned, useGame } from "../state/game";

const Sealed = ({ kind, title, detail, count, onOpen }) => (
  <article className="sealed panel" data-testid={`sealed-${kind}`}>
    <Booster kind={kind === "classic" ? "reserve" : kind} className="w-[84px] shrink-0 sm:w-[96px]" />
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <p className="font-display text-lg italic leading-tight">{title}</p>
      <p className="text-sm text-[var(--muted)]">{detail}</p>
      <span className="count-tag" data-testid={`sealed-${kind}-count`}>×{count}</span>
    </div>
    <button type="button" className="btn-gold px-4 py-3 text-sm" onClick={onOpen} data-testid={`sealed-${kind}-open`}>Ouvrir</button>
  </article>
);

export default function Sac() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();
  const [tab, setTab] = useState("sealed");
  const pro = proDailyReady(state);
  const sealed = [
    state.sealedClassic > 0 && { kind: "classic", title: "Booster classique", detail: "5 cartes · montée en rareté", count: state.sealedClassic },
    state.teamBoosters > 0 && { kind: "team", title: "Booster d’équipe AETHRA", detail: "5 cartes AETHRA · gagné en récompense", count: state.teamBoosters },
    pro && { kind: "pro", title: "Journalier Pro", detail: "10 cartes · disponible aujourd’hui", count: 1 },
  ].filter(Boolean);
  const sealedCount = sealed.reduce((t, s) => t + s.count, 0);
  const dups = duplicates(state);
  const dupCount = dups.reduce((t, c) => t + state.owned[c.no] - 1, 0);

  const resell = (c) => {
    dispatch({ type: "resell", no: c.no });
    toast.success(`+${RESALE[c.rarity]} CC`, { description: `${c.player} ${pad(c.no)} revendue au jeu` });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="bag-page">
      <PageHead eyebrow="Inventaire" title="Sac">
        <div className="panel flex items-center gap-6 px-5 py-3 text-sm" data-testid="bag-summary">
          <span><span className="stat-label block">Solde</span><b className="font-mono text-[var(--gold-hi)]">{state.cc} CC</b></span>
          <span><span className="stat-label block">Variantes</span><b className="font-mono">{teamOwned(state)}/{TEAM_TOTAL}</b></span>
          <span><span className="stat-label block">Ouvertures</span><b className="font-mono">{state.stats.opened}</b></span>
        </div>
      </PageHead>

      <div className="bag-tabs mt-6" role="tablist" aria-label="Contenu du sac">
        <button type="button" role="tab" aria-selected={tab === "sealed"} className={tab === "sealed" ? "is-on" : ""} onClick={() => setTab("sealed")} data-testid="bag-tab-sealed">
          <Package className="h-4 w-4" /> Scellés <span className="count-tag">{sealedCount}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "cards"} className={tab === "cards" ? "is-on" : ""} onClick={() => setTab("cards")} data-testid="bag-tab-cards">
          <Tag className="h-4 w-4" /> Cartes en double <span className="count-tag">{dupCount}</span>
        </button>
      </div>

      {tab === "sealed" ? (
        sealed.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="bag-sealed-list">
            {sealed.map((s) => <Sealed key={s.kind} {...s} onOpen={() => nav(`/ouverture?booster=${s.kind}`)} />)}
          </div>
        ) : (
          <Empty icon={Package} title="Aucun scellé" text="Achète un booster ou un demi-display en Boutique, ou récupère un lot dans les Succès." testId="bag-sealed-empty">
            <button type="button" className="btn-gold px-5 py-3 text-sm" onClick={() => nav("/boutique")}>Aller à la Boutique</button>
          </Empty>
        )
      ) : dups.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" data-testid="bag-cards-list">
          {dups.map((c) => {
            const r = RARITIES[c.rarity];
            return (
              <article key={c.no} className="dup" data-testid={`bag-card-${pad(c.no)}`}>
                <div className="relative">
                  <GameCard card={c} />
                  <span className="dup__count">×{state.owned[c.no] - 1}</span>
                </div>
                <p className="mt-2 text-xs"><b style={{ color: r.color }}>{r.name}</b> · {FINISHES[c.finish]} · <span className="font-mono">{pad(c.no)}</span></p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button type="button" className="btn-ghost py-2 text-xs" onClick={() => resell(c)} data-testid={`resell-${pad(c.no)}`}>
                    <Coins className="h-3.5 w-3.5" /> Revendre +{RESALE[c.rarity]} CC
                  </button>
                  <button type="button" className="btn-sell justify-center py-2 text-xs" onClick={() => nav("/marche?vendre=1")} data-testid={`to-market-${pad(c.no)}`}>
                    <Tag className="h-3.5 w-3.5" /> Vendre au Marché
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty icon={Tag} title="Aucune carte en double" text="Les doublons tirés arrivent ici. Ton Classeur garde toujours un exemplaire de chaque variante." testId="bag-cards-empty">
          <button type="button" className="btn-gold px-5 py-3 text-sm" onClick={() => nav("/ouverture")}>Ouvrir un booster</button>
        </Empty>
      )}
    </main>
  );
}
