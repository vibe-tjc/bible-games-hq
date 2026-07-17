import { useMemo, useState } from "react";
import { bibleAuthorOccupationMatches } from "../data/bibleAuthors";
import { cn } from "../lib/utils";

type Selection = {
  clueId: string | null;
  personId: string | null;
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
  const [round, setRound] = useState(1);
  const [matchedIds, setMatchedIds] = useState(() => new Set<string>());
  const [selection, setSelection] = useState<Selection>({ clueId: null, personId: null });
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("先讀上方經節線索，再從下方選出對應的人名。");

  const clueCards = useMemo(() => shuffle(bibleAuthorOccupationMatches), [round]);
  const personCards = useMemo(() => shuffle(bibleAuthorOccupationMatches), [round]);
  const isComplete = matchedIds.size === bibleAuthorOccupationMatches.length;

  const resetGame = () => {
    setRound((value) => value + 1);
    setMatchedIds(new Set());
    setSelection({ clueId: null, personId: null });
    setMisses(0);
    setMessage("先讀上方經節線索，再從下方選出對應的人名。");
  };

  const tryMatch = (nextSelection: Selection) => {
    if (!nextSelection.clueId || !nextSelection.personId) {
      setSelection(nextSelection);
      return;
    }

    if (nextSelection.clueId === nextSelection.personId) {
      const item = bibleAuthorOccupationMatches.find((match) => match.id === nextSelection.clueId)!;

      setMatchedIds((current) => new Set(current).add(item.id));
      setSelection({ clueId: null, personId: null });
      setMessage(`配對成功：${item.person}──${item.occupation}。${item.note}`);
      return;
    }

    setMisses((value) => value + 1);
    setSelection({ clueId: null, personId: null });
    setMessage("還不是這一位，再觀察經節中的職業、身份或書卷線索。 ");
  };

  const selectClue = (id: string) => {
    if (matchedIds.has(id)) {
      return;
    }

    tryMatch({ ...selection, clueId: id });
  };

  const selectPerson = (id: string) => {
    if (matchedIds.has(id)) {
      return;
    }

    tryMatch({ ...selection, personId: id });
  };

  return (
    <section className="authors-game" aria-label="聖經作者職業連連看">
      <header className="authors-hero">
        <p className="authors-eyebrow">聖經作者職業連連看</p>
        <h1>神使用各行各業的人寫下祂的話</h1>
        <p>
          聖經的作者與重要見證人來自不同背景：農牧者、醫生、國王、漁夫、稅吏、文士……
          請把「經節線索」與「人名職業」配對起來。
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

      <main className="authors-board">
        <section className="authors-zone" aria-labelledby="authors-clues-title">
          <div className="authors-zone-title">
            <h2 id="authors-clues-title">上方：經節與線索</h2>
            <span>先選一張</span>
          </div>
          <div className="authors-clue-grid">
            {clueCards.map((item) => (
              <button
                className={cn("authors-clue-card", {
                  selected: selection.clueId === item.id,
                  matched: matchedIds.has(item.id),
                })}
                disabled={matchedIds.has(item.id)}
                key={item.id}
                onClick={() => selectClue(item.id)}
                type="button"
              >
                <span className="authors-ref">{item.verseRef}</span>
                <p>「{item.verseText}」</p>
                <small>{item.bookHint}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="authors-zone" aria-labelledby="authors-people-title">
          <div className="authors-zone-title">
            <h2 id="authors-people-title">下方：人名與職業</h2>
            <span>找出對應者</span>
          </div>
          <div className="authors-person-grid">
            {personCards.map((item) => (
              <button
                className={cn("authors-person-card", {
                  selected: selection.personId === item.id,
                  matched: matchedIds.has(item.id),
                })}
                disabled={matchedIds.has(item.id)}
                key={item.id}
                onClick={() => selectPerson(item.id)}
                type="button"
              >
                <strong>{item.person}</strong>
                <span>{item.occupation}</span>
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
