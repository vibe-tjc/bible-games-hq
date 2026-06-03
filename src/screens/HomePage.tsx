import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { games } from "../data/games";
import { Card } from "../components/ui/Card";

export function HomePage() {
  return (
    <section className="home-page">
      <div className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">聖經分享小遊戲集合</p>
          <h1>讓聚會互動更容易開始</h1>
          <p>
            收集適合查經、團契與課程使用的聖經小遊戲。每個遊戲都能獨立使用， 也能透過 QR
            邀請會眾一起參與。
          </p>
        </div>
        <div className="hero-stat" aria-label="目前遊戲數">
          <Sparkles aria-hidden="true" size={24} />
          <strong>{games.length}</strong>
          <span>個遊戲</span>
        </div>
      </div>

      <div className="section-heading">
        <h2>遊戲列表</h2>
      </div>

      <div className="game-grid">
        {games.map((game) => {
          const Icon = game.icon;

          return (
            <Card className="game-card" key={game.id}>
              <div className="game-icon">
                <Icon aria-hidden="true" size={26} />
              </div>
              <div className="game-card-body">
                <span className="status-pill">可使用</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
              </div>
              <Link to={game.href} className="card-link">
                進入遊戲
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
