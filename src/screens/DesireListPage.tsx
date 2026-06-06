import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, HeartHandshake, QrCode, Sparkles, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { cn, formatPercent } from "../lib/utils";
import {
  APP_NAME,
  CATEGORIES,
  SCRIPTURE,
  SCRIPTURE_REF,
  STAGES,
  discussion,
  type DesireStage,
} from "./desire-list/data";
import {
  personalAnalysis,
  stageCategoryPercents,
  stageCounts,
  statsForSelections,
  type Selections,
} from "./desire-list/logic";
import { buildJoinUrl, usePeerRoom, type DesireRoom } from "./desire-list/usePeerRoom";

export function DesireListPage() {
  const { join } = useSearch({ from: "/games/desire-list" });
  const joinHostId = join ?? "";
  const room = usePeerRoom();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (joinHostId && !hasStarted) {
      setHasStarted(true);
    }
  }, [hasStarted, joinHostId]);

  return (
    <section className="desire-page">
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>
      <header className="desire-header">
        <span className="desire-pill">
          <HeartHandshake aria-hidden="true" size={18} />
          八福互動 · 多人連線
        </span>
        <h1>{APP_NAME}</h1>
        <p>
          走過學生、青年、成人三個人生階段。每階段只能保留有限的渴望，最後一起看見選擇如何改變。
        </p>
      </header>

      {!hasStarted && !joinHostId ? (
        <Landing room={room} onHost={() => setHasStarted(true)} />
      ) : room.role === "host" ? (
        <HostView room={room} />
      ) : (
        <PlayerView room={room} joinHostId={joinHostId} />
      )}

      <footer className="desire-scripture-footer">
        {SCRIPTURE} - {SCRIPTURE_REF}
      </footer>
    </section>
  );
}

function Scripture({ children = SCRIPTURE }: { children?: string }) {
  return (
    <Card className="desire-scripture-card">
      <p>「{children}」</p>
      <small>{SCRIPTURE_REF}</small>
    </Card>
  );
}

function Landing({ room, onHost }: { room: DesireRoom; onHost: () => void }) {
  return (
    <div className="desire-landing-grid">
      <Card className="desire-panel">
        <div className="icon-badge">
          <Users aria-hidden="true" size={26} />
        </div>
        <h2>建立主持人房間</h2>
        <p>產生房間 QR code，玩家用手機掃描加入。主持人本身也會列入填答者。</p>
        <Button
          size="lg"
          onClick={() => {
            room.setupHost("主持人");
            onHost();
          }}
        >
          建立房間
        </Button>
      </Card>
      <Card className="desire-panel">
        <div className="icon-badge amber">
          <QrCode aria-hidden="true" size={26} />
        </div>
        <h2>輸入代碼加入</h2>
        <p>若已有主持人提供的連線代碼，可直接輸入加入，或掃描主持人畫面的 QR code。</p>
        <JoinByCode room={room} />
      </Card>
    </div>
  );
}

function JoinByCode({ room }: { room: DesireRoom }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="desire-form-stack">
      <Input
        value={code}
        placeholder="主持人連線代碼"
        onChange={(event) => setCode(event.target.value)}
      />
      <Input
        value={name}
        maxLength={16}
        placeholder="你的暱稱"
        onChange={(event) => setName(event.target.value)}
      />
      <Button
        variant="secondary"
        disabled={!code.trim() || !name.trim()}
        onClick={() => room.joinRoom(code.trim(), name.trim())}
      >
        加入房間
      </Button>
      {room.error ? <p className="error-text">{room.error}</p> : null}
    </div>
  );
}

function HostView({ room }: { room: DesireRoom }) {
  if (room.phase === "lobby") {
    return <HostLobby room={room} />;
  }
  if (room.phase === "playing") {
    return <HostPlaying room={room} />;
  }
  if (room.phase === "reveal") {
    return <HostReveal room={room} />;
  }
  return <HostResult room={room} />;
}

