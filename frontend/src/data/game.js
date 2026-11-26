export const ASSETS = {
  booster: "/assets/booster.webp",
  tizow: "/assets/tizow.webp",
  tizowUnique: "/assets/tizow-unique.webp",
  aethra: "/assets/aethra.webp",
  cross: "/assets/cross-league.webp",
  logo: "/assets/league-master.webp",
};

export const RARITIES = [
  { id: "C", name: "Commun", short: "C", color: "#AEB8C9", xp: 1 },
  { id: "PC", name: "Peu commun", short: "PC", color: "#3DDC97", xp: 2 },
  { id: "R", name: "Rare", short: "R", color: "#4F8DFF", xp: 4 },
  { id: "E", name: "Épique", short: "E", color: "#B970FF", xp: 8 },
  { id: "L", name: "Légendaire", short: "L", color: "#FF8A3D", xp: 16 },
  { id: "U", name: "Unique", short: "U", color: "#FF6FA8", xp: 32 },
];

export const FINISHES = ["Basique", "Brillant", "Holo", "Infini"];
export const TEAM_TOTAL = 120;
export const OTHER_TEAM_OWNED = 22;

export const CARDS = Array.from({ length: 24 }, (_, i) => {
  const rarity = Math.floor(i / 4);
  return {
    no: i + 1,
    player: "AETxTizow",
    team: "AETHRA",
    role: "Rusher",
    rarity,
    finish: i % 4,
    portrait: rarity === 5 ? ASSETS.tizowUnique : ASSETS.tizow,
  };
});

export const cardByNo = (n) => CARDS[n - 1];
export const pad = (n) => String(n).padStart(3, "0");

export const DEMO_DRAW = [1, 9, 10, 15, 22];
export const NEXT_HINTS = [
  { min: 0, chance: 41 },
  { min: 2, chance: 22 },
  { min: 2, chance: 31, prev: 22 },
  { min: 3, chance: 34, finish: 1 },
];

export const LEVELS = [0, 0, 60, 150, 300, 500, 800, 1200, 1700, 2300];
export const levelFromXp = (xp) => {
  let l = 1;
  for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i;
  return l;
};

export const REWARDS = [
  { level: 2, label: "+20 CC", kind: "cc", amount: 20 },
  { level: 3, label: "Booster d’équipe AETHRA", kind: "team", amount: 1 },
  { level: 4, label: "+50 CC", kind: "cc", amount: 50 },
  { level: 5, label: "Booster d’équipe AETHRA", kind: "team", amount: 1 },
  { level: 6, label: "Cadre de profil Graphite", kind: "cosmetic" },
  { level: 8, label: "+150 CC", kind: "cc", amount: 150 },
];

export const PRO_DRAW = [5, 7, 9, 10, 11, 13, 14, 16, 17, 19];
export const PRO_HINTS = [
  { min: 1, chance: 26 },
  { min: 1, chance: 35, prev: 26 },
  { min: 2, chance: 18 },
  { min: 2, chance: 27, prev: 18 },
  { min: 2, chance: 36, prev: 27 },
  { min: 3, chance: 12 },
  { min: 3, chance: 21, prev: 12 },
  { min: 3, chance: 30, prev: 21 },
  { min: 4, chance: 8, finish: 1 },
];

export const RECHARGE_MS = 2 * 3600 * 1000;
export const PRO_RECHARGE_MS = 5 * 60 * 1000;
export const PROFILE = { name: "Kestrel", initials: "K", tag: "Profil démo" };

export const SHOP = {
  classic: { price: 100, quota: 5 },
  half: { price: 800, quota: 1, packs: 9 },
  pro: { price: 1000, days: 7 },
};
export const RESALE = [2, 4, 8, 20, 60, 200];
export const priceOf = (c) => Math.round([6, 12, 28, 70, 190, 650][c.rarity] * [1, 1.4, 1.9, 2.6][c.finish]);

const SELLERS = ["Orage_7", "MiraLune", "Kaïros", "Brume", "Solstice", "Pixelia", "Nébuleuse", "Vantablack"];
const JITTER = [1.08, 0.94, 1.15, 0.9, 1.02, 1.2, 0.97, 1.1];
export const initialListings = () =>
  [3, 4, 7, 8, 11, 12, 13, 16, 17, 20, 21, 24, 2, 9].map((no, i) => ({
    id: `L${no}`,
    no,
    seller: SELLERS[i % SELLERS.length],
    price: Math.max(3, Math.round(priceOf(cardByNo(no)) * JITTER[i % JITTER.length])),
    mine: false,
  }));

export const OBJECTIVES = [
  { id: "open10", label: "Terminer 10 ouvertures", target: 10, reward: "1 booster classique", kind: "classic", metric: "opened" },
  { id: "own25", label: "Posséder 25 variantes distinctes", target: 25, reward: "1 booster d’équipe AETHRA", kind: "team", metric: "distinct" },
  { id: "resell25", label: "Revendre 25 cartes au jeu", target: 25, reward: "50 CC", kind: "cc", amount: 50, metric: "resold" },
];
export const TEAM_MEMBERS = 5;
export const TEAM_OTHERS = [4, 4, 4, 0, 0, 0];

const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const SYL = ["ka", "ri", "zo", "mi", "lu", "ne", "ta", "vo", "shi", "ra", "ek", "nox", "vel", "dra", "sa", "mo", "tex", "or", "yn", "bel"];
export const RIVALS = Array.from({ length: 240 }, (_, i) => {
  const r = rng(i * 7919 + 13);
  const base = SYL[Math.floor(r() * SYL.length)] + SYL[Math.floor(r() * SYL.length)] + (r() < 0.5 ? SYL[Math.floor(r() * SYL.length)] : "");
  const name = base.charAt(0).toUpperCase() + base.slice(1) + (r() < 0.45 ? `_${Math.floor(r() * 99)}` : "");
  return {
    id: `r${i}`,
    name,
    completion: Math.floor(Math.pow(r(), 3.5) * 55),
    level: 1 + Math.floor(Math.pow(r(), 1.2) * 28),
    ccEarned: Math.floor(Math.pow(r(), 1.6) * 42000),
  };
});

export const parisDay = (t = Date.now()) => new Date(t).toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });

export const initialState = () => ({
  direction: "table",
  reduced: false,
  cc: 1250,
  xp: 394,
  reserve: 3,
  reserveMax: 10,
  nextRechargeAt: Date.now() + (3600 + 47 * 60 + 12) * 1000,
  teamBoosters: 1,
  sealedClassic: 0,
  owned: { 1: 1, 2: 2, 5: 1, 6: 1 },
  claimed: [2],
  objectivesClaimed: [],
  stats: { opened: 9, resold: 0, ccEarned: 1840 },
  quota: { classic: 5, half: 1 },
  day: parisDay(),
  proUntil: null,
  proDailyDay: null,
  listings: initialListings(),
  lastDraw: null,
});

export const PRELOAD = [ASSETS.tizow, ASSETS.tizowUnique, ASSETS.aethra, ASSETS.logo];
export const preloadImages = (srcs) =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = img.onerror = () => res();
          img.src = src;
        }),
    ),
  );
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
