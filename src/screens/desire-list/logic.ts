import { CATEGORIES, STAGES, type DesireCategory, type DesireStage } from "./data";

export type Selections = Record<string, string[]>;

export type DesirePlayer = {
  id: string;
  nickname: string;
  selections: Selections;
  isHost?: boolean;
  demo?: boolean;
};

export type Players = Record<string, DesirePlayer>;

type Totals = Record<DesireCategory, number>;

function emptyTotals(): Totals {
  return Object.keys(CATEGORIES).reduce((total, key) => ({ ...total, [key]: 0 }), {} as Totals);
}

export function stageCounts(stage: DesireStage, players: Players) {
  const counts: Record<string, number> = {};
  stage.choices.forEach((choice) => {
    counts[choice[0]] = 0;
  });

  Object.values(players).forEach((player) => {
    (player.selections?.[stage.id] ?? []).forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1;
    });
  });

  return counts;
}

export function statsForSelections(selections: Selections) {
  const totals = emptyTotals();
  const faithStages: string[] = [];
  const righteousnessStages: string[] = [];

  STAGES.forEach((stage) => {
    (selections[stage.id] ?? []).forEach((id) => {
      const choice = stage.choices.find((item) => item[0] === id);
      if (!choice) {
        return;
      }

      totals[choice[3]] += 1;
      if (choice[3] === "faith" && !faithStages.includes(stage.id)) {
        faithStages.push(stage.id);
      }
      if (choice[3] === "righteousness" && !righteousnessStages.includes(stage.id)) {
        righteousnessStages.push(stage.id);
      }
    });
  });

  return { totals, faithStages, righteousnessStages };
}

export function stageCategoryPercents(players: Players) {
  return STAGES.map((stage) => {
    const totals = emptyTotals();
    let selections = 0;

    Object.values(players).forEach((player) => {
      (player.selections?.[stage.id] ?? []).forEach((id) => {
        const choice = stage.choices.find((item) => item[0] === id);
        if (!choice) {
          return;
        }

        totals[choice[3]] += 1;
        selections += 1;
      });
    });

    return { stage, t: totals, selections: selections || 1 };
  });
}

export function personalAnalysis(stats: ReturnType<typeof statsForSelections>) {
  const faithCount = stats.faithStages.length;
  const righteousnessCount = stats.righteousnessStages.length;

  if (faithCount === 3) {
    return "三個階段中，你都為聚會、禱告或靈修保留了位置。當人生選項越來越多時，你仍持續選擇親近神。接下來可思想：這些渴望如何成為實際生活節奏？";
  }
  if (faithCount >= 1 && !stats.faithStages.includes("adult")) {
    return "你曾將信仰放入重要選擇中，但隨著責任與機會增加，信仰操練在最後階段被其他追求取代。工作與家庭都是美好的；問題是，忙碌中是否仍為神保留位置？";
  }
  if (faithCount === 1 && stats.faithStages.includes("adult")) {
    return "在人生責任增加後，你將信仰操練放回重要選擇。這提醒我們：成熟與壓力，也可能使人重新察覺自己需要神。";
  }
  if (faithCount === 0 && righteousnessCount >= 2) {
    return "你多次選擇誠信、憐憫或服事，顯示你在意合宜的生命與別人的需要。可繼續思想：行義與親近神，如何在生命中彼此支持？";
  }
  if (faithCount === 0 && righteousnessCount === 0) {
    return "你的選擇多集中在自己所擁有、成就或關係。這些並非壞事；八福邀請我們追問：除了得到更多，我是否也渴望神所喜悅的生命？";
  }
  return "你在不同階段保留了部分信仰與行義的追求，也讓其他人生重要事項進入清單。請思想：什麼情況最容易擠走你對神與義的渴望？";
}
