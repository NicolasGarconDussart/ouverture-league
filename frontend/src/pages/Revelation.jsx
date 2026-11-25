import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FastForward, RotateCw, Sparkles } from "lucide-react";
import { GameCard, CardBack } from "../components/GameCard";
import { Tilt } from "../components/Tilt";
import { FINISHES, LEVELS, NEXT_HINTS, RARITIES, cardByNo, levelFromXp, pad } from "../data/game";
import { useGame, useReduce } from "../state/game";

const Burst = () => (
  <span className="burst" aria-hidden="true">
    {Array.from({ length: 16 }, (_, k) => (
      <motion.i
        key={k}
        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        animate={{ opacity: 0, x: Math.cos((k / 16) * Math.PI * 2) * 190, y: Math.sin((k / 16) * Math.PI * 2) * 190, scale: 0.3 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    ))}
    <motion.b initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ duration: 1 }} />
  </span>
);

const Flip = ({ card, flipped, onFlip }) => (
  <button type="button" className="flip" onClick={onFlip} disabled={flipped} aria-label={flipped ? "Carte retournée" : "Retourner la dernière carte"} data-testid="reveal-flip-card-action">
    <motion.span className="flip__inner" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.95, ease: [0.3, 0.7, 0.2, 1] }}>
      <span className="flip__face"><CardBack pulse={!flipped} /></span>
      <span className="flip__face flip__face--back"><GameCard card={card} /></span>
    </motion.span>
  </button>
);

const Hint = ({ i, hidden }) => {
  const h = NEXT_HINTS[i];
  if (hidden) return <p className="text-sm text-[var(--ink)]" data-testid="reveal-last-hint">La dernière carte est au moins <b>Brillante</b>. Retourne-la quand tu veux.</p>;
  if (!h) return <p className="text-sm text-[var(--muted)]" data-testid="reveal-done-hint">Tirage complet. Tout est rangé au Classeur.</p>;
  const r = RARITIES[h.min];
  return (
    <div className="hint" data-testid="reveal-upgrade-chance-stat">
      <span className="stat-label">Prochaine carte</span>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>Minimum garanti <b style={{ color: r.color }}>{r.name}</b></span>
        {h.finish && <span>Finition <b>{FINISHES[h.finish]}</b> ou mieux</span>}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="chance-bar" style={{ "--c": r.color }}><span style={{ width: `${h.chance}%` }} />{h.prev && <em style={{ left: `${h.prev}%` }} />}</div>
        <span className="font-mono text-sm font-semibold" data-testid="reveal-upgrade-chance-value">{h.chance} %</span>
      </div>
      <p className="mt-1.5 text-xs text-[var(--muted)]">
        Chance de dépasser {r.name}
        {h.prev && <> · <b className="text-[var(--ink)]">{h.prev} % → {h.chance} %</b> à minimum égal</>}
      </p>
    </div>
  );
};

