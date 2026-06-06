export type DesireCategory =
  | "possession"
  | "achievement"
  | "relationship"
  | "faith"
  | "righteousness";

export type DesireChoice = readonly [
  id: string,
  title: string,
  description: string,
  category: DesireCategory,
  tag: string,
];

export type DesireStage = {
  id: "student" | "youngAdult" | "adult";
  label: string;
  title: string;
  question: string;
  intro: string;
  choices: DesireChoice[];
};

export const STAGES: DesireStage[] = [
  {
    id: "student",
    label: "第一階段",
    title: "學生時期",
    question: "我現在最想要什麼？",
    intro:
      "你正在成長。朋友、成績、娛樂、家人的肯定，以及你與神的關係，都在你的生活中出現。請選出最想保留的追求。",
    choices: [
      ["allowance", "更多零用錢", "可以買喜歡的東西", "possession", "money"],
      ["friends", "真正的好朋友", "有人理解與陪伴你", "relationship", "companionship"],
      ["popular", "很受歡迎", "在群體中被喜歡", "achievement", "recognition"],
      ["grades", "成績進步", "得到肯定並達成目標", "achievement", "career"],
      ["gaming", "更多遊戲與手機時間", "享受娛樂與放鬆", "possession", "comfort"],
      ["appearance", "好看的外表與穿搭", "在別人眼中更有魅力", "achievement", "recognition"],
      ["familyPraise", "家人的關心與肯定", "感受到支持與歸屬", "relationship", "family"],
      ["worship", "參加聚會", "保持與信仰群體的連結", "faith", "worship"],
      ["prayer", "禱告生活", "把心裡的事帶到神面前", "faith", "prayer"],
      ["devotion", "讀經與靈修", "認識神的話語", "faith", "devotion"],
      ["care", "幫助被忽略的人", "注意到別人的需要", "righteousness", "mercy"],
      ["honesty", "誠實，即使吃虧", "沒有掌聲也選擇正確", "righteousness", "integrity"],
      ["reconcile", "與人和好", "不讓傷害持續擴大", "righteousness", "peace"],
    ],
  },
  {
    id: "youngAdult",
    label: "第二階段",
    title: "青年／初入社會",
    question: "當人生開始變忙",
    intro:
      "選擇增加、壓力也增加：收入、感情、學歷、人際與未來方向。原本重視的事，現在是否仍有位置？",
    choices: [
      ["salary", "穩定薪水", "能負擔自己的生活", "possession", "money"],
      ["highpay", "高薪工作", "擁有更多選擇與享受", "possession", "money"],
      ["romance", "戀愛關係", "找到喜歡並理解你的人", "relationship", "companionship"],
      ["network", "豐富社交生活", "擴大人際圈與機會", "achievement", "recognition"],
      ["degree", "理想學歷或證照", "為未來打下基礎", "achievement", "career"],
      ["dreamjob", "喜歡的工作", "投入有興趣的方向", "achievement", "career"],
      ["social", "社群人氣", "被更多人注意與認同", "achievement", "recognition"],
      ["travel", "旅行與休閒", "過精彩有質感的生活", "possession", "comfort"],
      ["familyTime", "陪伴家人", "不讓忙碌切斷關係", "relationship", "family"],
      ["worship2", "固定參加聚會", "在忙碌中仍分別時間給神", "faith", "worship"],
      ["prayer2", "固定禱告", "在壓力中仍尋求神", "faith", "prayer"],
      ["devotion2", "讀經與靈修", "讓信仰不只停留於習慣", "faith", "devotion"],
      ["honesty2", "誠實面對學業與工作", "不因利益而欺騙", "righteousness", "integrity"],
      ["serve2", "關心弱勢與服事", "將時間給有需要的人", "righteousness", "mercy"],
      ["principle2", "持守信仰原則", "即使不同也不妥協", "righteousness", "courage"],
    ],
  },
  {
    id: "adult",
    label: "第三階段",
    title: "成人／事業家庭期",
    question: "當你擁有更多，也承擔更多",
    intro: "金錢、家庭、工作、影響力與責任都變得真實。當每一項都看似重要時，你最後仍會留下什麼？",
    choices: [
      ["income", "高收入", "擁有更充裕的生活", "possession", "money"],
      ["freedom", "財務自由", "不再被金錢壓力限制", "possession", "money"],
      ["promotion", "升遷與領導地位", "擁有成就與影響力", "achievement", "career"],
      ["startup", "創業成功", "建立自己的事業", "achievement", "career"],
      ["marriage", "幸福婚姻與家庭", "擁有穩定親密的家", "relationship", "family"],
      ["children", "孩子的成就", "看見下一代成功", "relationship", "family"],
      ["house", "房子與舒適生活", "擁有理想生活環境", "possession", "comfort"],
      ["status", "社會地位與肯定", "被人尊重與看重", "achievement", "recognition"],
      ["health", "健康與體力", "顧好身體，才能走得長遠", "possession", "comfort"],
      ["parents", "照顧年邁父母", "陪伴並回報養育之恩", "relationship", "family"],
      ["retirement", "退休與理財規劃", "為晚年生活預作準備", "possession", "money"],
      ["selffulfil", "自我實現與夢想", "完成心中未竟的夢想", "achievement", "career"],
      ["worship3", "穩定聚會", "即使忙碌仍親近神", "faith", "worship"],
      ["prayer3", "禱告與倚靠神", "在責任中仍尋求神", "faith", "prayer"],
      ["devotion3", "靈修與信仰傳承", "讓信仰影響家庭生命", "faith", "devotion"],
      ["legacy", "信仰的傳承", "把所信的交棒給下一代", "faith", "legacy"],
      ["justice3", "公義與誠信", "在利益中仍不失原則", "righteousness", "integrity"],
      ["mercy3", "憐憫與分享", "願意分享自己的資源", "righteousness", "mercy"],
      ["serve3", "服事與承擔", "將能力用於神與人", "righteousness", "service"],
      ["blessing3", "成為別人的祝福", "不只為自己成功而活", "righteousness", "mission"],
      ["giving", "金錢的奉獻", "把資源獻給神的國", "righteousness", "stewardship"],
    ],
  },
];

