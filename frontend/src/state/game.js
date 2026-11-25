import { createContext, createElement, useContext, useEffect, useReducer } from "react";
import { useReducedMotion } from "framer-motion";
import { DEMO_DRAW, RARITIES, RECHARGE_MS, REWARDS, cardByNo, initialState } from "../data/game";

const KEY = "lm-demo-v1";
const Ctx = createContext(null);

function reducer(s, a) {
  switch (a.type) {
    case "direction":
      return { ...s, direction: a.value };
    case "reduced":
      return { ...s, reduced: a.value };
    case "open": {
      if (a.source === "reserve" && s.reserve < 1) return s;
      if (a.source === "team" && s.teamBoosters < 1) return s;
      const owned = { ...s.owned };
      const dupes = [];
      DEMO_DRAW.forEach((n) => {
        if (owned[n]) dupes.push(n);
        owned[n] = (owned[n] || 0) + 1;
      });
      const gain = DEMO_DRAW.reduce((t, n) => t + RARITIES[cardByNo(n).rarity].xp, 0);
      const fromReserve = a.source === "reserve";
      return {
        ...s,
        owned,
        xp: s.xp + gain,
        reserve: fromReserve ? s.reserve - 1 : s.reserve,
        nextRechargeAt: fromReserve && s.reserve === s.reserveMax ? Date.now() + RECHARGE_MS : s.nextRechargeAt,
        teamBoosters: a.source === "team" ? s.teamBoosters - 1 : s.teamBoosters,
        lastDraw: { ids: DEMO_DRAW, source: a.source, xpBefore: s.xp, dupes, gain, at: Date.now() },
      };
    }
    case "recharge": {
      if (s.reserve >= s.reserveMax) return s;
      let { reserve, nextRechargeAt } = s;
      const now = Date.now();
      while (now >= nextRechargeAt && reserve < s.reserveMax) {
        reserve += 1;
        nextRechargeAt += RECHARGE_MS;
      }
      return { ...s, reserve, nextRechargeAt };
    }
    case "claim": {
      const r = REWARDS.find((x) => x.level === a.level);
      if (!r || s.claimed.includes(r.level)) return s;
      return {
        ...s,
        claimed: [...s.claimed, r.level],
        cc: r.kind === "cc" ? s.cc + r.amount : s.cc,
        teamBoosters: r.kind === "team" ? s.teamBoosters + r.amount : s.teamBoosters,
      };
    }
    case "reset":
      return { ...initialState(), direction: s.direction, reduced: s.reduced };
    default:
      return s;
  }
}

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
  } catch {
    return initialState();
  }
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.dir = state.direction;
    document.documentElement.classList.toggle("reduce-motion", state.reduced);
  }, [state.direction, state.reduced]);

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() >= state.nextRechargeAt && state.reserve < state.reserveMax) dispatch({ type: "recharge" });
    }, 1000);
    return () => clearInterval(t);
  }, [state.nextRechargeAt, state.reserve, state.reserveMax]);

  return createElement(Ctx.Provider, { value: { state, dispatch } }, children);
}

export const useGame = () => useContext(Ctx);

export const useReduce = () => {
  const { state } = useGame();
  const sys = useReducedMotion();
  return state.reduced || !!sys;
};
