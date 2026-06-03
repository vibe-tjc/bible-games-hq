import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  KeyRound,
  PartyPopper,
  QrCode,
  RefreshCcw,
  Users,
  X,
} from "lucide-react";
import { ApiNotice } from "../components/ApiNotice";
import { AnonymousSwitch } from "../components/ui/AnonymousSwitch";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { beatitudes, shufflePairs } from "../data/beatitudes";
import { apiConfigured, createRoom, joinRoom, submitResult, type FirstAnswer } from "../lib/api";
import {
  clearStoredTeacherKey,
  getStoredTeacherKey,
  saveHostRoom,
  setStoredTeacherKey,
} from "../lib/hostRoom";
import { getPlayerId } from "../lib/player";
import { cn, formatPercent, shortId } from "../lib/utils";

type PlayerProfile = {
  playerId: string;
  name: string;
  anonymous: boolean;
};

type StartGameOverride = {
  name: string;
  anonymous: boolean;
};

const promiseByPairId = new Map(beatitudes.map((pair) => [pair.id, pair.promise]));

function isCorrectAnswer(pairId: string, selectedId: string) {
  return promiseByPairId.get(pairId) === promiseByPairId.get(selectedId);
}

function countCorrectAnswers(answers: Record<string, string>) {
  return beatitudes.reduce((total, pair) => {
    const selectedId = answers[pair.id];
    return selectedId && isCorrectAnswer(pair.id, selectedId) ? total + 1 : total;
  }, 0);
}

export function BeatitudesPage() {
  const { room, token, host } = useSearch({ from: "/games/beatitudes" });

  if (room) {
    return <ParticipantGame asHost={host === "1"} joinToken={token ?? ""} roomId={room} />;
  }

  return <HostStart />;
}

