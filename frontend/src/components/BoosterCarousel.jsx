import { useEffect, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tilt } from "./Tilt";
import { Booster } from "./Booster";

const useNarrow = () => {
  const [n, setN] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const on = () => setN(window.innerWidth < 640);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return n;
};

export const BoosterCarousel = ({ slides, index, setIndex, openingId, variant, boosterClass = "" }) => {
  const panX = useMotionValue(0);
  const narrow = useNarrow();
  const W = narrow ? 68 : variant === "arena" ? 50 : 44;
  const go = (d) => setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + d)));
  const spring = { type: "spring", stiffness: 220, damping: 28 };

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };

  return (
    <div className="relative h-full w-full select-none">
      <div
        role="group"
        aria-roledescription="carrousel"
        aria-label="Boosters disponibles, flèches gauche et droite pour changer"
        tabIndex={0}
        onKeyDown={onKey}
        data-testid="booster-carousel"
        className="carousel-viewport h-full overflow-hidden outline-none"
        style={{ touchAction: "pan-y" }}
      >
        <motion.div
          className="h-full"
          style={{ x: panX }}
          onPan={(e, i) => panX.set(i.offset.x * 0.45)}
          onPanEnd={(e, i) => {
            if (i.offset.x < -50 || i.velocity.x < -500) go(1);
            else if (i.offset.x > 50 || i.velocity.x > 500) go(-1);
            animate(panX, 0, spring);
          }}
        >
          <motion.div className="flex h-full items-center" animate={{ x: `${(100 - W) / 2 - index * W}%` }} transition={spring}>
            {slides.map((s, i) => (
              <motion.div
                key={s.id}
                style={{ width: `${W}%` }}
                className="flex shrink-0 justify-center"
                animate={{ scale: i === index ? 1 : 0.74, opacity: i === index ? 1 : 0.38 }}
                transition={spring}
                onClick={() => i !== index && setIndex(i)}
                aria-hidden={i !== index}
                data-testid={`booster-slide-${s.id}`}
              >
                <Tilt disabled={i !== index} max={12} data-testid={i === index ? "booster-card-interactive" : undefined}>
                  <Booster kind={s.kind} opening={openingId === s.id} reflect={variant === "arena"} className={boosterClass} />
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <button type="button" aria-label="Booster précédent" data-testid="booster-carousel-prev" disabled={index === 0} onClick={() => go(-1)} className="car-arrow left-2 sm:left-4">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Booster suivant" data-testid="booster-carousel-next" disabled={index === slides.length - 1} onClick={() => go(1)} className="car-arrow right-2 sm:right-4">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="car-dots" role="tablist" aria-label="Choix du booster">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.title}
            data-testid={`booster-dot-${s.id}`}
            onClick={() => setIndex(i)}
            className={`car-dot ${i === index ? "is-on" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};