function HostLobby({ room }: { room: DesireRoom }) {
  const players = Object.values(room.players);
  const joinUrl = room.hostId ? buildJoinUrl(room.hostId) : "";

  return (
    <div className="desire-host-grid">
      <Card className="desire-panel">
        <p className="eyebrow">主持人模式 · 也是填答者</p>
        <h2>建立遊戲房間</h2>
        <div className="desire-field-grid">
          <label className="field">
            <span>主持人暱稱</span>
            <Input
              defaultValue={room.nickname}
              maxLength={16}
              onChange={(event) => room.setHostNickname(event.target.value)}
            />
          </label>
          <label className="field">
            <span>每階段可選項目數</span>
            <select
              className="input"
              value={room.config.pickCount}
              onChange={(event) => room.updateConfig({ pickCount: Number(event.target.value) })}
            >
              <option value="3">3 項</option>
              <option value="4">4 項</option>
              <option value="5">5 項（預設）</option>
              <option value="6">6 項</option>
            </select>
          </label>
        </div>
        {room.error ? <p className="error-text">{room.error}</p> : null}
        <div className="host-actions">
          <Button onClick={room.startGame}>開始三階段旅程</Button>
          <Button variant="secondary" onClick={room.addDemoPlayers}>
            加入示範玩家
          </Button>
        </div>
        <PlayerChips players={players} />
      </Card>
      <Card className="desire-qr-card">
        <h3>掃描加入</h3>
        <div className="qr-frame">
          {joinUrl ? <QRCodeSVG value={joinUrl} size={190} marginSize={3} /> : null}
        </div>
        <span>房間識別碼</span>
        <strong>{room.roomCode || "連線中"}</strong>
        <p className="muted-text">手機須能開啟同一個已部署網址；本機可用示範玩家測完整流程。</p>
      </Card>
    </div>
  );
}

