import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, MapPin, Route } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ministryPhases, ministryStops, type MinistryStop } from "../data/jesusMinistryMap";
import { cn } from "../lib/utils";

type MinistryPhase = (typeof ministryPhases)[number];

export function JesusMinistryMapPage() {
  const [selectedId, setSelectedId] = useState(ministryStops[0].id);
  const [phase, setPhase] = useState<MinistryPhase>("全部");
  const selected = ministryStops.find((stop) => stop.id === selectedId) ?? ministryStops[0];

  const visibleStops = useMemo(
    () => (phase === "全部" ? ministryStops : ministryStops.filter((stop) => stop.phase === phase)),
    [phase],
  );

  const selectedIndex = ministryStops.findIndex((stop) => stop.id === selected.id);

  const selectStep = (offset: number) => {
    const nextIndex = (selectedIndex + offset + ministryStops.length) % ministryStops.length;
    setSelectedId(ministryStops[nextIndex].id);
    setPhase("全部");
  };

  return (
    <section className="map-page">
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>

      <header className="map-header">
        <p className="eyebrow">互動地圖 · 福音書路線</p>
        <h1>耶穌傳道的腳蹤</h1>
        <p>
          從約旦河受洗、加利利傳道，到往耶路撒冷受難與復活。點選地圖上的地點，查看當地發生的事蹟與經文。
        </p>
      </header>

      <div className="map-filter" aria-label="篩選傳道階段">
        {ministryPhases.map((item) => (
          <button
            className={cn({ active: phase === item })}
            key={item}
            onClick={() => {
              setPhase(item);
              if (item !== "全部") {
                const first = ministryStops.find((stop) => stop.phase === item);
                if (first) {
                  setSelectedId(first.id);
                }
              }
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <Card className="map-stage-card">
          <div className="map-stage-toolbar">
            <div>
              <p className="eyebrow">路線示意圖</p>
              <h2>加利利、撒馬利亞、猶太地</h2>
            </div>
            <span>
              <Route aria-hidden="true" size={18} />
              {visibleStops.length} 個地點
            </span>
          </div>
          <MinistrySvgMap
            selected={selected}
            visibleStops={visibleStops}
            onSelect={setSelectedId}
          />
        </Card>

        <aside className="map-detail-panel">
          <Card className="map-detail-card">
            <div className="map-detail-kicker">
              <span>{selected.order}</span>
              <strong>{selected.phase}</strong>
            </div>
            <h2>{selected.place}</h2>
            <p className="map-region">
              <MapPin aria-hidden="true" size={18} />
              {selected.region}
            </p>
            <h3>{selected.title}</h3>
            <p>{selected.summary}</p>
            <div className="map-scripture">
              <BookOpen aria-hidden="true" size={18} />
              <span>{selected.scripture}</span>
            </div>
            <div className="map-event-list">
              <h3>在這裡發生的事</h3>
              <ul>
                {selected.events.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
            <div className="map-step-actions">
              <Button variant="secondary" onClick={() => selectStep(-1)}>
                上一站
              </Button>
              <Button onClick={() => selectStep(1)}>下一站</Button>
            </div>
          </Card>

          <Card className="map-route-card">
            <h3>路線清單</h3>
            <ol>
              {ministryStops.map((stop) => (
                <li key={stop.id}>
                  <button
                    className={cn({ active: stop.id === selected.id })}
                    onClick={() => {
                      setSelectedId(stop.id);
                      setPhase("全部");
                    }}
                  >
                    <span>{stop.order}</span>
                    <strong>{stop.place}</strong>
                    <small>{stop.title}</small>
                  </button>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function MinistrySvgMap({
  selected,
  visibleStops,
  onSelect,
}: {
  selected: MinistryStop;
  visibleStops: MinistryStop[];
  onSelect: (id: string) => void;
}) {
  const visibleIds = new Set(visibleStops.map((stop) => stop.id));
  const routePoints = ministryStops.map((stop) => `${stop.x},${stop.y}`).join(" ");

  return (
    <div className="map-svg-wrap">
      <svg viewBox="0 0 640 900" role="img" aria-label="耶穌傳道路線示意地圖">
        <rect className="map-sea" x="0" y="0" width="640" height="900" rx="26" />
        <path
          className="map-land"
          d="M247 72 C306 38 392 55 432 116 C467 170 451 248 421 318 C394 382 406 430 443 498 C479 567 470 651 424 726 C379 802 294 838 226 791 C165 748 176 658 205 594 C239 517 224 449 203 388 C175 308 178 217 205 150 C214 127 228 95 247 72Z"
        />
        <path
          className="map-samaria-band"
          d="M215 360 C278 326 366 333 427 374 L441 475 C372 450 282 449 218 486Z"
        />
        <path
          className="map-judea-band"
          d="M219 514 C287 481 388 496 447 552 C455 628 432 700 385 751 C332 739 249 741 206 689 C186 632 192 570 219 514Z"
        />
        <ellipse className="map-lake" cx="379" cy="181" rx="44" ry="72" />
        <path
          className="map-river"
          d="M379 252 C368 324 374 392 388 461 C401 526 392 589 365 645"
        />
        <ellipse className="map-dead-sea" cx="395" cy="645" rx="36" ry="92" />
        <path
          className="map-coast"
          d="M186 88 C153 184 144 281 159 392 C169 466 151 546 117 640 C92 710 90 779 119 840"
        />
        <text className="map-label" x="61" y="334">
          地中海
        </text>
        <text className="map-label" x="425" y="184">
          加利利海
        </text>
        <text className="map-label" x="430" y="650">
          死海
        </text>
        <text className="map-region-label" x="292" y="134">
          加利利
        </text>
        <text className="map-region-label" x="278" y="424">
          撒馬利亞
        </text>
        <text className="map-region-label" x="266" y="682">
          猶太
        </text>
        <polyline className="map-route-line" points={routePoints} />
        {ministryStops.map((stop) => {
          const isSelected = stop.id === selected.id;
          const isVisible = visibleIds.has(stop.id);
          return (
            <g
              className={cn("map-stop", {
                selected: isSelected,
                muted: !isVisible,
              })}
              key={stop.id}
              onClick={() => onSelect(stop.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(stop.id);
                }
              }}
              role="button"
              tabIndex={0}
              transform={`translate(${stop.x} ${stop.y})`}
            >
              <circle r={isSelected ? 18 : 14} />
              <text y="5">{stop.order}</text>
              <title>
                {stop.place}：{stop.title}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
