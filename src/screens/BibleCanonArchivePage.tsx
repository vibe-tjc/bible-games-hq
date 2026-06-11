import { type CSSProperties, type PointerEvent, useEffect, useMemo, useState } from "react";
import {
  canonBooks,
  canonCategories,
  testamentLabels,
  type CanonBook,
  type CanonCategoryId,
  type TestamentKey,
} from "../data/bibleCanon";
import { cn } from "../lib/utils";

type GameMode = "easy" | "full";
type PileKey = CanonCategoryId | TestamentKey;

type PileMeta = {
  name: string;
  testament: TestamentKey;
  color: string;
  total: number;
};

type DragState = {
  book: CanonBook;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  symbol: string;
};

const HAND_SIZE = 6;
const BOOK_TOTAL = canonBooks.length;
type PlacedBooks = Partial<Record<PileKey, CanonBook[]>>;

function shuffleBooks() {
  const next = canonBooks.slice();

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function pileKeys(mode: GameMode): PileKey[] {
  return mode === "easy" ? ["ot", "nt"] : canonCategories.map((category) => category.id);
}

function createPlaced(mode: GameMode) {
  return Object.fromEntries(pileKeys(mode).map((key) => [key, [] as CanonBook[]])) as PlacedBooks;
}

function categoryOf(book: CanonBook, mode: GameMode): PileKey {
  return mode === "easy" ? book.testament : book.cat;
}

function pileMeta(key: PileKey, mode: GameMode): PileMeta {
  if (mode === "easy") {
    return key === "ot"
      ? { name: "舊約全書", testament: "ot", color: "#8c3b2e", total: 39 }
      : { name: "新約全書", testament: "nt", color: "#2f4f6b", total: 27 };
  }

  const category = canonCategories.find((item) => item.id === key);

  if (!category) {
    throw new Error(`Unknown pile key: ${key}`);
  }

  return {
    name: category.name,
    testament: category.testament,
    color: category.color,
    total: canonBooks.filter((book) => book.cat === key).length,
  };
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function shade(hex: string, amount: number) {
  const numeric = Number.parseInt(hex.slice(1), 16);
  const red = Math.min(255, Math.max(0, (numeric >> 16) + amount));
  const green = Math.min(255, Math.max(0, ((numeric >> 8) & 255) + amount));
  const blue = Math.min(255, Math.max(0, (numeric & 255) + amount));

  return `rgb(${red}, ${green}, ${blue})`;
}

function doneCount(placed: PlacedBooks) {
  return Object.values(placed).reduce((total, books) => total + books.length, 0);
}

export function BibleCanonArchivePage() {
  const [mode, setMode] = useState<GameMode>("full");
  const [showStart, setShowStart] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [deck, setDeck] = useState<CanonBook[]>([]);
  const [hand, setHand] = useState<CanonBook[]>([]);
  const [placed, setPlaced] = useState(() => createPlaced("full"));
  const [revealed, setRevealed] = useState(() => new Set<string>());
  const [misses, setMisses] = useState(0);
  const [hints, setHints] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAbbr, setSelectedAbbr] = useState<string | null>(null);
  const [modalBook, setModalBook] = useState<CanonBook | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hintPile, setHintPile] = useState<PileKey | null>(null);
  const [rejectPile, setRejectPile] = useState<PileKey | null>(null);
  const [hoverPile, setHoverPile] = useState<PileKey | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const groups = useMemo(() => {
    if (mode === "easy") {
      return [["ot"], ["nt"]] as PileKey[][];
    }

    return [
      canonCategories
        .filter((category) => category.testament === "ot")
        .map((category) => category.id),
      canonCategories
        .filter((category) => category.testament === "nt")
        .map((category) => category.id),
    ];
  }, [mode]);

  const totalDone = doneCount(placed);

  useEffect(() => {
    if (!startTime || finished) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 500);

    return () => window.clearInterval(timerId);
  }, [finished, startTime]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  useEffect(() => {
    if (!hintPile) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setHintPile(null), 1800);
    return () => window.clearTimeout(timerId);
  }, [hintPile]);

  useEffect(() => {
    if (!rejectPile) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setRejectPile(null), 360);
    return () => window.clearTimeout(timerId);
  }, [rejectPile]);

  useEffect(() => {
    if (sparkles.length === 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setSparkles([]), 1200);
    return () => window.clearTimeout(timerId);
  }, [sparkles]);

  const showToast = (message: string) => setToast(message);

  const startGame = (nextMode: GameMode) => {
    const shuffled = shuffleBooks();
    const nextStart = Date.now();

    setMode(nextMode);
    setPlaced(createPlaced(nextMode));
    setDeck(shuffled.slice(HAND_SIZE));
    setHand(shuffled.slice(0, HAND_SIZE));
    setRevealed(new Set());
    setMisses(0);
    setHints(0);
    setElapsedMs(0);
    setStartTime(nextStart);
    setFinished(false);
    setSelectedAbbr(null);
    setModalBook(null);
    setShowStart(false);
    setShowWin(false);
  };

  const addSparkles = (pileElement: HTMLElement | null) => {
    if (!pileElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = pileElement.getBoundingClientRect();
    const symbols = ["✦", "✧", "❉"];

    setSparkles(
      Array.from({ length: 6 }, (_, index) => ({
        id: Date.now() + index,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        dx: Math.random() * 120 - 60,
        dy: -30 - Math.random() * 70,
        symbol: symbols[index % symbols.length],
      })),
    );
  };

  const tryPlace = (book: CanonBook, key: PileKey, pileElement: HTMLElement | null) => {
    if (finished) {
      return;
    }

    if (categoryOf(book, mode) !== key) {
      setMisses((value) => value + 1);
      setRejectPile(key);
      showToast(`《${book.name}》不在這座書架上，再想想看 ─ 點「卷」鈕可看主題提示`);
      return;
    }

    const meta = pileMeta(key, mode);
    const nextPileLength = (placed[key]?.length ?? 0) + 1;
    const nextDone = totalDone + 1;
    const nextHand = hand.filter((item) => item.abbr !== book.abbr);
    const [nextBook, ...nextDeck] = deck;

    if (nextBook) {
      nextHand.push(nextBook);
    }

    setPlaced((current) => ({
      ...current,
      [key]: [...(current[key] ?? []), book],
    }));
    setRevealed((current) => new Set(current).add(book.abbr));
    setHand(nextHand);
    setDeck(nextDeck);
    setSelectedAbbr((current) => (current === book.abbr ? null : current));
    addSparkles(pileElement);

    if (nextPileLength === meta.total) {
      showToast(`「${meta.name}」全數歸檔完成！`);
    }

    if (nextDone === BOOK_TOTAL) {
      setFinished(true);
      setElapsedMs(startTime ? Date.now() - startTime : elapsedMs);
      window.setTimeout(() => setShowWin(true), 600);
    }
  };

  const handlePileClick = (key: PileKey, pileElement: HTMLElement | null) => {
    if (!selectedAbbr) {
      return;
    }

    const book = hand.find((item) => item.abbr === selectedAbbr);

    if (book) {
      tryPlace(book, key, pileElement);
    }
  };

  const handleHint = () => {
    if (finished) {
      return;
    }

    const book = hand.find((item) => item.abbr === selectedAbbr) ?? hand[0];

    if (!book) {
      return;
    }

    const key = categoryOf(book, mode);
    const element = document.querySelector<HTMLElement>(`[data-canon-pile-key="${key}"]`);

    setHints((value) => value + 1);
    setHintPile(key);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast(`提示：《${book.name}》的家在閃光的書架`);
  };

  const handleRestart = () => {
    setFinished(true);
    setShowStart(true);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, book: CanonBook) => {
    if ((event.target as HTMLElement).closest(".canon-info-btn")) {
      return;
    }

    const source = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const width = source.offsetWidth;
    const height = source.offsetHeight;
    let isDragging = false;
    let currentHover: PileKey | null = null;

    const move = (moveEvent: globalThis.PointerEvent) => {
      if (!isDragging) {
        if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 7) {
          return;
        }

        isDragging = true;
      }

      setDragging({
        book,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
        width,
        height,
      });

      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const pile = target?.closest<HTMLElement>("[data-canon-pile-key]");
      const key = pile?.dataset.canonPileKey as PileKey | undefined;
      currentHover = key ?? null;
      setHoverPile(currentHover);
      moveEvent.preventDefault();
    };

    const up = (upEvent: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setDragging(null);
      setHoverPile(null);

      if (!isDragging || !currentHover) {
        return;
      }

      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const pile = target?.closest<HTMLElement>("[data-canon-pile-key]");
      tryPlace(book, currentHover, pile ?? null);
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const winTime = startTime ? formatTime(elapsedMs || Date.now() - startTime) : "—";

  return (
    <section className="canon-game" aria-label="經卷歸檔">
      <header className="canon-header">
        <div className="canon-title-block">
          <h1 className="canon-serif">
            <span className="canon-deco">❧</span> 經卷歸檔 <span className="canon-deco">❧</span>
          </h1>
          <div className="canon-subtitle">聖經六十六卷．分類牌局</div>
        </div>
        <div className="canon-spacer" />
        <div className="canon-stats">
          <div>
            ⏱ <b>{formatTime(elapsedMs)}</b>
          </div>
          <div>
            已歸檔 <b>{totalDone}</b>/<b>{BOOK_TOTAL}</b>
          </div>
          <div>
            失誤 <b>{misses}</b>
          </div>
        </div>
        <button className="canon-btn" onClick={handleHint}>
          💡 提示
        </button>
        <button className="canon-btn" onClick={handleRestart}>
          ↺ 重新開始
        </button>
      </header>

      <main className={cn("canon-main", { "canon-easy-mode": mode === "easy" })}>
        <div className="canon-shelves">
          {(["ot", "nt"] as TestamentKey[]).map((testament, groupIndex) => (
            <section className={cn("canon-testament", testament)} key={testament}>
              <div className="canon-testament-label canon-serif">
                <span>{testamentLabels[testament]}</span>
                <span className="canon-rule" />
                <span className="canon-count">{testament === "ot" ? 39 : 27} 卷</span>
              </div>
              <div className={cn("canon-piles", { "single-pile": mode === "easy" })}>
                {groups[groupIndex].map((key) => {
                  const meta = pileMeta(key, mode);
                  const books = (placed[key] ?? []).slice().sort((a, b) => a.order - b.order);
                  const isComplete = books.length === meta.total;

                  return (
                    <button
                      className={cn("canon-pile", {
                        complete: isComplete,
                        "droppable-hover": hoverPile === key,
                        hinted: hintPile === key,
                        reject: rejectPile === key,
                      })}
                      data-canon-pile-key={key}
                      key={key}
                      onClick={(event) => handlePileClick(key, event.currentTarget)}
                      type="button"
                    >
                      <span className="canon-pile-name">{meta.name}</span>
                      <span className="canon-pile-count">
                        <span>{books.length}</span> / {meta.total}
                      </span>
                      <span className="canon-spines">
                        {books.map((book) => (
                          <span
                            className="canon-spine"
                            key={book.abbr}
                            onClick={(event) => {
                              event.stopPropagation();
                              setModalBook(book);
                            }}
                            style={{
                              height: `${(mode === "easy" ? 34 : 46) - (book.order % 3) * 3}px`,
                              background: `linear-gradient(180deg, ${shade(meta.color, 18)}, ${meta.color})`,
                            }}
                            title={book.name}
                          >
                            <span className="canon-spine-txt">{book.abbr}</span>
                          </span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <div className="canon-hand-area">
        <div className="canon-hand-inner">
          <div className="canon-deck-stack">
            <div>牌堆</div>
            <div className="canon-deck-n">{deck.length}</div>
            <div>卷</div>
          </div>
          <div className="canon-hand">
            {hand.map((book) => (
              <div
                className={cn("canon-card", {
                  selected: selectedAbbr === book.abbr,
                  "dragging-source": dragging?.book.abbr === book.abbr,
                })}
                key={book.abbr}
                onClick={() =>
                  setSelectedAbbr((current) => (current === book.abbr ? null : book.abbr))
                }
                onPointerDown={(event) => handlePointerDown(event, book)}
              >
                <div className="canon-corner">第{book.order + 1}卷</div>
                <button
                  aria-label={`查看 ${book.name} 主題`}
                  className="canon-info-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    setModalBook(book);
                  }}
                  type="button"
                >
                  卷
                </button>
                <div className={cn("canon-abbr", { small: book.abbr.length >= 2 })}>
                  {book.abbr}
                </div>
                <div className="canon-full">{book.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="canon-hand-tip">
          拖曳卡片到正確的分類書架；或先點選卡片、再點書架。點 <b>卷</b>{" "}
          字角落的「卷」鈕可查看經卷主題。
        </div>
      </div>

      {modalBook ? (
        <div className="canon-overlay show" onClick={() => setModalBook(null)}>
          <div
            aria-modal="true"
            className="canon-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="關閉"
              className="canon-modal-close"
              onClick={() => setModalBook(null)}
              type="button"
            >
              ✕
            </button>
            <div className="canon-modal-abbr canon-serif">{modalBook.abbr}</div>
            <div className="canon-modal-name">
              {modalBook.name}（第 {modalBook.order + 1} 卷）
            </div>
            {revealed.has(modalBook.abbr) ? (
              <span className={cn("canon-modal-cat", modalBook.testament)}>
                {testamentLabels[modalBook.testament]}・
                {canonCategories.find((category) => category.id === modalBook.cat)?.name}
              </span>
            ) : (
              <span className="canon-modal-cat locked">分類？歸檔後揭曉</span>
            )}
            <div className="canon-modal-theme">
              <b>主題：</b>
              {modalBook.theme}
            </div>
            <div className="canon-modal-src">
              主題摘要參考：真耶穌教會（喜信網路家庭 joy.org.tw）聖經導讀方向整理
            </div>
          </div>
        </div>
      ) : null}

      {showStart ? (
        <div className="canon-overlay show">
          <div className="canon-panel">
            <h2>經卷歸檔</h2>
            <div className="canon-panel-sub">
              聖經共六十六卷，像一座分門別類的書房。
              <br />
              把打散的經卷一一歸回原位，由小而大認識：<b>各卷 → 大分類 → 新舊約</b>。
            </div>
            <div className="canon-mode-grid">
              <button className="canon-mode-card" onClick={() => startGame("easy")} type="button">
                <div className="canon-mode-title">
                  入門・分辨新舊約 <span className="canon-mode-badge nt">2 座書架</span>
                </div>
                <div className="canon-mode-desc">
                  只需判斷每卷書屬於「舊約」或「新約」。適合初次接觸聖經結構的學員暖身。
                </div>
              </button>
              <button className="canon-mode-card" onClick={() => startGame("full")} type="button">
                <div className="canon-mode-title">
                  完整・九大分類 <span className="canon-mode-badge ot">9 座書架</span>
                </div>
                <div className="canon-mode-desc">
                  將六十六卷歸入律法書、歷史書、詩歌智慧書、先知書、福音書、書信……等完整分類。
                </div>
              </button>
            </div>
            <div className="canon-panel-sub canon-panel-note">
              小提醒：隨時可點卡片上的「卷」鈕閱讀經卷主題——看主題猜分類，也是學習的一部分。
            </div>
          </div>
        </div>
      ) : null}

      {showWin ? (
        <div className="canon-overlay show">
          <div className="canon-panel">
            <h2>{mode === "easy" ? "新舊約分辨完成" : "全卷歸檔完成"}</h2>
            <div className="canon-panel-sub">
              「聖經都是神所默示的，於教訓、督責、使人歸正、教導人學義都是有益的。」（提後三16）
            </div>
            <div className="canon-win-stats">
              <div className="canon-win-stat">
                <b>{winTime}</b>
                <span>用時</span>
              </div>
              <div className="canon-win-stat">
                <b>{misses}</b>
                <span>失誤</span>
              </div>
              <div className="canon-win-stat">
                <b>{hints}</b>
                <span>提示</span>
              </div>
            </div>
            <div className="canon-bookwall">
              {(["ot", "nt"] as TestamentKey[]).map((testament) => {
                const books = canonBooks.filter((book) => book.testament === testament);

                return (
                  <div className="canon-shelf-row" key={testament}>
                    <div className="canon-shelf-label canon-serif">
                      {testamentLabels[testament]}全書・{books.length} 卷
                    </div>
                    <div className="canon-shelf-books">
                      {books.map((book) => {
                        const category = canonCategories.find((item) => item.id === book.cat)!;

                        return (
                          <span
                            className="canon-wall-spine"
                            key={book.abbr}
                            style={{
                              height: `${40 - (book.order % 4) * 3}px`,
                              background: `linear-gradient(180deg, ${shade(category.color, 20)}, ${category.color})`,
                            }}
                            title={`${book.name}｜${category.name}`}
                          />
                        );
                      })}
                    </div>
                    <div className="canon-shelf-board" />
                  </div>
                );
              })}
            </div>
            <div className="canon-btn-row">
              <button className="canon-btn primary" onClick={() => startGame(mode)} type="button">
                再玩一次
              </button>
              <button
                className="canon-btn paper"
                onClick={() => {
                  setShowWin(false);
                  setShowStart(true);
                }}
                type="button"
              >
                換個模式
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("canon-toast", { show: toast })}>{toast}</div>

      {dragging ? (
        <div
          className="canon-card canon-drag-ghost"
          style={{
            left: dragging.x,
            top: dragging.y,
            width: dragging.width,
            height: dragging.height,
          }}
        >
          <div className="canon-corner">第{dragging.book.order + 1}卷</div>
          <button className="canon-info-btn" tabIndex={-1} type="button">
            卷
          </button>
          <div className={cn("canon-abbr", { small: dragging.book.abbr.length >= 2 })}>
            {dragging.book.abbr}
          </div>
          <div className="canon-full">{dragging.book.name}</div>
        </div>
      ) : null}

      {sparkles.map((sparkle) => (
        <span
          className="canon-sparkle"
          key={sparkle.id}
          style={
            {
              left: sparkle.x,
              top: sparkle.y,
              "--dx": `${sparkle.dx}px`,
              "--dy": `${sparkle.dy}px`,
            } as CSSProperties
          }
        >
          {sparkle.symbol}
        </span>
      ))}
    </section>
  );
}
