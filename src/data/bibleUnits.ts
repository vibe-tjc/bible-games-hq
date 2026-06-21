export type UnitSystem = "metric" | "imperial";

export type CategoryId = "length" | "weight" | "dryVolume" | "liquidVolume" | "wage";

type Measure = {
  value: number;
  unit: string;
  displayDivisor?: number;
  displayUnit?: string;
};

export type BibleUnit = {
  id: string;
  category: CategoryId;
  zh: string;
  en: string;
  metric: Measure;
  imperial: Measure;
  note: string;
  modernKind?: "metal";
};

export const categories: Record<CategoryId, string> = {
  length: "長度",
  weight: "重量",
  dryVolume: "乾量",
  liquidVolume: "液量",
  wage: "工資理解",
};

export const categoryOrder: CategoryId[] = [
  "length",
  "weight",
  "dryVolume",
  "liquidVolume",
  "wage",
];

export const units: BibleUnit[] = [
  {
    id: "finger",
    category: "length",
    zh: "指頭 / 指幅",
    en: "finger",
    metric: { value: 1.9, unit: "公分 cm" },
    imperial: { value: 0.75, unit: "英寸 in" },
    note: "小型尺寸。",
  },
  {
    id: "handbreadth",
    category: "length",
    zh: "掌寬",
    en: "handbreadth",
    metric: { value: 7.5, unit: "公分 cm" },
    imperial: { value: 3, unit: "英寸 in" },
    note: "物件寬度、聖殿細節。",
  },
  {
    id: "span",
    category: "length",
    zh: "拃 / 虎口",
    en: "span",
    metric: { value: 22.5, unit: "公分 cm" },
    imperial: { value: 9, unit: "英寸 in" },
    note: "身體量度、器具尺寸。",
  },
  {
    id: "cubit",
    category: "length",
    zh: "肘",
    en: "cubit",
    metric: { value: 45, unit: "公分 cm", displayDivisor: 100, displayUnit: "公尺 m" },
    imperial: { value: 18, unit: "英寸 in", displayDivisor: 12, displayUnit: "英尺 ft" },
    note: "常用於方舟、會幕、聖殿尺寸。",
  },
  {
    id: "reed",
    category: "length",
    zh: "竿",
    en: "reed",
    metric: { value: 2.7, unit: "公尺 m" },
    imperial: { value: 9, unit: "英尺 ft" },
    note: "以西結聖殿異象常見。",
  },
  {
    id: "stadion",
    category: "length",
    zh: "斯他丟",
    en: "stadion",
    metric: { value: 185, unit: "公尺 m" },
    imperial: { value: 607, unit: "英尺 ft" },
    note: "新約希臘羅馬背景的距離單位。",
  },

  {
    id: "gerah",
    category: "weight",
    modernKind: "metal",
    zh: "季拉",
    en: "gerah",
    metric: { value: 0.57, unit: "公克 g" },
    imperial: { value: 0.02, unit: "盎司 oz" },
    note: "約 1/20 舍客勒。",
  },
  {
    id: "beka",
    category: "weight",
    modernKind: "metal",
    zh: "比加",
    en: "beka",
    metric: { value: 5.7, unit: "公克 g" },
    imperial: { value: 0.2, unit: "盎司 oz" },
    note: "約半舍客勒。",
  },
  {
    id: "shekel",
    category: "weight",
    modernKind: "metal",
    zh: "舍客勒",
    en: "shekel",
    metric: { value: 11.5, unit: "公克 g" },
    imperial: { value: 0.4, unit: "盎司 oz" },
    note: "常用於銀子、香料、金屬重量。",
  },
  {
    id: "mina",
    category: "weight",
    modernKind: "metal",
    zh: "彌拿",
    en: "mina",
    metric: { value: 571, unit: "公克 g", displayDivisor: 1000, displayUnit: "公斤 kg" },
    imperial: { value: 1.25, unit: "磅 lb" },
    note: "約 50 舍客勒。",
  },
  {
    id: "talent",
    category: "weight",
    modernKind: "metal",
    zh: "他連得",
    en: "talent",
    metric: { value: 34, unit: "公斤 kg" },
    imperial: { value: 75, unit: "磅 lb" },
    note: "大量金銀重量；約 60 彌拿。",
  },

  {
    id: "omer",
    category: "dryVolume",
    zh: "俄梅珥",
    en: "omer",
    metric: { value: 2, unit: "公升 L" },
    imperial: { value: 2, unit: "夸脫 qt" },
    note: "約 1/10 伊法，與嗎哪相關。",
  },
  {
    id: "seah",
    category: "dryVolume",
    zh: "細亞",
    en: "seah",
    metric: { value: 7.3, unit: "公升 L" },
    imperial: { value: 7, unit: "夸脫 qt" },
    note: "約 1/3 伊法。",
  },
  {
    id: "ephah",
    category: "dryVolume",
    zh: "伊法",
    en: "ephah",
    metric: { value: 22, unit: "公升 L" },
    imperial: { value: 5.8, unit: "加侖 gal" },
    note: "乾量單位，常用於穀物、細麵。",
  },
  {
    id: "homer",
    category: "dryVolume",
    zh: "賀梅珥",
    en: "homer",
    metric: { value: 220, unit: "公升 L" },
    imperial: { value: 58, unit: "加侖 gal" },
    note: "約 10 伊法。",
  },
  {
    id: "corDry",
    category: "dryVolume",
    zh: "歌珥（乾量）",
    en: "cor",
    metric: { value: 220, unit: "公升 L" },
    imperial: { value: 58, unit: "加侖 gal" },
    note: "乾量大單位，約等於賀梅珥。",
  },

  {
    id: "log",
    category: "liquidVolume",
    zh: "羅革",
    en: "log",
    metric: { value: 0.3, unit: "公升 L" },
    imperial: { value: 0.33, unit: "夸脫 qt" },
    note: "小量液體。",
  },
  {
    id: "hin",
    category: "liquidVolume",
    zh: "欣",
    en: "hin",
    metric: { value: 3.7, unit: "公升 L" },
    imperial: { value: 1, unit: "加侖 gal" },
    note: "油、酒、奠祭常見。",
  },
  {
    id: "bath",
    category: "liquidVolume",
    zh: "罷特",
    en: "bath",
    metric: { value: 22, unit: "公升 L" },
    imperial: { value: 5.8, unit: "加侖 gal" },
    note: "基本液量單位。",
  },
  {
    id: "corLiquid",
    category: "liquidVolume",
    zh: "歌珥（液量）",
    en: "cor",
    metric: { value: 220, unit: "公升 L" },
    imperial: { value: 58, unit: "加侖 gal" },
    note: "約 10 罷特。",
  },

  {
    id: "denarius",
    category: "wage",
    zh: "得拿利",
    en: "denarius",
    metric: { value: 1, unit: "日工資" },
    imperial: { value: 1, unit: "day wage" },
    note: "常以一日工資理解，例如葡萄園工人。",
  },
  {
    id: "quadrans",
    category: "wage",
    zh: "可拉德 / 象限",
    en: "quadrans",
    metric: { value: 0.015625, unit: "日工資" },
    imperial: { value: 0.015625, unit: "day wage" },
    note: "小額銅幣，約 1/64 得拿利。",
  },
  {
    id: "lepton",
    category: "wage",
    zh: "小錢",
    en: "lepton / mite",
    metric: { value: 0.0078125, unit: "日工資" },
    imperial: { value: 0.0078125, unit: "day wage" },
    note: "寡婦兩個小錢；約 1/128 得拿利。",
  },
];

