import { useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BoosterCarousel } from "../components/BoosterCarousel";
import { LevelChip } from "../components/LevelChip";
import { OpenPanel } from "../components/OpenPanel";
import { MaskedTitle, Marquee } from "../components/Bits";
import { ASSETS } from "../data/game";
import { useReduce } from "../state/game";

export const SceneArena = (p) => {
  const reduce = useReduce();
  const mx = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const left = useTransform(sx, (v) => v * -18);
  const right = useTransform(sx, (v) => v * 18);

  useEffect(() => {
    if (reduce) return undefined;
    const on = (e) => mx.set(e.clientX / window.innerWidth - 0.5);
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, [reduce, mx]);

  return (
    <main className="scene-arena relative overflow-hidden pb-36" data-testid="scene-arena">
      <span className="arena-beam arena-beam--l" aria-hidden="true" />
      <span className="arena-beam arena-beam--r" aria-hidden="true" />
      <motion.img src={ASSETS.cross} alt="" aria-hidden="true" className="arena-crest arena-crest--l" style={{ x: left }} />
      <motion.img src={ASSETS.aethra} alt="" aria-hidden="true" className="arena-crest arena-crest--r" style={{ x: right }} />

      <div className="arena-grid relative z-[2] mx-auto px-4 pt-4 sm:px-8 lg:pt-8">
        <div className="ag-head">
        <div className="flex items-end justify-between gap-3 lg:flex-col-reverse lg:items-start">
          <div>
            <p className="eyebrow hidden sm:block">Cross League · Arène</p>
            <MaskedTitle lines={["Ouverture"]} className="font-display text-5xl uppercase leading-[0.9] lg:text-6xl" testId="page-title" />
          </div>
          <img src={ASSETS.cross} alt="Cross League" className="h-14 w-auto lg:h-24" />
        </div>
        <LevelChip className="mt-4" />
        </div>

        <section className="ag-stage arena-stage" aria-label="Arène d’ouverture">
          <span className="arena-word" aria-hidden="true">{String(p.index + 1).padStart(2, "0")}</span>
          <span className="arena-floor" aria-hidden="true" />
          <div className="arena-tags">
            <span className="arena-tag"><img src={ASSETS.cross} alt="" /> Cross League</span>
            <span className="arena-tag" data-testid="slide-title">{p.slide.title}</span>
            <span className="arena-tag"><img src={ASSETS.aethra} alt="" /> AETHRA</span>
          </div>
          <div className="relative z-[2] h-full">
            <BoosterCarousel {...p} openingId={p.opening} variant="arena" boosterClass="w-[min(150px,39vw)] sm:w-[210px] lg:w-[260px]" />
          </div>
          <AnimatePresence>
            {p.opening && (
              <motion.span className="open-flash open-flash--silver" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.25, 1] }} transition={{ duration: 1, times: [0, 0.6, 1] }} aria-hidden="true" />
            )}
          </AnimatePresence>
        </section>

        <div className="ag-panel">
          <OpenPanel {...p} variant="arena" />
        </div>
      </div>
      <Marquee className="marquee--led mt-8" items={["Cross League", "AETHRA", "Ouvre", "Collectionne", "Échange", "League Master"]} />
    </main>
  );
};
