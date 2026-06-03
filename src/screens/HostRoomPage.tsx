import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Copy, Play, RefreshCw, Trash2, Users } from "lucide-react";
import { ApiNotice } from "../components/ApiNotice";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { apiConfigured, endRoom, getRoom } from "../lib/api";
import { getStoredHostRoom } from "../lib/hostRoom";
import { formatPercent } from "../lib/utils";

export function HostRoomPage() {
  const { roomId } = useParams({ from: "/games/beatitudes/host/$roomId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const hostRoom = useMemo(() => getStoredHostRoom(roomId), [roomId]);

  const participantUrl = useMemo(() => {
    const url = new URL(`${import.meta.env.BASE_URL}games/beatitudes`, window.location.origin);
    url.searchParams.set("room", roomId);

    if (hostRoom?.joinToken) {
      url.searchParams.set("token", hostRoom.joinToken);
    }

    return url.toString();
  }, [hostRoom?.joinToken, roomId]);

  const openHostParticipantGame = () => {
    const url = new URL(participantUrl);
    url.searchParams.set("host", "1");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId, hostRoom?.hostToken ?? ""),
    enabled: apiConfigured && Boolean(hostRoom?.hostToken),
    refetchInterval: 3_000,
  });

  const endRoomMutation = useMutation({
    mutationFn: () => endRoom(roomId, hostRoom?.hostToken ?? ""),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      void navigate({ to: "/games/beatitudes" });
    },
  });

  const summary = roomQuery.data;

  return (
    <section className="host-room-page">
      <Link to="/games/beatitudes" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        重新建立場次
      </Link>
      <ApiNotice />

      {!hostRoom ? (
        <Card className="empty-state">
          <p className="error-text">這台瀏覽器沒有此場次的主持權限。</p>
          <p className="muted-text">
            請回到建立場次頁重新輸入教師密碼建立新場次；主持 token 不會放在 QR 連結內。
          </p>
        </Card>
      ) : (
        <div className="host-layout">
          <Card className="qr-card">
            <p className="eyebrow">主持場次</p>
            <h1>{roomId}</h1>
            <div className="qr-frame" aria-label="參與者加入 QR code">
              <QRCodeSVG value={participantUrl} size={220} marginSize={3} />
            </div>
            <p className="muted-text">{participantUrl}</p>
            <div className="host-actions">
              <Button
                variant="secondary"
                disabled={!hostRoom.joinToken}
                onClick={openHostParticipantGame}
              >
                <Play aria-hidden="true" size={18} />
                我也要玩
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(participantUrl);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1400);
                }}
              >
                <Copy aria-hidden="true" size={18} />
                {copied ? "已複製" : "複製連結"}
              </Button>
              <Button
                variant="danger"
                disabled={endRoomMutation.isPending}
                onClick={() => endRoomMutation.mutate()}
              >
                <Trash2 aria-hidden="true" size={18} />
                結束場次
              </Button>
            </div>
            {endRoomMutation.error ? (
              <p className="error-text">{endRoomMutation.error.message}</p>
            ) : null}
          </Card>

          <div className="results-panel">
            <div className="results-header">
              <div>
                <p className="eyebrow">即時結果</p>
                <h2>全場答對比例</h2>
              </div>
              <Button
                variant="ghost"
                disabled={roomQuery.isFetching}
                onClick={() => void roomQuery.refetch()}
                aria-label="重新整理結果"
              >
                <RefreshCw aria-hidden="true" size={18} />
              </Button>
            </div>

            {roomQuery.error ? (
              <Card className="empty-state">
                <p className="error-text">{roomQuery.error.message}</p>
              </Card>
            ) : (
              <>
                <div className="metric-grid">
                  <Card className="metric-card featured">
                    <span>總答對配對率</span>
                    <strong>{formatPercent(summary?.correctRate ?? 0)}</strong>
                  </Card>
                  <Card className="metric-card">
                    <span>已加入</span>
                    <strong>{summary?.totalParticipants ?? 0}</strong>
                  </Card>
                  <Card className="metric-card">
                    <span>已完成</span>
                    <strong>{summary?.completedCount ?? 0}</strong>
                  </Card>
                </div>

                <Card className="completion-list">
                  <div className="list-title">
                    <Users aria-hidden="true" size={18} />
                    <h3>完成名單</h3>
                  </div>
                  {summary?.completedPlayers.length ? (
                    <ul>
                      {summary.completedPlayers.map((player) => (
                        <li key={player.playerId}>
                          <span>{player.displayName}</span>
                          <small>
                            {player.correctPairs}/{player.totalPairs} 組，
                            {Math.round(player.elapsedMs / 1000)} 秒
                          </small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted-text">還沒有參與者完成。</p>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
