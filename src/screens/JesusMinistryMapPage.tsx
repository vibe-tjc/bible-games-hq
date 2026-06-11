import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import L from "leaflet";
import { ArrowLeft, BookOpen, Languages, MapPin, Route } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ministryPhases, ministryStops, type MinistryStop } from "../data/jesusMinistryMap";
import { cn } from "../lib/utils";

type MinistryPhase = (typeof ministryPhases)[number];
type MapLanguage = "zh" | "en";

type StopText = {
  place: string;
  region: string;
  scripture: string;
  title: string;
  summary: string;
  events: string[];
};

type PageCopy = {
  langCode: string;
  backHome: string;
  eyebrow: string;
  title: string;
  intro: string;
  filterLabel: string;
  languageLabel: string;
  mapEyebrow: string;
  mapTitle: string;
  locationCount: (count: number) => string;
  eventsTitle: string;
  previous: string;
  next: string;
  routeTitle: string;
  attribution: string;
};

const pageCopy = {
  zh: {
    langCode: "zh-Hant",
    backHome: "回首頁",
    eyebrow: "互動地圖 · 福音書路線",
    title: "耶穌傳道的腳蹤",
    intro:
      "從約旦河受洗、加利利傳道，到往耶路撒冷受難與復活。點選地圖上的地點，查看當地發生的事蹟與經文。",
    filterLabel: "篩選傳道階段",
    languageLabel: "地圖語言",
    mapEyebrow: "真實地圖 · OpenStreetMap",
    mapTitle: "加利利、撒馬利亞、猶太地",
    locationCount: (count: number) => `${count} 個地點`,
    eventsTitle: "在這裡發生的事",
    previous: "上一站",
    next: "下一站",
    routeTitle: "路線清單",
    attribution: "地圖底圖：OpenStreetMap。地點為教學用近似定位。",
  },
  en: {
    langCode: "en",
    backHome: "Home",
    eyebrow: "Interactive Map · Gospel Route",
    title: "Footsteps of Jesus' Ministry",
    intro:
      "Follow Jesus from baptism at the Jordan, through ministry in Galilee, to Jerusalem, the cross, and the resurrection. Select a place on the map to review the events and Scripture references.",
    filterLabel: "Filter ministry phase",
    languageLabel: "Map language",
    mapEyebrow: "Real Map · OpenStreetMap",
    mapTitle: "Galilee, Samaria, and Judea",
    locationCount: (count: number) => `${count} stops`,
    eventsTitle: "What happened here",
    previous: "Previous",
    next: "Next",
    routeTitle: "Route List",
    attribution: "Base map: OpenStreetMap. Locations are approximate for teaching use.",
  },
} satisfies Record<MapLanguage, PageCopy>;

const phaseLabels = {
  全部: { zh: "全部", en: "All" },
  預備: { zh: "預備", en: "Preparation" },
  加利利: { zh: "加利利", en: "Galilee" },
  往耶路撒冷: { zh: "往耶路撒冷", en: "Toward Jerusalem" },
  受難與復活: { zh: "受難與復活", en: "Passion and Resurrection" },
} satisfies Record<MinistryPhase, Record<MapLanguage, string>>;

