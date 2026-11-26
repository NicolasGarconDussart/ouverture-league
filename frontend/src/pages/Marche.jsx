import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDownToLine, ArrowUpFromLine, Search, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/sonner";
import { GameCard } from "../components/GameCard";
import { Tilt } from "../components/Tilt";
import { Empty, PageHead } from "../components/Bits";
import { FINISHES, RARITIES, cardByNo, pad, priceOf } from "../data/game";
import { duplicates, useGame } from "../state/game";

const Meta = ({ c }) => {
  const r = RARITIES[c.rarity];
  return (
    <p className="text-sm"><b style={{ color: r.color }}>{r.name}</b> · {FINISHES[c.finish]}</p>
  );
};

const Listing = ({ l, owned, onOpen }) => {
  const c = cardByNo(l.no);
  return (
    <article className="listing panel" style={{ "--r": RARITIES[c.rarity].color }} data-testid={`listing-${l.id}`}>
      <button type="button" className="w-[76px] shrink-0 sm:w-[88px]" onClick={onOpen} aria-label={`Voir l’annonce ${c.player} ${pad(c.no)}`}>
        <GameCard card={c} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-display text-xl italic leading-tight">{c.player}</p>
        <Meta c={c} />
        <p className="truncate text-xs text-[var(--muted)]">{pad(c.no)}/120 · {l.mine ? "Ton annonce" : l.seller}</p>
        <p className="text-xs text-[var(--muted)]">{owned ? `Tu en as ×${owned}` : "Manquante au Classeur"}</p>
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <span className="price" data-testid={`listing-price-${l.id}`}>{l.price} CC</span>
        <button type="button" className="btn-ghost px-3 py-2 text-xs" onClick={onOpen} data-testid={`listing-detail-${l.id}`}>Détails</button>
      </div>
    </article>
  );
};

