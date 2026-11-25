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

export const RECHARGE_MS = 2 * 3600 * 1000;
export const PROFILE = { name: "Kestrel", initials: "K", tag: "Profil démo" };

export const initialState = () => ({
  direction: "table",
  reduced: false,
  cc: 134,
  xp: 394,
  reserve: 3,
  reserveMax: 10,
  nextRechargeAt: Date.now() + (3600 + 47 * 60 + 12) * 1000,
  teamBoosters: 1,
  owned: { 1: 1, 2: 1, 5: 1, 6: 1 },
  claimed: [2],
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
