import { createContext, createElement, useContext, useEffect, useReducer } from "react";
import { useReducedMotion } from "framer-motion";
import {
  CARDS, DEMO_DRAW, NEXT_HINTS, OBJECTIVES, OTHER_TEAM_OWNED, PROFILE, PRO_DRAW, PRO_HINTS, PRO_RECHARGE_MS,
  RARITIES, RECHARGE_MS, RESALE, REWARDS, SHOP, cardByNo, initialState, parisDay,
} from "../data/game";

const KEY = "lm-demo-v2";
const Ctx = createContext(null);

export const isPro = (s) => !!s.proUntil && s.proUntil > Date.now();
export const proDailyReady = (s) => isPro(s) && s.proDailyDay !== parisDay();
export const rechargeMs = (s) => (isPro(s) ? PRO_RECHARGE_MS : RECHARGE_MS);
export const tizowOwned = (s) => CARDS.filter((c) => s.owned[c.no]).length;
export const teamOwned = (s) => tizowOwned(s) + OTHER_TEAM_OWNED;
export const duplicates = (s) => CARDS.filter((c) => (s.owned[c.no] ?? 0) > 1);
export const objectiveValue = (s, o) => (o.metric === "opened" ? s.stats.opened : o.metric === "distinct" ? teamOwned(s) : s.stats.resold);

const inc = (owned, no, d) => ({ ...owned, [no]: Math.max(0, (owned[no] ?? 0) + d) });

function reducer(s, a) {
  switch (a.type) {
    case "reduced":
      return { ...s, reduced: a.value };
    case "open": {
      const src = a.source;
      if (src === "reserve" && s.reserve < 1) return s;
      if (src === "team" && s.teamBoosters < 1) return s;
      if (src === "classic" && s.sealedClassic < 1) return s;
      if (src === "pro" && !proDailyReady(s)) return s;
      const ids = src === "pro" ? PRO_DRAW : DEMO_DRAW;
      const owned = { ...s.owned };
      const dupes = [];
      ids.forEach((n) => {
        if (owned[n]) dupes.push(n);
        owned[n] = (owned[n] || 0) + 1;
      });
      const gain = ids.reduce((t, n) => t + RARITIES[cardByNo(n).rarity].xp, 0);
      return {
        ...s,
        owned,
        xp: s.xp + gain,
        reserve: src === "reserve" ? s.reserve - 1 : s.reserve,
        nextRechargeAt: src === "reserve" && s.reserve === s.reserveMax ? Date.now() + rechargeMs(s) : s.nextRechargeAt,
        teamBoosters: src === "team" ? s.teamBoosters - 1 : s.teamBoosters,
        sealedClassic: src === "classic" ? s.sealedClassic - 1 : s.sealedClassic,
        proDailyDay: src === "pro" ? parisDay() : s.proDailyDay,
        stats: { ...s.stats, opened: s.stats.opened + 1 },
        lastDraw: { ids, source: src, xpBefore: s.xp, dupes, gain, hints: src === "pro" ? PRO_HINTS : NEXT_HINTS, at: Date.now() },
      };
    }
    case "recharge": {
      if (s.reserve >= s.reserveMax) return s;
      let { reserve, nextRechargeAt } = s;
      const now = Date.now();
      while (now >= nextRechargeAt && reserve < s.reserveMax) {
        reserve += 1;
        nextRechargeAt += rechargeMs(s);
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
    case "claimObjective": {
      const o = OBJECTIVES.find((x) => x.id === a.id);
      if (!o || s.objectivesClaimed.includes(o.id) || objectiveValue(s, o) < o.target) return s;
      return {
        ...s,
        objectivesClaimed: [...s.objectivesClaimed, o.id],
        cc: o.kind === "cc" ? s.cc + o.amount : s.cc,
        teamBoosters: o.kind === "team" ? s.teamBoosters + 1 : s.teamBoosters,
        sealedClassic: o.kind === "classic" ? s.sealedClassic + 1 : s.sealedClassic,
      };
    }
    case "buy": {
      const it = SHOP[a.item];
      if (s.cc < it.price) return s;
      if (a.item === "pro") {
        if (isPro(s)) return s;
        return { ...s, cc: s.cc - it.price, proUntil: Date.now() + it.days * 864e5, nextRechargeAt: Math.min(s.nextRechargeAt, Date.now() + PRO_RECHARGE_MS) };
      }
      if (s.quota[a.item] < 1) return s;
      return {
        ...s,
        cc: s.cc - it.price,
        quota: { ...s.quota, [a.item]: s.quota[a.item] - 1 },
        sealedClassic: s.sealedClassic + (a.item === "half" ? it.packs : 1),
      };
    }
    case "marketBuy": {
      const l = s.listings.find((x) => x.id === a.id);
      if (!l || l.mine || s.cc < l.price) return s;
      return { ...s, cc: s.cc - l.price, owned: inc(s.owned, l.no, 1), listings: s.listings.filter((x) => x.id !== a.id) };
    }
    case "marketList": {
      if ((s.owned[a.no] ?? 0) < 2 || s.listings.filter((l) => l.mine).length >= 10) return s;
      const l = { id: `M${Date.now()}`, no: a.no, price: a.price, seller: PROFILE.name, mine: true };
      return { ...s, owned: inc(s.owned, a.no, -1), listings: [l, ...s.listings] };
    }
    case "marketUnlist": {
      const l = s.listings.find((x) => x.id === a.id && x.mine);
      if (!l) return s;
      return { ...s, owned: inc(s.owned, l.no, 1), listings: s.listings.filter((x) => x.id !== a.id) };
    }
    case "resell": {
      if ((s.owned[a.no] ?? 0) < 2) return s;
      const v = RESALE[cardByNo(a.no).rarity];
      return { ...s, owned: inc(s.owned, a.no, -1), cc: s.cc + v, stats: { ...s.stats, resold: s.stats.resold + 1, ccEarned: s.stats.ccEarned + v } };
    }
    case "reset":
      return { ...initialState(), reduced: s.reduced };
    default:
      return s;
  }
}

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? { ...initialState(), ...JSON.parse(raw), direction: "table" } : initialState();
    if (s.day !== parisDay()) return { ...s, day: parisDay(), quota: { ...initialState().quota } };
    return s;
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
    document.documentElement.dataset.dir = "table";
    document.documentElement.classList.toggle("reduce-motion", state.reduced);
  }, [state.reduced]);

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

export { RESALE };
