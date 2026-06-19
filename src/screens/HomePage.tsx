import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Gamepad2, Sparkles } from "lucide-react";
import { games } from "../data/games";
import { resources } from "../data/resources";
import { Card } from "../components/ui/Card";

type TabId = "games" | "resources";

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "games", label: "聖經小遊戲", icon: Gamepad2 },
  { id: "resources", label: "聖經資源", icon: BookOpen },
];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("games");

  return (
    <section className="home-page">
      <div className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">聖經分享資源集合</p>
          <h1>讓聚會互動更容易開始</h1>
          <p>
            收集適合查經、團契與課程使用的聖經小遊戲與資源。每個項目都能獨立使用， 也能透過 QR
            邀請會眾一起參與。
          </p>
        </div>
        <div className="hero-stat" aria-label="目前遊戲數">
          <Sparkles aria-hidden="true" size={24} />
          <strong>{games.length}</strong>
          <span>個遊戲</span>
        </div>
      </div>

      <div className="home-tabs" role="tablist" aria-label="主題分類">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`home-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`home-panel-${tab.id}`}
              className={`home-tab${selected ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon aria-hidden="true" size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "games" && (
        <div
          id="home-panel-games"
          role="tabpanel"
          aria-labelledby="home-tab-games"
          className="home-panel"
        >
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
        </div>
      )}

      {activeTab === "resources" && (
        <div
          id="home-panel-resources"
          role="tabpanel"
          aria-labelledby="home-tab-resources"
          className="home-panel"
        >
          {resources.length > 0 ? (
            <div className="game-grid">
              {resources.map((resource) => {
                const Icon = resource.icon;

                return (
                  <Card className="game-card" key={resource.id}>
                    <div className="game-icon">
                      <Icon aria-hidden="true" size={26} />
                    </div>
                    <div className="game-card-body">
                      <span className="status-pill">可使用</span>
                      <h3>{resource.title}</h3>
                      <p>{resource.description}</p>
                    </div>
                    <Link to={resource.href} className="card-link">
                      開始使用
                      <ArrowRight aria-hidden="true" size={18} />
                    </Link>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="home-empty">
              <div className="home-empty-icon">
                <BookOpen aria-hidden="true" size={28} />
              </div>
              <h3>聖經資源即將上線</h3>
              <p>這裡將收錄查經、團契與課程使用的聖經資源，敬請期待。</p>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