export const CATEGORIES: Record<DesireCategory, string> = {
  possession: "個人擁有",
  achievement: "成就認同",
  relationship: "親密關係",
  faith: "信仰操練",
  righteousness: "行義與服事",
};

export const DEFAULT_CONFIG = { pickCount: 5 };

export const APP_NAME = "渴望清單：人生三階段";
export const SCRIPTURE = "飢渴慕義的人有福了！因為他們必得飽足。";
export const SCRIPTURE_REF = "馬太福音 5:6";

export function discussion(stageId: DesireStage["id"]) {
  if (stageId === "student") {
    return "當你面對選擇的時候，你會怎麼作決定？";
  }
  if (stageId === "youngAdult") {
    return "人生變忙時，哪些選項最容易被移除？我們是否會把信仰變成「有空才做」的事？";
  }
  return "金錢、家庭與工作本身不是錯的；當它們都很重要時，我們會作什麼選擇？";
}

export function demoPattern(stageId: DesireStage["id"], idx: number, count: number) {
  const pattern =
    stageId === "student"
      ? [0, 1, 3, 7, 8, 10, 11, 12]
      : stageId === "youngAdult"
        ? [0, 1, 2, 4, 8, 9, 10, 12, 13]
        : [0, 1, 2, 4, 8, 12, 13, 16, 20];
  const rotated = pattern.map((_, j) => pattern[(j + idx) % pattern.length]);
  const stage = STAGES.find((item) => item.id === stageId);
  return rotated.slice(0, count).map((i) => stage?.choices[i][0] ?? "");
}