export default function Revelation() {
  const { state } = useGame();
  const reduce = useReduce();
  const nav = useNavigate();
  const draw = state.lastDraw;
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = draw ? draw.ids.map(cardByNo) : [];
  const last = cards.length - 1;
  const hidden = i === last && !flipped;

  const primary = useCallback(() => {
    if (!draw) return;
    if (hidden) setFlipped(true);
    else if (i < last) setI(i + 1);
    else nav("/recap");
  }, [draw, hidden, i, last, nav]);

  useEffect(() => {
    const on = (e) => {
      const tag = e.target?.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return;
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); primary(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [primary]);

  if (!draw) return <Navigate to="/" replace />;

  const card = cards[i];
  const r = RARITIES[card.rarity];
  const shown = hidden ? i : i + 1;
  const xpNow = draw.xpBefore + cards.slice(0, shown).reduce((t, c) => t + RARITIES[c.rarity].xp, 0);
  const lvl = levelFromXp(xpNow);
  const target = LEVELS[lvl + 1];
  const dupe = draw.dupes.includes(card.no);
  const arena = state.direction === "arena";
  const label = hidden ? "Retourner la dernière carte" : i < last ? "Carte suivante" : "Voir le récapitulatif";

  return (
    <main
      className={`reveal ${arena ? "reveal--arena" : "reveal--table"}`}
      style={{ "--r": hidden ? "#E9B949" : r.color, "--glow": hidden ? 0.35 : 0.25 + card.rarity * 0.13 }}
      data-rarity={hidden ? "hidden" : r.id}
      data-testid="reveal-page"
    >
      <span className="reveal-light" aria-hidden="true" />
      {card.rarity >= 3 && !hidden && <span className="reveal-rays" aria-hidden="true" />}
      {arena && <span className="reveal-word" aria-hidden="true">{hidden ? "???" : r.name}</span>}

      <div className="relative z-[2] mx-auto flex max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-8 lg:pt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow hidden sm:block">{draw.source === "team" ? "Booster d’équipe AETHRA" : "Classique Cross League"} · 5 cartes</p>
            <h1 className="font-display text-2xl sm:text-4xl" data-testid="reveal-counter">
              Carte {String(i + 1).padStart(2, "0")} <span className="text-[var(--muted)]">/ {String(cards.length).padStart(2, "0")}</span>
            </h1>
          </div>
          <button type="button" className="btn-ghost px-3 py-2 text-xs" onClick={() => nav("/recap")} data-testid="reveal-skip-all-button">
            <FastForward className="h-4 w-4" /> Récap
          </button>
        </div>

        <div className="mt-3 flex gap-1.5" aria-hidden="true" data-testid="reveal-pips">
          {cards.map((c, k) => (
            <i key={k} className={`pip ${k === i ? "is-cur" : ""}`} style={{ "--p": k < i || (k === i && !hidden) ? RARITIES[c.rarity].color : "rgba(255,255,255,.14)" }} />
          ))}
        </div>

        <div className="reveal-grid mt-4 lg:mt-8">
          <div className="reveal-stage-wrap">
            <div className="reveal-stage" data-testid="card-reveal-stage">
              {Array.from({ length: Math.min(3, last - i) }, (_, k) => (
                <span key={k} className="stack-back" style={{ transform: `translate(${(k + 1) * 6}px, ${(k + 1) * 3}px) rotate(${(k + 1) * 1.8}deg)`, zIndex: -k - 1 }}>
                  <CardBack />
                </span>
              ))}
              <AnimatePresence initial={false}>
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 40, rotateY: -35, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -160, rotate: -12, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  style={{ transformPerspective: 1000 }}
                >
                  {i === last ? (
                    <Flip card={card} flipped={flipped} onFlip={() => setFlipped(true)} />
                  ) : (
                    <Tilt max={9} className="h-full w-full cursor-pointer" onClick={primary} data-testid="reveal-current-card">
                      <GameCard card={card} />
                    </Tilt>
                  )}
                </motion.div>
              </AnimatePresence>
              {flipped && !reduce && <Burst />}
            </div>
          </div>

          <aside className="reveal-info panel" aria-live="polite" data-testid="reveal-info">
            {hidden ? (
              <div>
                <span className="stat-label">Dernière carte · face cachée</span>
                <p className="mt-2 font-display text-xl sm:text-2xl">Le meilleur pour la fin.</p>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`tag ${dupe ? "" : "tag--new"}`} data-testid="reveal-status-tag">{dupe ? `Doublon · ×${state.owned[card.no] ?? 2}` : "Nouvelle"}</span>
                  <span className="tag hidden font-mono sm:inline">{pad(card.no)}/120</span>
                  <span className="text-sm sm:hidden"><b style={{ color: r.color }}>{r.name}</b> · {FINISHES[card.finish]}</span>
                </div>
                <p className="mt-2 font-display text-xl sm:mt-3 sm:text-3xl" data-testid="reveal-card-name">{card.player}</p>
                <p className="mt-1 hidden text-sm sm:block">
                  <b style={{ color: r.color }} data-testid="reveal-card-rarity">{r.name}</b> · {FINISHES[card.finish]}
                </p>
              </div>
            )}

            <div className="xp-block">
              {!hidden && (
                <motion.span key={`xp-${i}`} className="xp-gain" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} data-testid="reveal-xp-gain-badge">
                  +{r.xp} XP
                </motion.span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Niveau {lvl}</span>
                  <span className="font-mono" data-testid="reveal-xp-total">{xpNow} / {target} XP</span>
                </div>
                <div className="xpbar mt-1.5"><span style={{ width: `${((xpNow - LEVELS[lvl]) / (target - LEVELS[lvl])) * 100}%` }} /></div>
              </div>
            </div>

            <Hint i={i} hidden={hidden} />

            <button type="button" className="btn-gold w-full py-4" onClick={primary} data-testid="reveal-next-card-button">
              {hidden ? <RotateCw className="h-5 w-5" /> : i < last ? <ArrowRight className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              {label}
            </button>
            <p className="hidden text-center text-xs text-[var(--muted)] sm:block">Espace, Entrée ou → pour avancer · touche la carte</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
