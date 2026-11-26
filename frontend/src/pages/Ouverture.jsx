import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PRELOAD, preloadImages, wait } from "../data/game";
import { proDailyReady, useGame, useReduce } from "../state/game";
import { SceneTable } from "./SceneTable";

const SL = {
  reserve: { id: "reserve", kind: "reserve", title: "Réserve gratuite", detail: "Classique Cross League · 5 cartes · montée en rareté" },
  team: { id: "team", kind: "team", title: "Booster d’équipe AETHRA", detail: "5 cartes AETHRA · montée en rareté" },
  classic: { id: "classic", kind: "classic", title: "Boosters scellés", detail: "Achetés en Boutique · 5 cartes · montée en rareté" },
  pro: { id: "pro", kind: "pro", title: "Journalier Pro", detail: "10 cartes · un par jour · première carte Peu commune ou Rare" },
};

export default function Ouverture() {
  const { state, dispatch } = useGame();
  const reduce = useReduce();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const slides = [SL.reserve, SL.team, ...(state.sealedClassic > 0 ? [SL.classic] : []), SL.pro];
  const [index, setIndex] = useState(() => Math.max(0, slides.findIndex((s) => s.id === params.get("booster"))));
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    preloadImages(PRELOAD);
  }, []);

  const idx = Math.min(index, slides.length - 1);
  const slide = slides[idx];
  const canOpen =
    slide.kind === "reserve" ? state.reserve > 0
      : slide.kind === "team" ? state.teamBoosters > 0
        : slide.kind === "classic" ? state.sealedClassic > 0
          : proDailyReady(state);

  const open = async () => {
    if (!canOpen || opening) return;
    setOpening(slide.id);
    await Promise.all([preloadImages(PRELOAD), wait(reduce ? 120 : 1000)]);
    dispatch({ type: "open", source: slide.kind });
    nav("/revelation");
  };
  const pro = () => nav("/boutique#pro");

  return <SceneTable state={state} slides={slides} index={idx} setIndex={setIndex} slide={slide} canOpen={canOpen} open={open} pro={pro} opening={opening} />;
}