const ListingDetail = ({ l, state, onClose, onBuy, onUnlist }) => {
  const c = l ? cardByNo(l.no) : null;
  return (
    <Dialog open={!!l} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="lm-dialog" data-testid="listing-detail-dialog">
        {c && (
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <div className="mx-auto w-[190px] sm:w-full"><Tilt max={10}><GameCard card={c} /></Tilt></div>
            <div className="flex flex-col gap-3">
              <DialogTitle className="font-display text-3xl italic">{c.player}</DialogTitle>
              <DialogDescription asChild><div><Meta c={c} /></div></DialogDescription>
              <dl className="detail-list">
                <dt>Numéro</dt><dd className="font-mono">{pad(c.no)}/120</dd>
                <dt>Vendeur</dt><dd>{l.mine ? "Toi" : l.seller}</dd>
                <dt>Prix moyen</dt><dd className="font-mono">{priceOf(c)} CC</dd>
                <dt>Au Classeur</dt><dd>{state.owned[c.no] ? `×${state.owned[c.no]}` : "Manquante"}</dd>
              </dl>
              <p className="price mt-2 text-3xl">{l.price} CC</p>
              {l.mine ? (
                <button type="button" className="btn-ghost py-3" onClick={onUnlist} data-testid="listing-unlist-button">Retirer l’annonce</button>
              ) : (
                <button type="button" className="btn-gold py-3.5" disabled={state.cc < l.price} onClick={onBuy} data-testid="listing-buy-button">
                  {state.cc < l.price ? "Solde insuffisant" : `Acheter pour ${l.price} CC`}
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SellRow = ({ c, count, onSell, full }) => {
  const [price, setPrice] = useState(priceOf(c));
  return (
    <article className="listing panel" style={{ "--r": RARITIES[c.rarity].color }} data-testid={`sell-row-${pad(c.no)}`}>
      <div className="w-[76px] shrink-0"><GameCard card={c} /></div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-display text-xl italic leading-tight">{c.player}</p>
        <Meta c={c} />
        <p className="text-xs text-[var(--muted)]">{count - 1} en double · prix moyen {priceOf(c)} CC</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`price-${c.no}`}>Prix en CC</label>
          <Input id={`price-${c.no}`} type="number" min={1} value={price} onChange={(e) => setPrice(Math.max(1, Number(e.target.value) || 1))} className="lm-input w-24 font-mono" data-testid={`sell-price-input-${pad(c.no)}`} />
          <span className="text-xs text-[var(--muted)]">CC</span>
          <button type="button" className="btn-sell" disabled={full} onClick={() => onSell(c.no, price)} data-testid={`sell-submit-${pad(c.no)}`}>
            <Tag className="h-4 w-4" /> Mettre en vente
          </button>
        </div>
      </div>
    </article>
  );
};

export default function Marche() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("vendre") ? "sell" : "buy");
  const [q, setQ] = useState("");
  const [rar, setRar] = useState("all");
  const [sort, setSort] = useState("asc");
  const [openId, setOpenId] = useState(null);

  const mine = state.listings.filter((l) => l.mine);
  const others = state.listings.length - mine.length;
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.listings
      .filter((l) => !l.mine)
      .filter((l) => {
        const c = cardByNo(l.no);
        if (rar !== "all" && String(c.rarity) !== rar) return false;
        if (!term) return true;
        return [c.player, c.team, pad(c.no), RARITIES[c.rarity].name, FINISHES[c.finish], l.seller].join(" ").toLowerCase().includes(term);
      })
      .sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
  }, [state.listings, q, rar, sort]);
  const open = state.listings.find((l) => l.id === openId) ?? null;
  const dups = duplicates(state);

  const buy = () => {
    const c = cardByNo(open.no);
    dispatch({ type: "marketBuy", id: open.id });
    setOpenId(null);
    toast.success(`${c.player} ${pad(c.no)} acheté`, { description: `−${open.price} CC · rangé au Classeur`, action: { label: "Classeur", onClick: () => nav("/classeur") } });
  };
  const sell = (no, price) => {
    dispatch({ type: "marketList", no, price });
    toast.success("Annonce publiée", { description: `${pad(no)} · ${price} CC` });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="market-page">
      <PageHead eyebrow="Entre joueurs" title="Marché" />

      <div className="market-switch mt-6" role="tablist" aria-label="Mode du marché">
        <button type="button" role="tab" aria-selected={mode === "buy"} className={`ms-tab ms-tab--buy ${mode === "buy" ? "is-on" : ""}`} onClick={() => setMode("buy")} data-testid="market-buy-tab">
          <ArrowDownToLine className="h-5 w-5" />
          <span><b>Acheter</b><small>{others} annonce{others > 1 ? "s" : ""} de joueurs</small></span>
        </button>
        <button type="button" role="tab" aria-selected={mode === "sell"} className={`ms-tab ms-tab--sell ${mode === "sell" ? "is-on" : ""}`} onClick={() => setMode("sell")} data-testid="market-sell-tab">
          <ArrowUpFromLine className="h-5 w-5" />
          <span><b>Vendre</b><small>{mine.length}/10 annonces actives</small></span>
        </button>
      </div>

      {mode === "buy" ? (
        <section className="mt-5" data-testid="market-buy-section">
          <div className="panel grid grid-cols-2 gap-3 p-4 md:grid-cols-[1fr_200px_200px]">
            <div className="relative col-span-2 md:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, équipe, numéro, vendeur…" className="lm-input h-11 pl-9" aria-label="Rechercher une carte" data-testid="market-search-input" />
            </div>
            <Select value={rar} onValueChange={setRar}>
              <SelectTrigger className="lm-select h-11" aria-label="Rareté" data-testid="market-rarity-filter"><SelectValue /></SelectTrigger>
              <SelectContent className="lm-pop">
                <SelectItem value="all">Toutes les raretés</SelectItem>
                {RARITIES.map((r, k) => <SelectItem key={r.id} value={String(k)}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="lm-select h-11" aria-label="Tri" data-testid="market-sort-select"><SelectValue /></SelectTrigger>
              <SelectContent className="lm-pop">
                <SelectItem value="asc">Prix croissant</SelectItem>
                <SelectItem value="desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]" data-testid="market-result-count">{results.length} résultat{results.length > 1 ? "s" : ""} · solde {state.cc} CC</p>
          {results.length ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="market-results">
              {results.map((l) => <Listing key={l.id} l={l} owned={state.owned[l.no] ?? 0} onOpen={() => setOpenId(l.id)} />)}
            </div>
          ) : (
            <Empty icon={Search} title="Aucune annonce" text="Essaie un autre nom ou une autre rareté." testId="market-empty" />
          )}
        </section>
      ) : (
        <section className="mt-5 grid gap-8 lg:grid-cols-2" data-testid="market-sell-section">
          <div>
            <h2 className="stat-label mb-3">Tes doublons à vendre</h2>
            {dups.length ? (
              <div className="grid gap-3">
                {dups.map((c) => <SellRow key={c.no} c={c} count={state.owned[c.no]} onSell={sell} full={mine.length >= 10} />)}
              </div>
            ) : (
              <Empty icon={Tag} title="Aucun doublon" text="Seules les cartes en double peuvent être vendues : ton Classeur reste complet." testId="sell-empty">
                <button type="button" className="btn-gold px-5 py-3 text-sm" onClick={() => nav("/ouverture")}>Ouvrir un booster</button>
              </Empty>
            )}
          </div>
          <div>
            <h2 className="stat-label mb-3">Mes annonces · {mine.length}/10</h2>
            {mine.length ? (
              <div className="grid gap-3" data-testid="my-listings">
                {mine.map((l) => <Listing key={l.id} l={l} owned={state.owned[l.no] ?? 0} onOpen={() => setOpenId(l.id)} />)}
              </div>
            ) : (
              <p className="panel p-5 text-sm text-[var(--muted)]" data-testid="my-listings-empty">Aucune annonce active. Fixe un prix à gauche pour publier.</p>
            )}
          </div>
        </section>
      )}

      <ListingDetail
        l={open}
        state={state}
        onClose={() => setOpenId(null)}
        onBuy={buy}
        onUnlist={() => { dispatch({ type: "marketUnlist", id: open.id }); setOpenId(null); toast("Annonce retirée", { description: "La carte revient dans ton Sac." }); }}
      />
    </main>
  );
}
