import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GameCard } from "../components/GameCard";
import { Tilt } from "../components/Tilt";
import { MaskedTitle, Marquee } from "../components/Bits";
import { ASSETS, PROFILE, cardByNo } from "../data/game";

const HERO = [
  { no: 10, rot: -11, x: "-58%", y: 26, z: 1 },
  { no: 22, rot: 0, x: "0%", y: 0, z: 3 },
  { no: 15, rot: 11, x: "58%", y: 26, z: 2 },
];

export default function Accueil() {
  const nav = useNavigate();
  return (
    <main className="home" data-testid="home-page">
      <span className="table-spot home-spot" aria-hidden="true" />
      <div className="relative z-[2] mx-auto grid min-h-[100svh] max-w-7xl items-center gap-4 px-5 pb-20 pt-4 sm:gap-10 sm:px-8 sm:pb-28 sm:pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-16">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-6">
          <img src={ASSETS.logo} alt="League Master" className="h-14 w-auto self-start sm:h-32" />
          <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <img src={ASSETS.cross} alt="" className="h-6 w-auto" /> Univers Cross League · équipe AETHRA
          </span>
          </div>
          <MaskedTitle
            lines={["Ouvre.", "Collectionne.", "Échange."]}
            className="home-title font-display italic"
            delay={0.15}
            testId="home-title"
          />
          <p className="max-w-md text-sm text-[var(--muted)] sm:text-base">
            Ouvre des boosters, révèle les variantes des joueurs Cross League et complète ton classeur, carte après carte.
          </p>
          <div className="flex flex-col gap-3 sm:max-w-md">
            <button type="button" className="btn-gold btn-open w-full py-4" onClick={() => nav("/ouverture")} data-testid="home-enter-button">
              Entrer avec le profil démo <ArrowRight className="h-5 w-5" />
            </button>
            <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Profil fictif « {PROFILE.name} » · aucune connexion · progression gardée dans ce navigateur
            </p>
          </div>
          <dl className="home-facts">
            <div><dt>Variantes AETHRA</dt><dd>120</dd></div>
            <div><dt>Raretés</dt><dd>6</dd></div>
            <div><dt>Finitions</dt><dd>4</dd></div>
          </dl>
        </div>

        <div className="home-fan" aria-label="Cartes AETxTizow">
          <span className="table-pool home-pool" aria-hidden="true" />
          {HERO.map((h, k) => (
            <motion.div
              key={h.no}
              className="home-fan__card"
              style={{ zIndex: h.z }}
              initial={{ opacity: 0, y: 80, rotate: 0, x: "0%" }}
              animate={{ opacity: 1, y: h.y, rotate: h.rot, x: h.x }}
              transition={{ delay: 0.4 + k * 0.12, type: "spring", stiffness: 90, damping: 16 }}
            >
              <Tilt max={10}>
                <GameCard card={cardByNo(h.no)} testId={`home-card-${h.no}`} />
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
      <Marquee className="marquee--engraved home-marquee" items={["Ouvre", "Collectionne", "Échange", "Cross League", "AETHRA", "League Master"]} />
    </main>
  );
}
