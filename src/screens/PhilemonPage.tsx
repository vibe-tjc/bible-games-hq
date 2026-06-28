import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, RotateCcw, Send, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type Scene = {
  id: string;
  title: string;
  verse: string;
  detail: string;
};

type Question = {
  prompt: string;
  options: string[];
  answer: string;
  explain: string;
};

const story: Scene[] = [
  {
    id: "paul-prison",
    title: "保羅在捆鎖中寫信",
    verse: "門 1、9",
    detail: "保羅不是用命令壓人，而是以愛心為阿尼西母代求。",
  },
  {
    id: "onesimus-away",
    title: "阿尼西母離開腓利門",
    verse: "門 11、18",
    detail: "他曾經虧負主人，名字雖意為「有益處」，當時卻成了「無益」。",
  },
  {
    id: "new-life",
    title: "阿尼西母遇見福音而更新",
    verse: "門 10–11",
    detail: "保羅稱他為「我在捆鎖中所生的兒子」，如今在主裡成為有益的人。",
  },
  {
    id: "send-back",
    title: "保羅差他回到腓利門身邊",
    verse: "門 12–14",
    detail: "真正的和好不逃避關係，而是在愛裡面對、修復與承擔。",
  },
  {
    id: "receive-brother",
    title: "請接納他如親愛的弟兄",
    verse: "門 15–17",
    detail: "福音把主僕關係提升為主內家人的關係。",
  },
  {
    id: "paul-pay",
    title: "若有虧欠，算在保羅帳上",
    verse: "門 18–19",
    detail: "保羅以代償的愛實際承擔代價，成為基督之愛的見證。",
  },
];

const questions: Question[] = [
  {
    prompt: "保羅在信中最主要為誰代求？",
    options: ["提摩太", "阿尼西母", "亞腓亞", "亞基布"],
    answer: "阿尼西母",
    explain: "保羅稱阿尼西母為在捆鎖中所生的兒子，求腓利門接納他。",
  },
  {
    prompt: "保羅希望腓利門怎樣接待阿尼西母？",
    options: ["只當作僕人", "當作外人", "如同接待保羅、如親愛的弟兄", "立刻審判他"],
    answer: "如同接待保羅、如親愛的弟兄",
    explain: "門 16–17 強調不再只是奴僕，乃是高過奴僕，是親愛的弟兄。",
  },
  {
    prompt: "保羅處理衝突時，主要倚靠什麼方式？",
    options: ["權柄命令", "愛心勸勉", "利益交換", "群眾壓力"],
    answer: "愛心勸勉",
    explain: "門 8–9 說保羅雖可吩咐，卻寧可憑愛心求腓利門。",
  },
  {
    prompt: "「若虧負你，或欠你什麼，都歸在我的帳上」表現了什麼？",
    options: ["推卸責任", "代償與承擔", "逃避問題", "交易技巧"],
    answer: "代償與承擔",
    explain: "保羅願意替阿尼西母承擔虧欠，讓和好有實際行動。",
  },
];