const stopTranslations: Record<string, StopText> = {
  "bethany-beyond-jordan": {
    place: "Bethany Beyond the Jordan",
    region: "Lower Jordan River",
    scripture: "Matthew 3:13-17; John 1:28-34",
    title: "Baptism and the Start of Public Ministry",
    summary:
      "Jesus came to the Jordan to be baptized by John. The heavens opened, the Spirit descended, and the Father declared Him to be His beloved Son.",
    events: [
      "John the Baptist testified that Jesus is the Lamb of God",
      "Jesus prepared to begin His public ministry",
    ],
  },
  wilderness: {
    place: "Judean Wilderness",
    region: "West of the Dead Sea",
    scripture: "Matthew 4:1-11; Luke 4:1-13",
    title: "Fasting and Temptation",
    summary:
      "Jesus fasted forty days in the wilderness and answered every temptation with the word of God.",
    events: [
      "The temptation to turn stones into bread",
      "The temptation to jump from the temple",
      "The temptation of the kingdoms of the world",
    ],
  },
  nazareth: {
    place: "Nazareth",
    region: "Galilee",
    scripture: "Luke 4:16-30",
    title: "Reading Isaiah in His Hometown",
    summary:
      "Jesus read the passage about the Spirit of the Lord anointing Him to proclaim good news, and He was rejected in His hometown.",
    events: ["He proclaimed good news to the poor", "His hometown stumbled over His identity"],
  },
  cana: {
    place: "Cana",
    region: "Galilee",
    scripture: "John 2:1-11; 4:46-54",
    title: "Water to Wine and the Second Sign",
    summary:
      "At a wedding feast Jesus turned water into wine and revealed His glory. Later, He also healed an official's son.",
    events: ["Water turned into wine", "Healing the official's son from a distance"],
  },
  capernaum: {
    place: "Capernaum",
    region: "North Shore of the Sea of Galilee",
    scripture: "Matthew 4:13-17; 8:5-17; Mark 2:1-12",
    title: "Ministry Center in Galilee",
    summary:
      "Jesus stayed around Capernaum, preached that the kingdom of heaven was near, healed the sick, forgave sins, and taught the crowds.",
    events: [
      "Healing the centurion's servant",
      "Healing Peter's mother-in-law",
      "Healing the paralytic and declaring forgiveness",
    ],
  },
  "sea-galilee": {
    place: "Sea of Galilee",
    region: "Galilee",
    scripture: "Matthew 4:18-22; 8:23-27; 14:22-33",
    title: "Calling Disciples and Ruling the Storm",
    summary:
      "Jesus called fishermen to follow Him by the lake and revealed His authority over creation in the storm.",
    events: ["Calling Peter, Andrew, James, and John", "Calming the storm", "Walking on the sea"],
  },
  "mount-beatitudes": {
    place: "Mount of Beatitudes Area",
    region: "Northwest of the Sea of Galilee",
    scripture: "Matthew 5-7",
    title: "Sermon on the Mount",
    summary:
      "Jesus taught the life of the kingdom, proclaiming the Beatitudes, salt and light, and a deeper righteousness.",
    events: [
      "Proclaiming the Beatitudes",
      "Teaching the Lord's Prayer",
      "Calling hearers to practice His words",
    ],
  },
  nain: {
    place: "Nain",
    region: "Southern Galilee",
    scripture: "Luke 7:11-17",
    title: "Raising the Widow's Son",
    summary:
      "Jesus saw a widow grieving the death of her only son, had compassion on her, and raised the young man from the dead.",
    events: ["Comforting a grieving mother", "Raising the dead", "The crowd glorifying God"],
  },
  "caesarea-philippi": {
    place: "Caesarea Philippi",
    region: "Southern Slopes of Mount Hermon",
    scripture: "Matthew 16:13-28",
    title: "Peter Confesses Jesus as the Christ",
    summary:
      "Jesus asked the disciples who they believed He was, and Peter confessed Him as the Christ, the Son of the living God.",
    events: [
      "Peter's confession of faith",
      "Jesus foretold His suffering and resurrection",
      "Jesus called disciples to take up the cross",
    ],
  },
  samaria: {
    place: "Sychar in Samaria",
    region: "Samaria",
    scripture: "John 4:4-42",
    title: "Living Water at the Well",
    summary:
      "Jesus spoke with a Samaritan woman about living water and true worship, leading many to believe He is the Savior of the world.",
    events: [
      "Speaking about living water",
      "Teaching worship in spirit and truth",
      "Samaritans believing in Jesus",
    ],
  },
  jericho: {
    place: "Jericho",
    region: "Jordan Valley",
    scripture: "Luke 18:35-19:10",
    title: "Bartimaeus Sees and Zacchaeus Is Found",
    summary:
      "Near Jericho Jesus healed a blind man and entered Zacchaeus' house, declaring that the Son of Man came to seek and save the lost.",
    events: [
      "Healing a blind beggar",
      "Calling Zacchaeus to repentance",
      "Salvation coming to Zacchaeus' house",
    ],
  },
  bethany: {
    place: "Bethany",
    region: "East Side of the Mount of Olives",
    scripture: "John 11:1-44; 12:1-8",
    title: "Lazarus Raised and Mary Anoints Jesus",
    summary:
      "Jesus called Lazarus out of the tomb and, before His suffering, received Mary's anointing with costly perfume.",
    events: [
      "Declaring Himself the resurrection and the life",
      "Raising Lazarus",
      "Mary anointing the Lord with perfume",
    ],
  },
  jerusalem: {
    place: "Jerusalem",
    region: "Judea",
    scripture: "Matthew 21-28; Luke 22-24; John 18-20",
    title: "Passion, Cross, and Resurrection",
    summary:
      "Jesus entered Jerusalem, instituted the Lord's Supper, was crucified, and rose on the third day, accomplishing salvation.",
    events: [
      "Triumphal entry",
      "Cleansing the temple and teaching",
      "The Last Supper",
      "Crucifixion",
      "The empty tomb and resurrection appearances",
    ],
  },
  emmaus: {
    place: "Road to Emmaus",
    region: "Northwest of Jerusalem",
    scripture: "Luke 24:13-35",
    title: "The Risen Lord Walks with Disciples",
    summary:
      "The risen Jesus walked with two disciples and explained from Moses and the Prophets the things concerning Himself.",
    events: [
      "The disciples' eyes were opened",
      "Jesus was recognized in the breaking of bread",
      "The disciples returned to Jerusalem as witnesses",
    ],
  },
};

