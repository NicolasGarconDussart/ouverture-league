import { ASSETS } from "../data/game";

const ALT = {
  reserve: "Booster classique Cross League, 5 cartes",
  team: "Booster d’équipe AETHRA, 5 cartes",
  pro: "Booster journalier Pro, 10 cartes",
};

export const Booster = ({ kind, opening = false, reflect = false, className = "" }) => (
  <div className={`booster booster--${kind} ${opening ? "is-opening" : ""} ${className}`}>
    <div className="booster__body">
      <img src={ASSETS.booster} alt={ALT[kind]} draggable={false} className="booster__img" />
      {kind !== "pro" && <span className="booster__plate">5 CARTES</span>}
      {kind === "team" && (
        <span className="booster__team">
          <img src={ASSETS.aethra} alt="" />
        </span>
      )}
      {kind === "pro" && <span className="booster__pro">PRO · JOURNALIER</span>}
      <span className="booster__glare" aria-hidden="true" />
    </div>
    {reflect && <img src={ASSETS.booster} alt="" aria-hidden="true" className="booster__reflect" draggable={false} />}
  </div>
);
