import { ASSETS, FINISHES, RARITIES, TEAM_TOTAL, pad } from "../data/game";

export const GameCard = ({ card, className = "", testId }) => {
  const r = RARITIES[card.rarity];
  return (
    <div
      data-testid={testId}
      className={`lm-card ${card.rarity === 5 ? "is-unique" : ""} ${className}`}
      style={{ "--r": r.color }}
      data-finish={FINISHES[card.finish]}
    >
      <div className="lm-card__inner">
        <img src={ASSETS.aethra} alt="" className="lm-card__mark" draggable={false} />
        <img src={card.portrait} alt={`Portrait de ${card.player}`} className="lm-card__portrait" draggable={false} />
        <span className="lm-card__fx" aria-hidden="true" />
        <span className="lm-card__glare" aria-hidden="true" />
        <div className="lm-card__top">
          <span className="lm-card__name">{card.player}</span>
          <img src={ASSETS.aethra} alt="AETHRA" className="lm-card__crest" draggable={false} />
        </div>
        <div className="lm-card__bottom">
          <span className="lm-card__role">{card.role}</span>
          <div className="lm-card__meta">
            <span className="lm-card__num">
              {pad(card.no)}/{TEAM_TOTAL}
            </span>
            <span className="lm-card__rar">{r.short}</span>
          </div>
          <span className="lm-card__finish">
            {r.name} · {FINISHES[card.finish]}
          </span>
        </div>
      </div>
    </div>
  );
};

export const CardBack = ({ pulse = false, className = "" }) => (
  <div className={`lm-back ${pulse ? "is-pulse" : ""} ${className}`}>
    <svg viewBox="0 0 100 140" aria-hidden="true">
      <path d="M50 14 L88 70 L50 126 L12 70 Z" />
      <path d="M50 30 L77 70 L50 110 L23 70 Z" />
      <path className="fill" d="M50 52 L56 64 L68 70 L56 76 L50 88 L44 76 L32 70 L44 64 Z" />
    </svg>
  </div>
);

export const Silhouette = ({ card }) => (
  <div className="lm-sil" style={{ "--r": RARITIES[card.rarity].color }}>
    <svg viewBox="0 0 100 140" aria-hidden="true">
      <circle cx="50" cy="56" r="17" />
      <path d="M16 132c2-32 17-50 34-50s32 18 34 50z" />
    </svg>
    <span className="lm-sil__num">{pad(card.no)}</span>
  </div>
);