export function JesusMinistryMapPage() {
  const [selectedId, setSelectedId] = useState(ministryStops[0].id);
  const [phase, setPhase] = useState<MinistryPhase>("全部");
  const [language, setLanguage] = useState<MapLanguage>("zh");
  const copy = pageCopy[language];
  const selected = ministryStops.find((stop) => stop.id === selectedId) ?? ministryStops[0];
  const selectedText = getStopText(selected, language);

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
    <section className="map-page" lang={copy.langCode}>
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        {copy.backHome}
      </Link>

      <header className="map-header">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <div className="map-controls">
        <div className="map-filter" aria-label={copy.filterLabel}>
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
              {getPhaseLabel(item, language)}
            </button>
          ))}
        </div>
        <div className="map-language-switch" aria-label={copy.languageLabel}>
          <Languages aria-hidden="true" size={18} />
          <button className={cn({ active: language === "zh" })} onClick={() => setLanguage("zh")}>
            中文
          </button>
          <button className={cn({ active: language === "en" })} onClick={() => setLanguage("en")}>
            English
          </button>
        </div>
      </div>

      <div className="map-layout">
        <Card className="map-stage-card">
          <div className="map-stage-toolbar">
            <div>
              <p className="eyebrow">{copy.mapEyebrow}</p>
              <h2>{copy.mapTitle}</h2>
            </div>
            <span>
              <Route aria-hidden="true" size={18} />
              {copy.locationCount(visibleStops.length)}
            </span>
          </div>
          <LeafletMinistryMap
            language={language}
            selected={selected}
            visibleStops={visibleStops}
            onSelect={setSelectedId}
          />
        </Card>

        <aside className="map-detail-panel">
          <Card className="map-detail-card">
            <div className="map-detail-kicker">
              <span>{selected.order}</span>
              <strong>{getPhaseLabel(selected.phase, language)}</strong>
            </div>
            <h2>{selectedText.place}</h2>
            <p className="map-region">
              <MapPin aria-hidden="true" size={18} />
              {selectedText.region}
            </p>
            <h3>{selectedText.title}</h3>
            <p>{selectedText.summary}</p>
            <div className="map-scripture">
              <BookOpen aria-hidden="true" size={18} />
              <span>{selectedText.scripture}</span>
            </div>
            <div className="map-event-list">
              <h3>{copy.eventsTitle}</h3>
              <ul>
                {selectedText.events.map((event, index) => (
                  <li key={`${selected.id}-${index}`}>{event}</li>
                ))}
              </ul>
            </div>
            <div className="map-step-actions">
              <Button variant="secondary" onClick={() => selectStep(-1)}>
                {copy.previous}
              </Button>
              <Button onClick={() => selectStep(1)}>{copy.next}</Button>
            </div>
          </Card>

          <Card className="map-route-card">
            <h3>{copy.routeTitle}</h3>
            <ol>
              {ministryStops.map((stop) => {
                const stopText = getStopText(stop, language);
                return (
                  <li key={stop.id}>
                    <button
                      className={cn({ active: stop.id === selected.id })}
                      onClick={() => {
                        setSelectedId(stop.id);
                        setPhase("全部");
                      }}
                    >
                      <span>{stop.order}</span>
                      <strong>{stopText.place}</strong>
                      <small>{stopText.title}</small>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function LeafletMinistryMap({
  language,
  selected,
  visibleStops,
  onSelect,
}: {
  language: MapLanguage;
  selected: MinistryStop;
  visibleStops: MinistryStop[];
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [32.18, 35.39],
      zoom: 8,
      minZoom: 7,
      maxZoom: 13,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const route = L.polyline(
      ministryStops.map((stop) => [stop.lat, stop.lng]),
      {
        className: "leaflet-ministry-route",
        color: "#d48b1f",
        dashArray: "10 8",
        opacity: 0.9,
        weight: 5,
      },
    ).addTo(map);

    ministryStops.forEach((stop) => {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: createMinistryIcon(stop, false, true),
        keyboard: true,
        title: getMarkerTitle(stop, "zh"),
      });
      marker.bindTooltip(getMarkerLabel(stop, "zh"), {
        className: "real-map-label",
        direction: "top",
        offset: [0, -20],
        permanent: true,
      });
      marker.on("click", () => onSelectRef.current(stop.id));
      marker.addTo(map);
      markersRef.current.set(stop.id, marker);
    });

    map.fitBounds(route.getBounds(), { padding: [28, 28] });

    return () => {
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const visibleIds = new Set(visibleStops.map((stop) => stop.id));
    ministryStops.forEach((stop) => {
      const marker = markersRef.current.get(stop.id);
      if (!marker) {
        return;
      }

      const isSelected = stop.id === selected.id;
      const isVisible = visibleIds.has(stop.id);
      const markerTitle = getMarkerTitle(stop, language);
      marker.setIcon(createMinistryIcon(stop, isSelected, isVisible));
      marker.options.title = markerTitle;
      marker.getElement()?.setAttribute("title", markerTitle);
      marker.getElement()?.setAttribute("aria-label", markerTitle);
      marker.getTooltip()?.setContent(getMarkerLabel(stop, language));
      marker.getTooltip()?.getElement()?.classList.toggle("selected", isSelected);
      marker.getTooltip()?.getElement()?.classList.toggle("muted", !isVisible);
    });

    const targetStops = visibleStops.length ? visibleStops : ministryStops;
    const bounds = L.latLngBounds(targetStops.map((stop) => [stop.lat, stop.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { maxZoom: 10, padding: [36, 36] });
    }
  }, [language, selected.id, visibleStops]);

  useEffect(() => {
    mapRef.current?.panTo([selected.lat, selected.lng], { animate: true });
  }, [selected.lat, selected.lng]);

  return (
    <div className="real-map-wrap">
      <div className="real-map" ref={containerRef} />
      <div className="map-attribution-note">{pageCopy[language].attribution}</div>
    </div>
  );
}

function createMinistryIcon(stop: MinistryStop, selected: boolean, visible: boolean) {
  return L.divIcon({
    className: cn("real-map-marker", {
      selected,
      muted: !visible,
    }),
    html: `<span>${stop.order}</span>`,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
  });
}

function getStopText(stop: MinistryStop, language: MapLanguage): StopText {
  if (language === "zh") {
    return {
      place: stop.place,
      region: stop.region,
      scripture: stop.scripture,
      title: stop.title,
      summary: stop.summary,
      events: stop.events,
    };
  }

  return stopTranslations[stop.id];
}

function getPhaseLabel(phase: MinistryPhase, language: MapLanguage) {
  return phaseLabels[phase][language];
}

function getMarkerLabel(stop: MinistryStop, language: MapLanguage) {
  return getStopText(stop, language).place;
}

function getMarkerTitle(stop: MinistryStop, language: MapLanguage) {
  const stopText = getStopText(stop, language);
  return `${stop.order}. ${stopText.place}: ${stopText.title}`;
}
