import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const MaskedTitle = ({ lines, className = "", delay = 0, as: Tag = "h1", testId }) => (
  <Tag className={className} aria-label={lines.join(" ")} data-testid={testId}>
    {lines.map((l, i) => (
      <span key={i} className="block overflow-hidden pb-[0.1em]" aria-hidden="true">
        <motion.span
          className="block"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: delay + i * 0.12 }}
        >
          {l}
        </motion.span>
      </span>
    ))}
  </Tag>
);

export const Marquee = ({ items, className = "" }) => (
  <div className={`marquee ${className}`} aria-hidden="true">
    <div className="marquee__track">
      {[0, 1].map((k) => (
        <span key={k} className="marquee__group">
          {items.map((t, i) => (
            <span key={i} className="marquee__item">
              {t}
              <i>✦</i>
            </span>
          ))}
        </span>
      ))}
    </div>
  </div>
);

const fmt = (ms) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const Countdown = ({ to, full, className = "", testId }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className={className} data-testid={testId} aria-live="off">
      {full ? "Pleine" : fmt(to - now)}
    </span>
  );
};

export const Pips = ({ value, max }) => (
  <span className="pips" aria-hidden="true">
    {Array.from({ length: max }, (_, i) => (
      <i key={i} className={i < value ? "on" : ""} />
    ))}
  </span>
);
