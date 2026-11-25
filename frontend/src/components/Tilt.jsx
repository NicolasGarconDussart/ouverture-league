import { useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { useReduce } from "../state/game";

export const Tilt = ({ children, max = 10, disabled = false, className = "", ...rest }) => {
  const ref = useRef(null);
  const reduce = useReduce();
  const cfg = { stiffness: 180, damping: 22 };
  const rx = useSpring(0, cfg);
  const ry = useSpring(0, cfg);
  const s = useSpring(1, { stiffness: 260, damping: 18 });
  const off = disabled || reduce;

  const move = (e) => {
    if (off || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width;
    const py = (e.clientY - b.top) / b.height;
    ry.set((px - 0.5) * 2 * max);
    rx.set(-(py - 0.5) * 2 * max);
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    s.set(1);
  };
  const down = (e) => {
    if (off) return;
    s.set(0.95);
    move(e);
    if (e.pointerType === "touch" && navigator.vibrate) navigator.vibrate(8);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt ${className}`}
      style={{ rotateX: rx, rotateY: ry, scale: s, transformPerspective: 1000 }}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerDown={down}
      onPointerUp={() => s.set(1)}
      onPointerCancel={leave}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
