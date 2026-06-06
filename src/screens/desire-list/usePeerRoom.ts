import { useCallback, useEffect, useRef, useState } from "react";
import Peer, { type DataConnection } from "peerjs";
import { DEFAULT_CONFIG, STAGES, demoPattern } from "./data";
import type { DesirePlayer, Players, Selections } from "./logic";

const HOST_PLAYER_ID = "host-self";

type Role = "host" | "player" | null;
export type DesirePhase = "lobby" | "playing" | "reveal" | "result" | "submitted" | "wait";

type Config = typeof DEFAULT_CONFIG;

type PeerMessage =
  | { type: "join"; playerId: string; nickname: string }
  | { type: "joined"; config: Config; phase: DesirePhase; stageIndex: number }
  | { type: "submit"; playerId: string; choices: string[] }
  | { type: "accepted"; stageId: string }
  | { type: "stage"; stageIndex: number; config: Config }
  | { type: "wait"; text?: string }
  | { type: "result"; selections: Selections };

export function buildJoinUrl(hostId: string) {
  const path = `${import.meta.env.BASE_URL}games/desire-list`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("join", hostId);
  return url.toString();
}

function isPeerMessage(value: unknown): value is PeerMessage {
  return Boolean(value && typeof value === "object" && "type" in value);
}