function HostStart() {
  const navigate = useNavigate();
  const [teacherKey, setTeacherKey] = useState(() => getStoredTeacherKey());
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const createRoomMutation = useMutation({
    mutationFn: () => createRoom({ teacherKey: teacherKey.trim() }),
    onSuccess: (room) => {
      setStoredTeacherKey(teacherKey.trim());
      saveHostRoom(room);
      void navigate({
        to: "/games/beatitudes/host/$roomId",
        params: { roomId: room.roomId },
      });
    },
  });

  const canCreate = apiConfigured && teacherKey.trim().length > 0;

  return (
    <section className="page-narrow">
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>
      <ApiNotice />
      <Card className="host-start-card">
        <div className="icon-badge">
          <QrCode aria-hidden="true" size={26} />
        </div>
        <div>
          <p className="eyebrow">登山寶訓中的八福連連看</p>
          <h1>建立一場共同參與的配對遊戲</h1>
          <p>
            主持人輸入 Apps Script 後端設定的教師密碼後，系統會建立短期場次 token。QR 只包含參與者
            token，不會暴露教師密碼。
          </p>
        </div>
        <label className="field">
          <span>教師密碼</span>
          <Input
            autoComplete="current-password"
            type="password"
            value={teacherKey}
            placeholder="輸入 Apps Script 的 TEACHER_KEY"
            onChange={(event) => {
              setTeacherKey(event.target.value);
              setKeyMessage(null);
            }}
          />
        </label>
        <div className="host-actions">
          <Button
            size="lg"
            disabled={!canCreate || createRoomMutation.isPending}
            onClick={() => createRoomMutation.mutate()}
          >
            <Users aria-hidden="true" size={20} />
            {createRoomMutation.isPending ? "建立中" : "建立場次"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              clearStoredTeacherKey();
              setTeacherKey("");
              setKeyMessage("已清除這台瀏覽器儲存的教師密碼。");
            }}
          >
            <KeyRound aria-hidden="true" size={18} />
            清除密碼
          </Button>
          {keyMessage ? <p className="muted-text">{keyMessage}</p> : null}
          {createRoomMutation.error ? (
            <p className="error-text">{createRoomMutation.error.message}</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function ParticipantGame({
  asHost,
  roomId,
  joinToken,
}: {
  asHost: boolean;
  roomId: string;
  joinToken: string;
}) {
  const bottomItems = useMemo(() => shufflePairs(beatitudes), []);
  const autoStartedRef = useRef(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const usedBottomIds = useMemo(() => new Set(Object.values(answers)), [answers]);
  const answerCount = Object.keys(answers).length;
  const correctPairs = countCorrectAnswers(answers);
  const incorrectPairs = beatitudes.length - correctPairs;
  const completionRate = answerCount / beatitudes.length;
  const errorRate = incorrectPairs / beatitudes.length;
  const missingToken = !joinToken;

  const startGame = useCallback(
    (override?: StartGameOverride) => {
      const playerId = getPlayerId(roomId);
      const nextAnonymous = override?.anonymous ?? anonymous;
      const trimmedName = (override?.name ?? name).trim();
      const nextProfile = {
        playerId,
        name: nextAnonymous || !trimmedName ? `匿名參與者 ${shortId(playerId)}` : trimmedName,
        anonymous: nextAnonymous || !trimmedName,
      };

      setProfile(nextProfile);
      setStartedAt(Date.now());
      setSubmitMessage(null);

      if (apiConfigured && joinToken) {
        joinRoom(roomId, joinToken, nextProfile).catch((error: Error) => {
          setSubmitMessage(`加入場次失敗：${error.message}`);
        });
      }
    },
    [anonymous, joinToken, name, roomId],
  );

  useEffect(() => {
    if (!asHost || autoStartedRef.current || profile || missingToken) {
      return;
    }

    autoStartedRef.current = true;
    startGame({ name: "主持人", anonymous: false });
  }, [asHost, missingToken, profile, startGame]);

  const finishGame = (answers: Record<string, string>) => {
    const finishedAt = Date.now();
    const elapsedMs = startedAt ? finishedAt - startedAt : 0;
    setCompletedAt(finishedAt);

    if (!profile) {
      return;
    }

    if (!apiConfigured || !joinToken) {
      setSubmitMessage("尚未設定 API 或連結缺少場次驗證碼，本次結果不會上傳。");
      return;
    }

    const submittedAnswers: FirstAnswer[] = beatitudes.map((pair) => ({
      pairId: pair.id,
      selectedId: answers[pair.id] ?? "",
    }));

    submitResult(roomId, joinToken, {
      ...profile,
      answers: submittedAnswers,
      elapsedMs,
    })
      .then(() => setSubmitMessage("結果已送出。"))
      .catch((error: Error) => setSubmitMessage(`送出失敗：${error.message}`));
  };

  const selectBottom = (bottomId: string) => {
    if (!selectedTop || answers[selectedTop] || usedBottomIds.has(bottomId) || completedAt) {
      return;
    }

    const nextAnswers = { ...answers, [selectedTop]: bottomId };
    setAnswers(nextAnswers);
    setSelectedTop(null);

    if (Object.keys(nextAnswers).length === beatitudes.length) {
      finishGame(nextAnswers);
    }
  };

  if (!profile) {
    return (
      <section className="page-narrow">
        <Link to="/" className="back-link">
          <ArrowLeft aria-hidden="true" size={18} />
          回首頁
        </Link>
        <ApiNotice />
        <Card className="join-card">
          <p className="eyebrow">場次 {roomId}</p>
          <h1>加入八福連連看</h1>
          <p>可以匿名參與，也可以輸入名稱讓主持人在完成名單上看到你。</p>
          {missingToken ? (
            <p className="error-text">連結缺少場次驗證碼，請請主持人重新提供 QR 或連結。</p>
          ) : null}
          <label className="switch-row">
            <span>
              <strong>匿名參與</strong>
              <small>主持頁會顯示匿名代號。</small>
            </span>
            <AnonymousSwitch checked={anonymous} onCheckedChange={setAnonymous} />
          </label>
          <label className="field">
            <span>名稱</span>
            <Input
              value={name}
              disabled={anonymous}
              maxLength={24}
              placeholder="輸入你的名稱"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <Button size="lg" disabled={missingToken} onClick={() => startGame()}>
            開始配對
          </Button>
          {submitMessage ? <p className="error-text">{submitMessage}</p> : null}
        </Card>
      </section>
    );
  }

  if (completedAt) {
    return (
      <section className="page-narrow">
        <Card className="complete-card">
          <div className="icon-badge success">
            <PartyPopper aria-hidden="true" size={28} />
          </div>
          <p className="eyebrow">完成作答</p>
          <h1>
            {profile.name}，你的錯誤率是 {formatPercent(errorRate)}
          </h1>
          <p>
            答對 {correctPairs} 組，錯誤 {incorrectPairs} 組，共 {beatitudes.length}{" "}
            組。下方是正確配對，方便一起核對與教學。
          </p>
          <div className="result-mini-grid">
            <span>
              <Check aria-hidden="true" size={18} />
              答對 {correctPairs} 組
            </span>
            <span>
              <X aria-hidden="true" size={18} />
              錯誤 {incorrectPairs} 組
            </span>
            <span>
              <Clock aria-hidden="true" size={18} />
              {startedAt ? Math.round((completedAt - startedAt) / 1000) : 0} 秒
            </span>
          </div>
          <div className="answer-key">
            <h2>正確配對</h2>
            <ol>
              {beatitudes.map((pair) => (
                <li key={pair.id}>
                  <span>
                    <strong>{pair.blessing}</strong>
                    <small>{pair.reference}</small>
                  </span>
                  <span>{pair.promise}</span>
                </li>
              ))}
            </ol>
          </div>
          {submitMessage ? <p className="muted-text">{submitMessage}</p> : null}
          <Link to="/" className="card-link centered">
            回首頁
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section className="game-page">
      <div className="game-toolbar">
        <div>
          <p className="eyebrow">場次 {roomId}</p>
          <h1>登山寶訓中的八福連連看</h1>
        </div>
        <div className="progress-summary">
          <span>
            {answerCount} / {beatitudes.length}
          </span>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${completionRate * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="match-board" aria-label="八福配對遊戲">
        <div className="match-column">
          <h2>上句</h2>
          {beatitudes.map((pair) => (
            <button
              className={cn("match-card", {
                selected: selectedTop === pair.id,
                matched: Boolean(answers[pair.id]),
              })}
              disabled={Boolean(answers[pair.id])}
              key={pair.id}
              onClick={() => setSelectedTop(pair.id)}
            >
              <span>{pair.blessing}</span>
              <small>{pair.reference}</small>
            </button>
          ))}
        </div>
        <div className="match-column">
          <h2>下句</h2>
          {bottomItems.map((pair) => (
            <button
              className={cn("match-card promise-card", {
                matched: usedBottomIds.has(pair.id),
              })}
              disabled={usedBottomIds.has(pair.id)}
              key={pair.id}
              onClick={() => selectBottom(pair.id)}
            >
              <span>{pair.promise}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="game-footer">
        <p>已作答 {answerCount} 組。每題只提交一次；選一張上句，再選一張對應的下句。</p>
        <Button variant="secondary" onClick={() => setSelectedTop(null)}>
          <RefreshCcw aria-hidden="true" size={18} />
          取消選取
        </Button>
      </div>
    </section>
  );
}