const TROY_OUNCE_GRAMS = 31.1034768;

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 100) return n.toLocaleString("zh-TW", { maximumFractionDigits: 1 });
  if (Math.abs(n) >= 10) return n.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
  if (Math.abs(n) >= 1) return n.toLocaleString("zh-TW", { maximumFractionDigits: 3 });
  return n.toLocaleString("zh-TW", { maximumFractionDigits: 5 });
}

export function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export type DisplayResult = {
  value: number;
  unit: string;
  baseValue: number;
  baseUnit: string;
};

export function displayValue(unit: BibleUnit, sys: UnitSystem, amount: number): DisplayResult {
  const data = unit[sys];
  let value = amount * data.value;
  let displayUnit = data.unit;
  if (data.displayDivisor) {
    value = value / data.displayDivisor;
    displayUnit = data.displayUnit ?? data.unit;
  }
  return { value, unit: displayUnit, baseValue: data.value, baseUnit: data.unit };
}

function metricGrams(unit: BibleUnit, amount: number): number | null {
  const v = amount * unit.metric.value;
  if (unit.metric.unit.includes("公斤")) return v * 1000;
  if (unit.metric.unit.includes("公克")) return v;
  return null;
}

export type Insight = {
  value: string;
  note: string;
};

export type InsightSettings = {
  silverPrice: number;
  goldPrice: number;
  dayWageUsd: number;
};