export function usePeerRoom() {
  const [role, setRole] = useState<Role>(null);
  const [phase, setPhase] = useState<DesirePhase>("lobby");
  const [stageIndex, setStageIndex] = useState(-1);
  const [config, setConfig] = useState<Config>({ ...DEFAULT_CONFIG });
  const [players, setPlayers] = useState<Players>({});
  const [mySelections, setMySelections] = useState<Selections>({});
  const [roomCode, setRoomCode] = useState("");
  const [hostId, setHostId] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef(new Map<string, DataConnection>());
  const connRef = useRef<DataConnection | null>(null);
  const meIdRef = useRef<string | null>(null);

  const configRef = useRef(config);
  const phaseRef = useRef(phase);
  const stageIndexRef = useRef(stageIndex);
  const playersRef = useRef(players);
  const mySelectionsRef = useRef(mySelections);

  useEffect(
    () => () => {
      connsRef.current.forEach((conn) => conn.close());
      peerRef.current?.destroy();
    },
    [],
  );

  const setConfigSync = useCallback((next: Config | ((prev: Config) => Config)) => {
    setConfig((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      configRef.current = value;
      return value;
    });
  }, []);

  const setPhaseSync = useCallback((next: DesirePhase | ((prev: DesirePhase) => DesirePhase)) => {
    setPhase((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      phaseRef.current = value;
      return value;
    });
  }, []);

  const setStageIndexSync = useCallback((next: number | ((prev: number) => number)) => {
    setStageIndex((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      stageIndexRef.current = value;
      return value;
    });
  }, []);

  const setPlayersSync = useCallback((next: Players | ((prev: Players) => Players)) => {
    setPlayers((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      playersRef.current = value;
      return value;
    });
  }, []);

  const setMySelectionsSync = useCallback(
    (next: Selections | ((prev: Selections) => Selections)) => {
      setMySelections((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        mySelectionsRef.current = value;
        return value;
      });
    },
    [],
  );

  const handleHostMessage = useCallback(
    (conn: DataConnection, data: unknown) => {
      if (!isPeerMessage(data)) {
        return;
      }

      if (data.type === "join") {
        const id = data.playerId;
        connsRef.current.set(id, conn);
        setPlayersSync((prev) => ({
          ...prev,
          [id]: {
            id,
            nickname: String(data.nickname || "玩家").slice(0, 16),
            selections: {},
          },
        }));
        conn.send({
          type: "joined",
          config: configRef.current,
          phase: phaseRef.current,
          stageIndex: stageIndexRef.current,
        } satisfies PeerMessage);
        return;
      }

      if (data.type === "submit") {
        if (phaseRef.current !== "playing") {
          return;
        }

        const stage = STAGES[stageIndexRef.current];
        const valid = new Set(stage.choices.map((choice) => choice[0]));
        const chosen = (data.choices || [])
          .filter((id) => valid.has(id))
          .slice(0, configRef.current.pickCount);

        if (chosen.length === configRef.current.pickCount) {
          const player = playersRef.current[data.playerId];
          if (!player) {
            return;
          }

          setPlayersSync((prev) => ({
            ...prev,
            [data.playerId]: {
              ...player,
              selections: { ...player.selections, [stage.id]: chosen },
            },
          }));
          conn.send({ type: "accepted", stageId: stage.id } satisfies PeerMessage);
        }
      }
    },
    [setPlayersSync],
  );

  const removePlayerByConn = useCallback(
    (conn: DataConnection) => {
      let removedId: string | null = null;
      connsRef.current.forEach((connection, id) => {
        if (connection === conn) {
          removedId = id;
        }
      });

      if (removedId) {
        connsRef.current.delete(removedId);
        setPlayersSync((prev) => {
          const next = { ...prev };
          delete next[removedId as string];
          return next;
        });
      }
    },
    [setPlayersSync],
  );

  const setupHost = useCallback(
    (hostNickname: string) => {
      peerRef.current?.destroy();
      const name = hostNickname.trim() || "主持人";
      setRole("host");
      setPhaseSync("lobby");
      setError("");
      setNickname(name);
      setRoomCode("");
      setHostId("");
      meIdRef.current = HOST_PLAYER_ID;
      setMySelectionsSync({});
      setPlayersSync({
        [HOST_PLAYER_ID]: { id: HOST_PLAYER_ID, nickname: name, selections: {}, isHost: true },
      });

      const peer = new Peer();
      peerRef.current = peer;
      peer.on("open", (id) => {
        setHostId(id);
        setRoomCode(id.slice(0, 6).toUpperCase());
      });
      peer.on("connection", (conn) => {
        conn.on("data", (data) => handleHostMessage(conn, data));
        conn.on("close", () => removePlayerByConn(conn));
      });
      peer.on("error", (err) => setError(`連線服務無法使用：${err.type}`));
    },
    [handleHostMessage, removePlayerByConn, setMySelectionsSync, setPhaseSync, setPlayersSync],
  );

  const broadcast = useCallback((message: PeerMessage) => {
    connsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }, []);

  const updateConfig = useCallback(
    (patch: Partial<Config>) => setConfigSync((current) => ({ ...current, ...patch })),
    [setConfigSync],
  );

  const setHostNickname = useCallback(
    (name: string) => {
      const nextName = name.trim() || "主持人";
      setNickname(nextName);
      setPlayersSync((prev) => ({
        ...prev,
        [HOST_PLAYER_ID]: { ...prev[HOST_PLAYER_ID], nickname: nextName },
      }));
    },
    [setPlayersSync],
  );

  const addDemoPlayers = useCallback(() => {
    const names = ["小恩", "立晴", "阿哲", "恩祈", "宇凡", "安安", "以琳", "家豪"];
    setPlayersSync((prev) => {
      const next = { ...prev };
      names.forEach((name, i) => {
        const id = `demo-${i}`;
        if (!next[id]) {
          next[id] = { id, nickname: name, selections: {}, demo: true };
        }
      });
      return next;
    });
    setIsDemo(true);
  }, [setPlayersSync]);

  const startGame = useCallback(() => {
    setStageIndexSync(0);
    setPhaseSync("playing");
    broadcast({ type: "stage", stageIndex: 0, config: configRef.current });
  }, [broadcast, setPhaseSync, setStageIndexSync]);

  const toggleHostChoice = useCallback(
    (id: string) => {
      const stage = STAGES[stageIndexRef.current];
      const pickCount = configRef.current.pickCount;
      setMySelectionsSync((prev) => {
        let selected = prev[stage.id] ?? [];
        if (selected.includes(id)) {
          selected = selected.filter((item) => item !== id);
        } else if (selected.length < pickCount) {
          selected = [...selected, id];
        }
        return { ...prev, [stage.id]: selected };
      });
    },
    [setMySelectionsSync],
  );

  const submitHostChoice = useCallback(() => {
    const stage = STAGES[stageIndexRef.current];
    const selected = mySelectionsRef.current[stage.id] ?? [];
    if (selected.length === configRef.current.pickCount) {
      setPlayersSync((prev) => ({
        ...prev,
        [HOST_PLAYER_ID]: {
          ...prev[HOST_PLAYER_ID],
          selections: { ...prev[HOST_PLAYER_ID].selections, [stage.id]: [...selected] },
        },
      }));
    }
  }, [setPlayersSync]);

  const fillDemoSelections = useCallback(() => {
    const stage = STAGES[stageIndexRef.current];
    const pickCount = configRef.current.pickCount;
    setPlayersSync((prev) => {
      const next = { ...prev };
      Object.values(next)
        .filter((player) => player.demo)
        .forEach((player, idx) => {
          next[player.id] = {
            ...player,
            selections: { ...player.selections, [stage.id]: demoPattern(stage.id, idx, pickCount) },
          };
        });
      return next;
    });
  }, [setPlayersSync]);

  const reveal = useCallback(() => {
    setPhaseSync("reveal");
    broadcast({ type: "wait", text: "主持人正在公布匿名統計" });
  }, [broadcast, setPhaseSync]);

  const advanceStage = useCallback(() => {
    const currentStageIndex = stageIndexRef.current;
    if (currentStageIndex < STAGES.length - 1) {
      const nextStageIndex = currentStageIndex + 1;
      setStageIndexSync(nextStageIndex);
      setPhaseSync("playing");
      broadcast({ type: "stage", stageIndex: nextStageIndex, config: configRef.current });
      return;
    }

    setPhaseSync("result");
    connsRef.current.forEach((conn, id) => {
      const player = playersRef.current[id];
      if (conn.open && player) {
        conn.send({ type: "result", selections: player.selections } satisfies PeerMessage);
      }
    });
  }, [broadcast, setPhaseSync, setStageIndexSync]);

  const handlePlayerMessage = useCallback(
    (data: unknown) => {
      if (!isPeerMessage(data)) {
        return;
      }

      if (data.type === "joined") {
        setConfigSync(data.config);
        setStageIndexSync(data.stageIndex);
        if (data.phase === "playing") {
          setPhaseSync("playing");
        } else if (data.phase === "reveal" || data.phase === "result") {
          setPhaseSync("wait");
        } else {
          setPhaseSync("lobby");
        }
        return;
      }

      if (data.type === "stage") {
        setConfigSync(data.config);
        setStageIndexSync(data.stageIndex);
        setPhaseSync("playing");
      } else if (data.type === "accepted") {
        setPhaseSync("submitted");
      } else if (data.type === "wait") {
        setPhaseSync("wait");
      } else if (data.type === "result") {
        setMySelectionsSync(data.selections || {});
        setPhaseSync("result");
      }
    },
    [setConfigSync, setMySelectionsSync, setPhaseSync, setStageIndexSync],
  );

  const joinRoom = useCallback(
    (targetHostId: string, playerNickname: string) => {
      peerRef.current?.destroy();
      const name = playerNickname.trim();
      if (!name) {
        setError("請先輸入暱稱。");
        return;
      }
      if (!targetHostId.trim()) {
        setError("請輸入主持人連線代碼。");
        return;
      }

      setRole("player");
      setError("");
      setNickname(name);
      setHostId(targetHostId);
      meIdRef.current = `p-${Math.random().toString(36).slice(2, 10)}`;

      const peer = new Peer();
      peerRef.current = peer;
      peer.on("open", () => {
        const conn = peer.connect(targetHostId, { reliable: true });
        connRef.current = conn;
        conn.on("open", () => {
          conn.send({ type: "join", playerId: meIdRef.current ?? "", nickname: name });
        });
        conn.on("data", handlePlayerMessage);
        conn.on("error", () => setError("無法連接主持人。"));
        conn.on("close", () => setError("與主持人的連線已中斷。"));
      });
      peer.on("error", (err) => setError(`連線失敗：${err.type}`));
      setPhaseSync("lobby");
    },
    [handlePlayerMessage, setPhaseSync],
  );

  const togglePlayerChoice = useCallback(
    (id: string) => {
      const stage = STAGES[stageIndexRef.current];
      const pickCount = configRef.current.pickCount;
      setMySelectionsSync((prev) => {
        let selected = prev[stage.id] ?? [];
        if (selected.includes(id)) {
          selected = selected.filter((item) => item !== id);
        } else if (selected.length < pickCount) {
          selected = [...selected, id];
        }
        return { ...prev, [stage.id]: selected };
      });
    },
    [setMySelectionsSync],
  );

  const submitPlayerChoice = useCallback(() => {
    const stage = STAGES[stageIndexRef.current];
    const selected = mySelectionsRef.current[stage.id] ?? [];
    if (selected.length === configRef.current.pickCount && connRef.current?.open) {
      connRef.current.send({
        type: "submit",
        playerId: meIdRef.current ?? "",
        choices: selected,
      } satisfies PeerMessage);
    }
  }, []);

  return {
    role,
    phase,
    stageIndex,
    config,
    players,
    mySelections,
    roomCode,
    hostId,
    nickname,
    error,
    isDemo,
    hostPlayerId: HOST_PLAYER_ID,
    setupHost,
    setHostNickname,
    updateConfig,
    addDemoPlayers,
    startGame,
    toggleHostChoice,
    submitHostChoice,
    fillDemoSelections,
    reveal,
    advanceStage,
    joinRoom,
    togglePlayerChoice,
    submitPlayerChoice,
  };
}

export type DesireRoom = ReturnType<typeof usePeerRoom>;
export type { DesirePlayer };
