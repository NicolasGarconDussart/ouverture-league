import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PageHead } from "../components/Bits";
import { PROFILE, RIVALS, TEAM_TOTAL, levelFromXp } from "../data/game";
import { teamOwned, useGame } from "../state/game";

const BOARDS = [
  { id: "completion", label: "Complétion", desc: "Variantes distinctes possédées" },
  { id: "level", label: "Niveau", desc: "Niveau de joueur" },
  { id: "cc", label: "CC gagnés", desc: "CC gagnés en jeu, hors achats" },
];

const fmt = (b, v) => (b === "completion" ? `${((v / TEAM_TOTAL) * 100).toFixed(1).replace(".", ",")} %` : b === "level" ? `Niv. ${v}` : `${v.toLocaleString("fr-FR")} CC`);
const sub = (b, v) => (b === "completion" ? `${v}/${TEAM_TOTAL}` : null);

const Row = ({ e, board, me }) => (
  <li className={`lb-row ${me ? "is-me" : ""}`} data-testid={me ? "leaderboard-me-row" : undefined}>
    <span className="lb-rank">#{e.rank}</span>
    <span className="avatar avatar--sm">{e.name.charAt(0)}</span>
    <span className="min-w-0 flex-1 truncate">{e.name}{me && <em className="lb-you">Toi</em>}</span>
    <span className="text-right">
      <b className="block font-mono text-sm">{fmt(board, e.value)}</b>
      {sub(board, e.value) && <span className="block font-mono text-xs text-[var(--muted)]">{sub(board, e.value)}</span>}
    </span>
  </li>
);

export default function Classements() {
  const { state } = useGame();
  const [board, setBoard] = useState("completion");
  const meValue = board === "completion" ? teamOwned(state) : board === "level" ? levelFromXp(state.xp) : state.stats.ccEarned;

  const { top, me } = useMemo(() => {
    const key = board === "completion" ? "completion" : board === "level" ? "level" : "ccEarned";
    const all = [...RIVALS.map((r) => ({ id: r.id, name: r.name, value: r[key] })), { id: "me", name: PROFILE.name, value: meValue }].sort((a, b) => b.value - a.value || (a.id === "me" ? -1 : 0));
    all.forEach((e, i) => {
      e.rank = i + 1;
    });
    return { top: all.slice(0, 50), me: all.find((e) => e.id === "me") };
  }, [board, meValue]);
  const inTop = me.rank <= 50 && top.some((e) => e.id === "me");
  const total = RIVALS.length + 1;
  const b = BOARDS.find((x) => x.id === board);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-8 lg:pt-10" data-testid="leaderboards-page">
      <PageHead eyebrow="Joueurs League Master" title="Classements" />

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="seg seg--lg" role="tablist" aria-label="Classement">
          {BOARDS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={board === x.id} className={board === x.id ? "is-on" : ""} onClick={() => setBoard(x.id)} data-testid={`board-tab-${x.id}`}>
              {x.label}
            </button>
          ))}
        </div>
        {board === "completion" && (
          <div className="flex flex-col gap-1.5 md:w-56">
            <span className="stat-label">Collection</span>
            <Select value="aethra" onValueChange={() => {}}>
              <SelectTrigger className="lm-select" data-testid="board-collection-select"><SelectValue /></SelectTrigger>
              <SelectContent className="lm-pop"><SelectItem value="aethra">AETHRA</SelectItem></SelectContent>
            </Select>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{b.desc} · {total} joueurs classés</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <aside className="lg:order-2">
          <div className="me-card panel" data-testid="leaderboard-my-rank">
            <span className="stat-label">Ta place · {b.label}</span>
            <p className="me-rank">#{me.rank}</p>
            <p className="font-mono text-lg">{fmt(board, me.value)} {sub(board, me.value) && <span className="text-sm text-[var(--muted)]">· {sub(board, me.value)}</span>}</p>
            <p className="text-sm text-[var(--muted)]">
              {inTop ? "Tu es dans le top 50." : `Hors du top 50 · ${me.rank - 50} places pour y entrer.`}
            </p>
            <p className="text-xs text-[var(--muted)]">Top {Math.max(1, Math.round((me.rank / total) * 100))} % des joueurs</p>
          </div>
        </aside>
        <section className="panel p-3 sm:p-4 lg:order-1" data-testid="leaderboard-list">
          <div className="flex items-center justify-between px-2 pb-3">
            <p className="font-display text-2xl italic">Top 50</p>
            <span className="text-xs text-[var(--muted)]">{b.label}</span>
          </div>
          <ol className="flex flex-col gap-1">
            {top.map((e) => <Row key={e.id} e={e} board={board} me={e.id === "me"} />)}
            {!inTop && (
              <>
                <li className="lb-gap" aria-hidden="true">· · ·</li>
                <Row e={me} board={board} me />
              </>
            )}
          </ol>
        </section>
      </div>
    </main>
  );
}
