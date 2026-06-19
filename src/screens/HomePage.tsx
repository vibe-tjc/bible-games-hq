import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import type { GameCard as GameCardType } from "../data/games";
import { games } from "../data/games";
import { Card } from "../components/ui/Card";

const playableGames = games.filter((game) => game.category === "game");
const resources = games.filter((game) => game.category === "resource");

function GameCard({ item }: { item: GameCardType }) {
  const Icon = item.icon;
  const isResource = item.category === "resource";

  return (
    <Card className="game-card">
      <div className="game-icon">
        <Icon aria-hidden="true" size={26} />
      </div>
      <div className="game-card-body">
        <span className="status-pill">{isResource ? "資源" : "可使用"}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <Link to={item.href} className="card-link">
        {isResource ? "開始探索" : "進入遊戲"}
        <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </Card>
  );
}

export function HomePage() {
  return (
    <section className="home-page">
      <div className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">聖經分享小遊戲集合</p>
          <h1>讓聚會互動更容易開始</h1>
          <p>
            收集適合查經、團契與課程使用的聖經小遊戲與資源。每個內容都能獨立使用， 也能透過 QR
            邀請會眾一起參與。
          </p>
        </div>
        <div className="hero-stat" aria-label="目前內容數">
          <Sparkles aria-hidden="true" size={24} />
          <strong>{games.length}</strong>
          <span>個內容</span>
        </div>
      </div>

      <div className="home-section">
        <div className="section-heading">
          <h2>
            <Sparkles aria-hidden="true" size={20} />
            互動遊戲
          </h2>
          <p>適合破冰、查經暖身與投影互動的小遊戲。</p>
        </div>
        <div className="game-grid">
          {playableGames.map((game) => (
            <GameCard item={game} key={game.id} />
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-heading">
          <h2>
            <BookOpen aria-hidden="true" size={20} />
            聖經資源
          </h2>
          <p>搭配查經與課程使用的互動聖經資源。</p>
        </div>
        <div className="game-grid">
          {resources.map((resource) => (
            <GameCard item={resource} key={resource.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
