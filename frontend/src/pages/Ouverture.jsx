import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/ui/sonner";
import { PRELOAD, preloadImages, wait } from "../data/game";
import { useGame, useReduce } from "../state/game";
import { SceneTable } from "./SceneTable";
import { SceneArena } from "./SceneArena";

const SLIDES = [
  { id: "reserve", kind: "reserve", title: "Réserve gratuite", detail: "Classique Cross League · 5 cartes · montée en rarité" },
  { id: "team", kind: "team", title: "Booster d’équipe AETHRA", detail: "5 cartes AETHRA · montée en rarité" },
  { id: "pro", kind: "pro", title: "Journalier Pro", detail: "10 cartes · un par jour · offre Pro" },
];

export default function Ouverture() {
  const { state, dispatch } = useGame();
  const reduce = useReduce();
  const nav = useNavigate();
  const [index, setIndex] = useState(0);
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    preloadImages(PRELOAD);
  }, []);

  const slide = SLIDES[index];
  const canOpen = slide.kind === "reserve" ? state.reserve > 0 : slide.kind === "team" ? state.teamBoosters > 0 : false;

  const open = async () => {
    if (!canOpen || opening) return;
    setOpening(slide.id);
    await Promise.all([preloadImages(PRELOAD), wait(reduce ? 120 : 1000)]);
    dispatch({ type: "open", source: slide.kind });
    nav("/revelation");
  };
  const pro = () =>
    toast("Journalier Pro · 10 cartes", { description: "L’offre Pro et ses effets seront présentés dans la Boutique, à la deuxième passe." });

  const props = { state, slides: SLIDES, index, setIndex, slide, canOpen, open, pro, opening };
  return state.direction === "arena" ? <SceneArena {...props} /> : <SceneTable {...props} />;
}
