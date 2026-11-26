import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, Crown, Gift, Lock, Sparkles, Tv } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { Booster } from "../components/Booster";
import { Tilt } from "../components/Tilt";
import { PageHead } from "../components/Bits";
import { ASSETS, SHOP, TEAM_TOTAL } from "../data/game";
import { isPro, teamOwned, useGame } from "../state/game";

const PackBox = ({ count, rows = 1, label }) => {
  const perRow = Math.ceil(count / rows);
  return (
    <div className="pack-box" style={{ "--per": perRow }} aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className={`pack-box__row ${r < rows - 1 ? "is-back" : ""}`} style={{ "--row": r }}>
          {Array.from({ length: perRow }, (_, i) => (
            <Booster key={i} kind="reserve" className="pack-box__pack" />
          ))}
        </div>
      ))}
      <span className="pack-box__lip">{label}</span>
    </div>
  );
};

const Product = ({ id, title, desc, visual, price, quota, action, note, testId }) => (
  <article className="product panel" data-testid={testId} id={id}>
    <div className="product__stage">{visual}</div>
    <div className="flex flex-1 flex-col gap-2 p-5">
      <h2 className="font-display text-2xl italic">{title}</h2>
      <p className="text-sm text-[var(--muted)]">{desc}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div>
          {price && <p className="font-mono text-2xl font-bold text-[var(--gold-hi)]">{price}</p>}
          {quota && <p className="text-xs text-[var(--muted)]">{quota}</p>}
          {note && <p className="text-xs text-[var(--muted)]">{note}</p>}
        </div>
        {action}
      </div>
    </div>
  </article>
);

