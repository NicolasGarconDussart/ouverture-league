import { AnimatePresence, motion } from "framer-motion";
import { BoosterCarousel } from "../components/BoosterCarousel";
import { LevelChip } from "../components/LevelChip";
import { OpenPanel } from "../components/OpenPanel";
import { MaskedTitle, Marquee } from "../components/Bits";

export const SceneTable = (p) => (
  <main className="scene-table mx-auto max-w-7xl px-4 pb-36 pt-4 sm:px-8 lg:pt-10" data-testid="scene-table">
    <div className="st-head flex flex-col gap-4">
      <div>
        <p className="eyebrow hidden sm:block">Cross League · Collection AETHRA</p>
        <MaskedTitle lines={["Ouverture"]} className="font-display text-4xl italic leading-none sm:text-5xl lg:text-6xl" testId="page-title" />
        <p className="mt-3 hidden max-w-sm text-sm text-[var(--muted)] lg:block">
          Glisse entre les boosters, incline-les du bout du doigt ou de la souris, puis ouvre quand tu es prêt.
        </p>
      </div>
      <LevelChip />
    </div>

    <section className="st-stage table-stage" aria-label="Table d’ouverture">
      <span className="table-spot" aria-hidden="true" />
      <span className="table-pool" aria-hidden="true" />
      <div className="relative z-[2] flex h-full flex-col">
        <div className="flex items-center justify-between px-5 pt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          <span data-testid="slide-title" className="text-[var(--ink)]">{p.slide.title}</span>
          <span className="font-mono">{String(p.index + 1).padStart(2, "0")} / 03</span>
        </div>
        <div className="min-h-0 flex-1">
          <BoosterCarousel {...p} openingId={p.opening} variant="table" boosterClass="w-[min(160px,41vw)] sm:w-[220px] lg:w-[250px]" />
        </div>
        <Marquee className="marquee--engraved" items={["Ouvre", "Collectionne", "Échange", "Cross League", "AETHRA"]} />
      </div>
      <AnimatePresence>
        {p.opening && (
          <motion.span className="open-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.2, 1] }} transition={{ duration: 1, times: [0, 0.6, 1] }} aria-hidden="true" />
        )}
      </AnimatePresence>
    </section>

    <div className="st-panel">
      <OpenPanel {...p} variant="table" />
    </div>
  </main>
);