function PlayerChips({
  players,
}: {
  players: Array<{ id: string; nickname: string; isHost?: boolean }>;
}) {
  return (
    <div className="desire-chip-group">
      <h3>參與者（{players.length}）</h3>
      <div>
        {players.map((player) => (
          <span className="desire-chip" key={player.id}>
            {player.nickname}
            {player.isHost ? "（主持人）" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChoiceGrid({
  stage,
  selected,
  pickCount,
  onToggle,
}: {
  stage: DesireStage;
  selected: string[];
  pickCount: number;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <div className="desire-pick-counter">
        {Array.from({ length: pickCount }, (_, index) => (
          <span className={cn({ filled: Boolean(selected[index]) })} key={index}>
            {selected[index] ? <Check aria-hidden="true" size={16} /> : index + 1}
          </span>
        ))}
        <strong>
          {selected.length} / {pickCount}
        </strong>
      </div>
      <div className="desire-choice-grid">
        {stage.choices.map((choice) => {
          const isSelected = selected.includes(choice[0]);
          return (
            <button
              className={cn("desire-choice", { selected: isSelected })}
              key={choice[0]}
              onClick={() => onToggle(choice[0])}
            >
              <strong>{choice[1]}</strong>
              <span>{choice[2]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function HostPlaying({ room }: { room: DesireRoom }) {
  const stage = STAGES[room.stageIndex];
  const players = Object.values(room.players);
  const done = players.filter((player) => player.selections[stage.id]).length;
  const selected = room.mySelections[stage.id] ?? [];
  const hostDone = Boolean(room.players[room.hostPlayerId]?.selections[stage.id]);

  return (
    <div className="desire-host-grid">
      <Card className="desire-panel">
        <StageHeading stage={stage} />
        {hostDone ? (
          <p className="desire-state-note">
            你已完成本階段填答。請等待其他參與者完成，或公布匿名統計。
          </p>
        ) : (
          <>
            <ChoiceGrid
              stage={stage}
              selected={selected}
              pickCount={room.config.pickCount}
              onToggle={room.toggleHostChoice}
            />
            <Button
              disabled={selected.length !== room.config.pickCount}
              onClick={room.submitHostChoice}
            >
              提交我的選擇
            </Button>
          </>
        )}
      </Card>
      <Card className="desire-panel">
        <h3>
          全體作答進度 {done} / {players.length}
        </h3>
        <div className="desire-chip-list">
          {players.map((player) => (
            <span
              className={cn("desire-chip", { done: Boolean(player.selections[stage.id]) })}
              key={player.id}
            >
              {player.nickname} {player.selections[stage.id] ? "✓" : ""}
            </span>
          ))}
        </div>
        <Button disabled={done === 0} onClick={room.reveal}>
          公布本階段統計
        </Button>
        {room.isDemo ? (
          <Button variant="secondary" onClick={room.fillDemoSelections}>
            示範玩家自動作答
          </Button>
        ) : null}
      </Card>
    </div>
  );
}

function StageHeading({ stage }: { stage: DesireStage }) {
  return (
    <div>
      <p className="eyebrow">
        {stage.label} · {stage.title}
      </p>
      <h2>{stage.question}</h2>
      <p>{stage.intro}</p>
    </div>
  );
}

function HostReveal({ room }: { room: DesireRoom }) {
  const stage = STAGES[room.stageIndex];
  const counts = stageCounts(stage, room.players);
  const total = Object.keys(room.players).length || 1;
  const ranked = stage.choices
    .slice()
    .sort((left, right) => counts[right[0]] - counts[left[0]])
    .slice(0, 10);
  const isLast = room.stageIndex >= STAGES.length - 1;

  return (
    <div className="desire-stack">
      <Card className="desire-panel">
        <p className="eyebrow">匿名統計 · {stage.title}</p>
        <h2>大家將位置留給了什麼？</h2>
        <div className="desire-bar-list">
          {ranked.map((choice) => (
            <BarRow
              key={choice[0]}
              label={choice[1]}
              value={counts[choice[0]]}
              percent={counts[choice[0]] / total}
            />
          ))}
        </div>
        <Button onClick={room.advanceStage}>{isLast ? "查看最終分析" : "進入下一階段"}</Button>
      </Card>
      <Card className="desire-discussion-card">
        <strong>帶領討論</strong>
        <p>{discussion(stage.id)}</p>
      </Card>
    </div>
  );
}

function BarRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <div className="desire-bar-row">
      <span>{label}</span>
      <div aria-hidden="true">
        <i style={{ width: `${Math.max(2, percent * 100)}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function CategoryBars({ totals, max }: { totals: Record<string, number>; max: number }) {
  return (
    <div className="desire-bar-list compact">
      {Object.entries(CATEGORIES).map(([key, label]) => (
        <BarRow
          key={key}
          label={label}
          value={totals[key] ?? 0}
          percent={(totals[key] ?? 0) / max}
        />
      ))}
    </div>
  );
}

function Timeline({ selections }: { selections: Selections }) {
  return (
    <div className="desire-timeline">
      {STAGES.map((stage) => (
        <div key={stage.id}>
          <span>{stage.title}</span>
          <ul>
            {(selections[stage.id] ?? []).map((id) => {
              const choice = stage.choices.find((item) => item[0] === id);
              const faith = choice && (choice[3] === "faith" || choice[3] === "righteousness");
              return (
                <li className={cn({ faith: Boolean(faith) })} key={id}>
                  {choice ? choice[1] : id}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function HostResult({ room }: { room: DesireRoom }) {
  const progress = stageCategoryPercents(room.players);
  const hostSelections = room.players[room.hostPlayerId]?.selections ?? {};
  const max = STAGES.length * room.config.pickCount;

  return (
    <div className="desire-stack">
      <Card className="desire-panel">
        <p className="eyebrow">全體匿名結果 · 含主持人填答</p>
        <h2>我們的渴望如何改變？</h2>
        <p>下列比例代表各階段所有被選項目中，屬於「信仰操練」或「行義與服事」的比例。</p>
        <div className="desire-stage-stats">
          {progress.map((result) => (
            <div key={result.stage.id}>
              <h3>{result.stage.title}</h3>
              <MetricRow label="信仰操練" value={result.t.faith / result.selections} />
              <MetricRow
                label="行義服事"
                value={result.t.righteousness / result.selections}
                accent
              />
            </div>
          ))}
        </div>
      </Card>
      <Scripture>
        人生會長大，渴望也會改變。當選擇越來越多時，我是否仍渴慕神與祂所喜悅的義？
      </Scripture>
      <PersonalResult
        title={`主持人的個人結果 · ${room.nickname}`}
        selections={hostSelections}
        max={max}
      />
      <Button variant="secondary" onClick={() => window.location.reload()}>
        重新開始
      </Button>
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="desire-metric-row">
      <span>{label}</span>
      <div aria-hidden="true">
        <i className={cn({ accent })} style={{ width: `${Math.max(2, value * 100)}%` }} />
      </div>
      <strong>{formatPercent(value)}</strong>
    </div>
  );
}

function Waiting({ title, text, error }: { title: string; text: string; error?: string }) {
  return (
    <Card className="desire-waiting-card">
      <div className="desire-pulse" />
      <h2>{title}</h2>
      <p>{text}</p>
      {error ? <p className="error-text">{error}</p> : null}
    </Card>
  );
}

function PlayerJoinForm({ room, joinHostId }: { room: DesireRoom; joinHostId: string }) {
  const [name, setName] = useState("");

  return (
    <Card className="desire-panel narrow">
      <p className="eyebrow">玩家加入</p>
      <h2>加入人生旅程</h2>
      <p>輸入暱稱後等待主持人開始。你的個人選擇會在最後回到自己的裝置上分析。</p>
      {room.error ? <p className="error-text">{room.error}</p> : null}
      <Input
        value={name}
        maxLength={16}
        placeholder="例如：小恩"
        onChange={(event) => setName(event.target.value)}
      />
      <Button disabled={!name.trim()} onClick={() => room.joinRoom(joinHostId, name.trim())}>
        加入房間
      </Button>
    </Card>
  );
}

function PlayerChoiceScreen({ room }: { room: DesireRoom }) {
  const stage = STAGES[room.stageIndex];
  const selected = room.mySelections[stage.id] ?? [];

  return (
    <Card className="desire-panel">
      <StageHeading stage={stage} />
      <ChoiceGrid
        stage={stage}
        selected={selected}
        pickCount={room.config.pickCount}
        onToggle={room.togglePlayerChoice}
      />
      <Button
        disabled={selected.length !== room.config.pickCount}
        onClick={room.submitPlayerChoice}
      >
        確認這階段的選擇
      </Button>
      <p className="muted-text">確認後無法修改。</p>
    </Card>
  );
}

function PersonalResult({
  title,
  selections,
  max,
}: {
  title: string;
  selections: Selections;
  max: number;
}) {
  const stats = statsForSelections(selections);

  return (
    <Card className="desire-panel">
      <p className="eyebrow">{title}</p>
      <h2>你的渴望軌跡</h2>
      <Timeline selections={selections} />
      <h3>選擇分布</h3>
      <CategoryBars totals={stats.totals} max={max} />
      <p className="desire-analysis">
        <Sparkles aria-hidden="true" size={18} />
        {personalAnalysis(stats)}
      </p>
    </Card>
  );
}

function PlayerResult({ room }: { room: DesireRoom }) {
  const max = STAGES.length * room.config.pickCount;
  return (
    <div className="desire-stack">
      <PersonalResult
        title={`${room.nickname} 的個人結果`}
        selections={room.mySelections}
        max={max}
      />
      <Scripture>如果現在是你真實的人生，你希望哪一項永遠不要從你的選擇中消失？</Scripture>
    </div>
  );
}

function PlayerView({ room, joinHostId }: { room: DesireRoom; joinHostId: string }) {
  if (room.role !== "player") {
    return <PlayerJoinForm room={room} joinHostId={joinHostId} />;
  }
  if (room.phase === "lobby") {
    return <Waiting title="已加入房間" text="等待主持人開始遊戲。" error={room.error} />;
  }
  if (room.phase === "playing") {
    return <PlayerChoiceScreen room={room} />;
  }
  if (room.phase === "submitted") {
    return <Waiting title="已提交選擇" text="等待所有玩家完成這個人生階段。" error={room.error} />;
  }
  if (room.phase === "wait") {
    return <Waiting title="本階段已完成" text="主持人正在公布匿名統計。" error={room.error} />;
  }
  if (room.phase === "result") {
    return <PlayerResult room={room} />;
  }
  return <Waiting title="請稍候" text="主持人正在整理匿名統計。" error={room.error} />;
}
