import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, RotateCcw } from "lucide-react";
import { GameCard } from "../components/GameCard";
import { Tilt } from "../components/Tilt";
import { MaskedTitle } from "../components/Bits";
import { FINISHES, RARITIES, cardByNo, pad } from "../data/game";
import { useGame } from "../state/game";

export default function Recap() {
  const { state } = useGame();
  const nav = useNavigate();
  const draw = state.lastDraw;
  if (!draw) return <Navigate to="/ouverture" replace />;
  const cards = draw.ids.map(cardByNo);
  const fresh = cards.length - draw.dupes.length;
  const best = RARITIES[Math.max(...cards.map((c) => c.rarity))];

  return (
    <main className="recap mx-auto max-w-6xl px-4 pb-36 pt-6 sm:px-8 lg:pt-10" data-testid="recap-page">
      <p className="eyebrow">Tirage terminé</p>
      <MaskedTitle lines={["Récapitulatif"]} className="font-display text-4xl italic sm:text-5xl lg:text-6xl" testId="page-title" />

      <div className={`${cards.length > 5 ? "recap-grid" : "fan"} mt-8`} data-testid="recap-cards-grid">
        {cards.map((c, k) => (
          <motion.div
            key={`${c.no}-${k}`}
            className="fan-item"
            style={{ "--k": cards.length > 5 ? 0 : k - 2 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + k * 0.08, type: "spring", stiffness: 140, damping: 18 }}
          >
            <div className="fan-rot">
            <Tilt max={8}>
              <GameCard card={c} testId={`recap-card-${pad(c.no)}`} />
            </Tilt>
            <p className="mt-2 text-center text-xs">
              <b style={{ color: RARITIES[c.rarity].color }}>{RARITIES[c.rarity].name}</b>
              <span className="text-[var(--muted)]"> · {FINISHES[c.finish]}</span>
            </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="recap-stats mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="recap-stats">
        <div className="panel p-4"><span className="stat-label">XP gagnés</span><p className="stat-mid">+{draw.gain}</p></div>
        <div className="panel p-4"><span className="stat-label">Nouvelles</span><p className="stat-mid">{fresh}</p></div>
        <div className="panel p-4"><span className="stat-label">Doublons</span><p className="stat-mid">{draw.dupes.length}</p></div>
        <div className="panel p-4"><span className="stat-label">Meilleure</span><p className="stat-mid" style={{ color: best.color }}>{best.name}</p></div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-gold flex-1 py-4" onClick={() => nav("/classeur?tirage=1")} data-testid="recap-view-in-binder-button">
          <BookOpen className="h-5 w-5" /> Retrouver le tirage au Classeur
        </button>
        <button type="button" className="btn-ghost flex-1 py-4" onClick={() => nav("/ouverture")} data-testid="recap-reset-draw-button">
          <RotateCcw className="h-5 w-5" /> Nouvelle ouverture
        </button>
      </div>
    </main>
  );
}
