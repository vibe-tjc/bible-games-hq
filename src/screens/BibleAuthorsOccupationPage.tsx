import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { bibleAuthorOccupationMatches } from "../data/bibleAuthors";
import { cn } from "../lib/utils";

type Selection = {
  personId: string | null;
  occupationId: string | null;
};

type MatchLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function shuffle<T>(items: T[]) {
  const next = items.slice();

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function BibleAuthorsOccupationPage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const personRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const occupationRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [round, setRound] = useState(1);
  const [matchedIds, setMatchedIds] = useState(() => new Set<string>());
  const [selection, setSelection] = useState<Selection>({ personId: null, occupationId: null });
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("先點左邊一位人名，再點右邊對應的職業與經節線索。");
  const [matchLines, setMatchLines] = useState<MatchLine[]>([]);
  const [latestMatchId, setLatestMatchId] = useState<string | null>(null);

  const personCards = useMemo(() => shuffle(bibleAuthorOccupationMatches), [round]);
  const occupationCards = useMemo(() => shuffle(bibleAuthorOccupationMatches), [round]);
  const isComplete = matchedIds.size === bibleAuthorOccupationMatches.length;

  useLayoutEffect(() => {
    const updateLines = () => {
      const stage = stageRef.current;

      if (!stage) {
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const nextLines = Array.from(matchedIds).flatMap((id) => {
        const person = personRefs.current[id];
        const occupation = occupationRefs.current[id];

        if (!person || !occupation) {
          return [];
        }

        const personRect = person.getBoundingClientRect();
        const occupationRect = occupation.getBoundingClientRect();

        return [
          {
            id,
            x1: personRect.right - stageRect.left,
            y1: personRect.top + personRect.height / 2 - stageRect.top,
            x2: occupationRect.left - stageRect.left,
            y2: occupationRect.top + occupationRect.height / 2 - stageRect.top,
          },
        ];
      });

      setMatchLines(nextLines);
    };

    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [matchedIds, round]);

  const resetGame = () => {
    setRound((value) => value + 1);
    setMatchedIds(new Set());
    setSelection({ personId: null, occupationId: null });
    setMisses(0);
    setMessage("先點左邊一位人名，再點右邊對應的職業與經節線索。");
    setLatestMatchId(null);
    setMatchLines([]);
  };

  const tryMatch = (nextSelection: Selection) => {
    if (!nextSelection.personId || !nextSelection.occupationId) {
      setSelection(nextSelection);
      return;
    }

    if (nextSelection.personId === nextSelection.occupationId) {
      const item = bibleAuthorOccupationMatches.find(
        (match) => match.id === nextSelection.personId,
      )!;

      setMatchedIds((current) => new Set(current).add(item.id));
      setSelection({ personId: null, occupationId: null });
      setLatestMatchId(item.id);
      setMessage(`配對成功：${item.person}──${item.occupation}。${item.note}`);
      return;
    }

    setMisses((value) => value + 1);
    setSelection({ personId: null, occupationId: null });
    setLatestMatchId(null);
    setMessage("還不是這一組，再觀察右邊經節中的職業、身份或書卷線索。");
  };

  const selectPerson = (id: string) => {
    if (matchedIds.has(id)) {
      return;
    }

    tryMatch({ ...selection, personId: id });
  };

  const selectOccupation = (id: string) => {
    if (matchedIds.has(id)) {
      return;
    }

    tryMatch({ ...selection, occupationId: id });
  };

  return (
    <section className="authors-game" aria-label="聖經作者職業連連看">
      <header className="authors-hero">
        <p className="authors-eyebrow">聖經作者職業連連看</p>
        <h1>神使用各行各業的人寫下祂的話</h1>
        <p>
          聖經的作者與重要見證人來自不同背景：農牧者、醫生、國王、漁夫、稅吏、文士……
          請把左邊的「人名」連到右邊對應的「職業與經節線索」。
        </p>
        <div className="authors-toolbar">
          <span>
            已完成 <b>{matchedIds.size}</b> / {bibleAuthorOccupationMatches.length}
          </span>
          <span>
            失誤 <b>{misses}</b>
          </span>
          <button type="button" onClick={resetGame}>
            重新洗牌
          </button>
        </div>
      </header>

      <div className={cn("authors-message", { complete: isComplete })}>
        {isComplete ? "全部配對完成！你看見神能使用各種職業與背景的人。" : message}
      </div>

      <main className="authors-match-stage" ref={stageRef}>
        <svg className="authors-lines" aria-hidden="true">
          {matchLines.map((line) => {
            const midX = (line.x1 + line.x2) / 2;
            return (
              <path
                className={cn("authors-match-line", { latest: line.id === latestMatchId })}
                key={line.id}
                d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                pathLength={1}
              />
            );
          })}
        </svg>

        <section className="authors-zone authors-person-zone" aria-labelledby="authors-people-title">
          <div className="authors-zone-title">
            <h2 id="authors-people-title">人名</h2>
            <span>先點這邊</span>
          </div>
          <div className="authors-person-column">
            {personCards.map((item) => (
              <button
                className={cn("authors-person-card", {
                  selected: selection.personId === item.id,
                  matched: matchedIds.has(item.id),
                })}
                disabled={matchedIds.has(item.id)}
                key={item.id}
                onClick={() => selectPerson(item.id)}
                ref={(element) => {
                  personRefs.current[item.id] = element;
                }}
                type="button"
              >
                <span className="authors-illus" aria-hidden="true">
                  {item.personIcon}
                </span>
                <span className="authors-person-text">
                  <strong>{item.person}</strong>
                  <span>{item.bookHint}</span>
                </span>
                <span className="authors-dot authors-dot-right" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <section
          className="authors-zone authors-occupation-zone"
          aria-labelledby="authors-occupations-title"
        >
          <div className="authors-zone-title">
            <h2 id="authors-occupations-title">職業與經節線索</h2>
            <span>再點這邊</span>
          </div>
          <div className="authors-occupation-column">
            {occupationCards.map((item) => (
              <button
                className={cn("authors-occupation-card", {
                  selected: selection.occupationId === item.id,
                  matched: matchedIds.has(item.id),
                })}
                disabled={matchedIds.has(item.id)}
                key={item.id}
                onClick={() => selectOccupation(item.id)}
                ref={(element) => {
                  occupationRefs.current[item.id] = element;
                }}
                type="button"
              >
                <span className="authors-dot authors-dot-left" aria-hidden="true" />
                <span className="authors-illus authors-illus-job" aria-hidden="true">
                  {item.occupationIcon}
                </span>
                <span className="authors-occupation-text">
                  <span className="authors-job">{item.occupation}</span>
                  <span className="authors-ref">{item.verseRef}</span>
                  <p>「{item.verseText}」</p>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="authors-note">
        註：部分書卷作者採傳統歸屬或書中人物線索整理；遊戲重點在認識神如何使用不同背景的人事奉祂。
      </footer>
    </section>
  );
}