export function modernInsight(
  unit: BibleUnit,
  amount: number,
  { silverPrice, goldPrice, dayWageUsd }: InsightSettings,
): Insight {
  if (unit.modernKind === "metal") {
    const grams = metricGrams(unit, amount) ?? 0;
    const troyOz = grams / TROY_OUNCE_GRAMS;
    const silverUsd = troyOz * silverPrice;
    const goldUsd = troyOz * goldPrice;
    return {
      value: `若視為銀子約 ${fmtUsd(silverUsd)}；若視為金子約 ${fmtUsd(goldUsd)}`,
      note: `以 ${fmt(amount)} ${unit.zh} ≈ ${fmt(grams / 1000)} 公斤計，銀價 ${fmtUsd(silverPrice)}、金價 ${fmtUsd(goldPrice)} / 金衡盎司估算。`,
    };
  }
  if (unit.category === "wage") {
    const days = amount * unit.metric.value;
    return {
      value: `約 ${fmt(days)} 日工資，約 ${fmtUsd(days * dayWageUsd)}`,
      note: `以一日工資 ${fmtUsd(dayWageUsd)} 估算，可自行調整。`,
    };
  }
  if (unit.category === "length") {
    const meters = (amount * unit.metric.value) / (unit.metric.unit.includes("公分") ? 100 : 1);
    if (meters >= 1000)
      return { value: `約 ${fmt(meters / 1000)} 公里`, note: "可用來想像長距離或路線距離。" };
    if (meters >= 100)
      return {
        value: `約 ${fmt(meters)} 公尺，接近 ${fmt(meters / 105)} 個足球場長度`,
        note: "以標準足球場長約 105 公尺作直覺比喻。",
      };
    if (meters >= 10)
      return {
        value: `約 ${fmt(meters)} 公尺，約 ${fmt(meters / 1.7)} 個成人身高`,
        note: "以成人身高約 1.7 公尺作直覺比喻。",
      };
    return { value: `約 ${fmt(meters * 100)} 公分`, note: "小型長度可直接看公分較直覺。" };
  }
  if (unit.category === "dryVolume" || unit.category === "liquidVolume") {
    const liters = amount * unit.metric.value;
    return {
      value: `約 ${fmt(liters)} 公升，約 ${fmt(liters / 2)} 瓶 2L 寶特瓶`,
      note: "用常見 2 公升瓶裝容量幫助想像。",
    };
  }
  return { value: "可搭配公制 / 英制結果理解", note: "此單位暫無額外生活比喻。" };
}

export type DemoId = "ark" | "goliath" | "talent" | "denarius" | "ephah";

export const demos: Record<
  DemoId,
  { label: string; amount: number; category: CategoryId; unit: string }
> = {
  ark: { label: "300 肘", amount: 300, category: "length", unit: "cubit" },
  goliath: { label: "6 肘", amount: 6, category: "length", unit: "cubit" },
  talent: { label: "1 他連得銀子", amount: 1, category: "weight", unit: "talent" },
  denarius: { label: "300 得拿利", amount: 300, category: "wage", unit: "denarius" },
  ephah: { label: "1 伊法", amount: 1, category: "dryVolume", unit: "ephah" },
};

export const demoOrder: DemoId[] = ["ark", "goliath", "talent", "denarius", "ephah"];