export default function Boutique() {
  const { state, dispatch } = useGame();
  const nav = useNavigate();
  const pro = isPro(state);

  useEffect(() => {
    if (window.location.hash !== "#pro") return undefined;
    const t = setTimeout(() => {
      const el = document.getElementById("pro");
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView();
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const buy = (item, label) => {
    dispatch({ type: "buy", item });
    toast.success(`${label} acheté`, {
      description: item === "pro" ? "Réserve accélérée et journalier Pro débloqués." : "Rangé dans le Sac, prêt à ouvrir.",
      action: { label: item === "pro" ? "Ouverture" : "Voir le Sac", onClick: () => nav(item === "pro" ? "/ouverture?booster=pro" : "/sac") },
    });
  };

  const BuyBtn = ({ item, label, quotaLeft }) => {
    const poor = state.cc < SHOP[item].price;
    const out = quotaLeft !== undefined && quotaLeft < 1;
    return (
      <div className="flex flex-col items-end gap-1">
        <button type="button" className="btn-gold px-5 py-3 text-sm" disabled={poor || out} onClick={() => buy(item, label)} data-testid={`buy-${item}-button`}>
          Acheter
        </button>
        {(poor || out) && <span className="text-xs text-[var(--muted)]">{out ? "Quota du jour atteint" : "Solde insuffisant"}</span>}
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="shop-page">
      <PageHead eyebrow="Produits officiels" title="Boutique" />

      <section className="shop-hero mt-6" data-testid="shop-hero">
        <span className="table-spot" aria-hidden="true" />
        <div className="relative z-[2] flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <img src={ASSETS.cross} alt="Cross League" className="h-20 w-auto sm:h-28" />
            <div>
              <p className="font-display text-3xl italic sm:text-5xl">Cross League</p>
              <p className="text-sm text-[var(--muted)]">Collection AETHRA</p>
            </div>
          </div>
          <div className="max-w-md">
            <p className="font-mono text-sm">{teamOwned(state)} / {TEAM_TOTAL} variantes possédées</p>
            <div className="xpbar mt-2"><span style={{ width: `${(teamOwned(state) / TEAM_TOTAL) * 100}%` }} /></div>
          </div>
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]"><Clock className="h-4 w-4" /> Renouvellement des quotas à 00 h 00 (Europe/Paris).</p>
        </div>
        <Tilt max={10} className="shop-hero__pack relative z-[2]">
          <Booster kind="reserve" className="w-[150px] sm:w-[210px]" />
        </Tilt>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.25fr_1.5fr]">
        <Product
          testId="product-classic"
          title="Booster classique"
          desc="5 cartes · montée en rareté · 5ᵉ carte Brillante ou mieux."
          visual={<Booster kind="reserve" className="w-[104px]" />}
          price={`${SHOP.classic.price} CC`}
          quota={`Quota du jour · ${state.quota.classic}/${SHOP.classic.quota}`}
          action={<BuyBtn item="classic" label="Booster classique" quotaLeft={state.quota.classic} />}
        />
        <Product
          testId="product-half"
          title="Demi-display"
          desc="9 pochettes de 5 cartes · au moins une Épique sur le display."
          visual={<PackBox count={9} label="DEMI-DISPLAY · 9" />}
          price={`${SHOP.half.price} CC`}
          quota={`Quota du jour · ${state.quota.half}/${SHOP.half.quota}`}
          action={<BuyBtn item="half" label="Demi-display" quotaLeft={state.quota.half} />}
        />
        <Product
          testId="product-full"
          title="Display complet Cross League"
          desc="18 pochettes de 5 cartes · une Légendaire ou mieux garantie."
          visual={<PackBox count={18} rows={2} label="DISPLAY COMPLET · 18" />}
          note="Lot exclusif, non vendu en CC."
          action={<span className="twitch-tag" data-testid="product-full-twitch"><Tv className="h-4 w-4" /> À gagner sur Twitch</span>}
        />
      </div>

      <section id="pro" className={`pro-panel mt-8 ${pro ? "is-active" : ""}`} data-testid="pro-panel">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pro-badge"><Crown className="h-4 w-4" /> Pro</span>
            <span className={`tag ${pro ? "tag--new" : ""}`} data-testid="pro-state">{pro ? `Actif jusqu’au ${new Date(state.proUntil).toLocaleDateString("fr-FR")}` : "Inactif"}</span>
          </div>
          <h2 className="font-display text-3xl italic sm:text-4xl">Plus de boosters, chaque jour.</h2>
          <p className="max-w-lg text-sm text-[var(--muted)]">7 jours, renouvellement manuel. Les effets s’appliquent tout de suite à la réserve et à l’Ouverture.</p>
        </div>
        <ul className="pro-effects">
          <li>
            <span className="stat-label">Réserve gratuite</span>
            <p><s>+1 toutes les 2 h</s> <b>+1 toutes les 5 min</b></p>
            <p className="text-xs text-[var(--muted)]">Jusqu’à 10 en réserve.</p>
          </li>
          <li>
            <span className="stat-label">Journalier Pro</span>
            <p><b>10 cartes chaque jour</b></p>
            <p className="text-xs text-[var(--muted)]">En plus de la réserve · première carte Peu commune ou Rare.</p>
          </li>
        </ul>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="font-mono text-3xl font-bold text-[var(--gold-hi)]">{SHOP.pro.price.toLocaleString("fr-FR")} CC</p>
          {pro ? (
            <button type="button" className="btn-gold px-6 py-3.5" onClick={() => nav("/ouverture?booster=pro")} data-testid="pro-go-open-button">
              <Sparkles className="h-4 w-4" /> Aller au journalier
            </button>
          ) : (
            <button type="button" className="btn-gold px-6 py-3.5" disabled={state.cc < SHOP.pro.price} onClick={() => buy("pro", "Pro · 7 jours")} data-testid="buy-pro-button">
              {state.cc < SHOP.pro.price ? <Lock className="h-4 w-4" /> : <Gift className="h-4 w-4" />} Activer Pro
            </button>
          )}
          {!pro && state.cc < SHOP.pro.price && <span className="text-xs text-[var(--muted)]">Solde insuffisant</span>}
          {pro && <span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Check className="h-3.5 w-3.5" /> Effets actifs</span>}
        </div>
      </section>
    </main>
  );
}