function shuffle<T>(items: T[]) {
  const next = items.slice();

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function sameOrder(items: Scene[]) {
  return items.every((item, index) => item.id === story[index].id);
}

export function PhilemonPage() {
  const [cards, setCards] = useState(() => shuffle(story));
  const [checkedOrder, setCheckedOrder] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const orderCorrect = sameOrder(cards);
  const quizScore = questions.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0,
  );
  const completed = orderCorrect && showResult && quizScore === questions.length;
  const encouragement = useMemo(() => {
    if (!showResult) {
      return "先整理書信脈絡，再完成和好測驗。";
    }

    if (completed) {
      return "你已完成腓利門書的和好任務！";
    }

    return "再檢查一次：福音的愛會帶出接納、更新與承擔。";
  }, [completed, showResult]);

  function moveCard(from: number, to: number) {
    setCheckedOrder(false);
    setCards((current) => {
      const next = current.slice();
      const [picked] = next.splice(from, 1);
      next.splice(to, 0, picked);
      return next;
    });
  }

  function resetGame() {
    setCards(shuffle(story));
    setCheckedOrder(false);
    setAnswers({});
    setShowResult(false);
  }

  return (
    <section className="philemon-game">
      <div className="philemon-wrap">
        <Link to="/" className="back-link philemon-back">
          <ArrowLeft aria-hidden="true" size={18} />
          回首頁
        </Link>

        <div className="philemon-hero">
          <div>
            <p className="eyebrow">腓利門書互動遊戲</p>
            <h1>和好信使：把阿尼西母帶回愛中</h1>
            <p>
              依照腓利門書的書信脈絡排序事件，再回答重點問題，體會保羅如何用愛心、接納與代償促成和好。
            </p>
          </div>
          <div className="philemon-score" aria-label="目前進度">
            <Sparkles aria-hidden="true" size={24} />
            <strong>{quizScore + (orderCorrect ? 1 : 0)}</strong>
            <span>/ {questions.length + 1}</span>
          </div>
        </div>

        <div className="philemon-grid">
          <Card className="philemon-panel">
            <div className="philemon-section-title">
              <Send aria-hidden="true" size={22} />
              <div>
                <h2>任務一：排列書信劇情</h2>
                <p>把六張卡片排成合理順序。可用上下按鈕移動卡片。</p>
              </div>
            </div>

            <ol className="philemon-timeline">
              {cards.map((scene, index) => (
                <li className="philemon-scene" key={scene.id}>
                  <span className="philemon-step">{index + 1}</span>
                  <div>
                    <h3>{scene.title}</h3>
                    <p>{scene.detail}</p>
                    <small>{scene.verse}</small>
                  </div>
                  <div className="philemon-move">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCard(index, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === cards.length - 1}
                      onClick={() => moveCard(index, index + 1)}
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <div className="philemon-actions">
              <Button variant="secondary" onClick={() => setCheckedOrder(true)}>
                檢查順序
              </Button>
              <Button variant="ghost" onClick={() => setCards(story)}>
                顯示標準順序
              </Button>
            </div>
            {checkedOrder && (
              <p className={`philemon-feedback ${orderCorrect ? "is-good" : "is-warn"}`}>
                {orderCorrect
                  ? "順序正確！可以進入和好測驗。"
                  : "還可以再想想：先有虧欠與更新，才有回到關係中的接納。"}
              </p>
            )}
          </Card>

          <Card className="philemon-panel">
            <div className="philemon-section-title">
              <CheckCircle2 aria-hidden="true" size={22} />
              <div>
                <h2>任務二：和好測驗</h2>
                <p>選出最符合腓利門書信息的答案。</p>
              </div>
            </div>

            <div className="philemon-quiz">
              {questions.map((question, questionIndex) => (
                <fieldset className="philemon-question" key={question.prompt}>
                  <legend>{question.prompt}</legend>
                  {question.options.map((option) => {
                    const selected = answers[questionIndex] === option;
                    const correct = showResult && option === question.answer;
                    const wrong = showResult && selected && option !== question.answer;

                    return (
                      <label
                        className={`philemon-option${selected ? " is-selected" : ""}${correct ? " is-correct" : ""}${wrong ? " is-wrong" : ""}`}
                        key={option}
                      >
                        <input
                          type="radio"
                          name={`philemon-${questionIndex}`}
                          checked={selected}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [questionIndex]: option }))
                          }
                        />
                        {option}
                      </label>
                    );
                  })}
                  {showResult && <p className="philemon-explain">{question.explain}</p>}
                </fieldset>
              ))}
            </div>

            <div className="philemon-actions">
              <Button
                onClick={() => setShowResult(true)}
                disabled={Object.keys(answers).length < questions.length}
              >
                送出測驗
              </Button>
              <Button variant="ghost" onClick={resetGame}>
                <RotateCcw aria-hidden="true" size={16} />
                重新開始
              </Button>
            </div>
          </Card>
        </div>

        <Card className={`philemon-result${completed ? " is-complete" : ""}`}>
          <strong>{encouragement}</strong>
          <span>
            劇情排序：{orderCorrect ? "完成" : "未完成"} · 測驗：
            {showResult ? `${quizScore}/${questions.length}` : "尚未送出"}
          </span>
        </Card>
      </div>
    </section>
  );
}
