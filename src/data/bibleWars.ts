export type BibleWarPeriod = "patriarchs" | "exodus" | "conquest" | "judges" | "kingdom";

export type BibleWarStep = {
  title: string;
  body: string;
};

export type BibleWarMapPoint = {
  label: string;
  lat: number;
  lng: number;
};

export type BibleWar = {
  id: string;
  period: BibleWarPeriod;
  title: string;
  ref: string;
  time: string;
  place: string;
  people: string;
  summary: string;
  steps: BibleWarStep[];
  lessons: string[];
  mapNote: string;
  points: BibleWarMapPoint[];
};

export const periodFilters = [
  "all",
  "patriarchs",
  "exodus",
  "conquest",
  "judges",
  "kingdom",
] as const;

export type PeriodFilter = (typeof periodFilters)[number];

export const periodLabels: Record<PeriodFilter, string> = {
  all: "全部時期",
  patriarchs: "先祖時期",
  exodus: "出埃及 / 曠野",
  conquest: "征服迦南",
  judges: "士師時期",
  kingdom: "王國時期",
};

export const bibleWars: BibleWar[] = [
  {
    id: "abraham-kings",
    period: "patriarchs",
    title: "亞伯蘭救羅得：四王與五王之戰",
    ref: "創世記 14 章",
    time: "先祖時期",
    place: "死海平原、但、何把",
    people: "亞伯蘭、羅得、基大老瑪、麥基洗德",
    summary:
      "羅得被四王擄走，亞伯蘭率領家中精練壯丁追擊，救回羅得與財物。戰後麥基洗德祝福亞伯蘭，亞伯蘭將十分之一獻上。",
    steps: [
      { title: "列王爭戰", body: "四王壓制五王，五王背叛，引發戰爭。" },
      { title: "羅得被擄", body: "所多瑪敗逃，羅得與財物被擄走。" },
      { title: "亞伯蘭追擊", body: "亞伯蘭率 318 名壯丁夜間分隊攻擊。" },
      { title: "救回親族", body: "亞伯蘭救回羅得、婦女、人民與財物。" },
      { title: "麥基洗德祝福", body: "亞伯蘭承認得勝出於至高神，不貪所多瑪財物。" },
    ],
    lessons: ["信心帶出勇氣", "得勝後仍尊神為大", "不因利益失去見證"],
    mapNote: "亞伯蘭從希伯崙附近北上追擊至但，再到大馬士革北方的何把；座標為近似示意。",
    points: [
      { label: "希伯崙 / 幔利", lat: 31.5326, lng: 35.0998 },
      { label: "死海平原", lat: 31.1, lng: 35.5 },
      { label: "但", lat: 33.248, lng: 35.652 },
      { label: "何把（約大馬士革北方）", lat: 33.7, lng: 36.3 },
      { label: "撒冷 / 耶路撒冷", lat: 31.7683, lng: 35.2137 },
    ],
  },
  {
    id: "red-sea",
    period: "exodus",
    title: "紅海邊的拯救：法老追兵覆沒",
    ref: "出埃及記 14 章",
    time: "出埃及時期",
    place: "紅海",
    people: "摩西、以色列人、法老與埃及軍兵",
    summary:
      "以色列人前有紅海、後有追兵，神吩咐摩西舉杖分海，使百姓走乾地，埃及軍兵追入海中而被水淹沒。",
    steps: [
      { title: "法老追趕", body: "埃及王後悔釋放以色列人，率軍追擊。" },
      { title: "百姓懼怕", body: "以色列人在海邊埋怨摩西，陷入絕境。" },
      { title: "神吩咐前行", body: "摩西宣告：不要懼怕，只管站住，看耶和華施行拯救。" },
      { title: "紅海分開", body: "海水分開，百姓從乾地經過。" },
      { title: "追兵覆沒", body: "埃及軍兵追入海中，海水復合，神大大得勝。" },
    ],
    lessons: ["絕境中仰望神", "信心需要往前行", "拯救出於耶和華"],
    mapNote: "紅海渡口採傳統示意位置；實際路線有不同考證。",
    points: [
      { label: "埃及", lat: 30.0444, lng: 31.2357 },
      { label: "曠野邊", lat: 30.6, lng: 32.3 },
      { label: "紅海渡口示意", lat: 29.5, lng: 32.55 },
      { label: "書珥曠野", lat: 30.1, lng: 33.4 },
    ],
  },
  {
    id: "jericho",
    period: "conquest",
    title: "耶利哥城倒塌",
    ref: "約書亞記 6 章",
    time: "征服迦南",
    place: "耶利哥",
    people: "約書亞、祭司、以色列人、喇合",
    summary:
      "神指示以色列人每日繞城，第七日繞城七次，祭司吹角、百姓呼喊，城牆倒塌。喇合一家因信得救。",
    steps: [
      { title: "神給戰法", body: "不是攻城器械，而是順服神的命令繞城。" },
      { title: "六日繞城", body: "每日一次，安靜等候神的時候。" },
      { title: "第七日七次", body: "祭司吹角，百姓大聲呼喊。" },
      { title: "城牆倒塌", body: "以色列人進城得勝。" },
      { title: "喇合蒙救", body: "因接待探子並信靠神，全家得保全。" },
    ],
    lessons: ["順服勝過人的方法", "神有祂的時間", "信心能帶來拯救"],
    mapNote: "耶利哥位於約旦河西、死海北方，是進入迦南的重要門戶。",
    points: [
      { label: "約旦河", lat: 31.9, lng: 35.55 },
      { label: "吉甲", lat: 31.86, lng: 35.49 },
      { label: "耶利哥", lat: 31.8611, lng: 35.4618 },
      { label: "死海", lat: 31.5, lng: 35.5 },
    ],
  },
  {
    id: "ai",
    period: "conquest",
    title: "艾城失敗與再次得勝",
    ref: "約書亞記 7–8 章",
    time: "征服迦南",
    place: "艾城",
    people: "約書亞、亞干、以色列人",
    summary: "以色列人因亞干犯罪在艾城失敗。除罪後，神指示伏兵策略，使以色列人再次攻取艾城。",
    steps: [
      { title: "輕敵出戰", body: "以色列人低估艾城，派少數兵力上去。" },
      { title: "因罪失敗", body: "亞干取了當滅之物，全營受影響。" },
      { title: "查明並除罪", body: "約書亞求問神，處理罪惡。" },
      { title: "神賜新策略", body: "設伏兵誘敵離城。" },
      { title: "再次得勝", body: "以色列人攻取艾城，重新立約讀律法。" },
    ],
    lessons: ["聖潔影響爭戰", "失敗後要回到神面前", "悔改帶來恢復"],
    mapNote: "艾城位置有考古爭議，此處採伯特利東邊的近似示意。",
    points: [
      { label: "耶利哥", lat: 31.8611, lng: 35.4618 },
      { label: "吉甲", lat: 31.86, lng: 35.49 },
      { label: "艾城示意", lat: 31.93, lng: 35.29 },
      { label: "伯特利", lat: 31.93, lng: 35.22 },
      { label: "伏兵區示意", lat: 31.91, lng: 35.25 },
    ],
  },
  {
    id: "gideon",
    period: "judges",
    title: "基甸三百勇士勝米甸",
    ref: "士師記 6–7 章",
    time: "士師時期",
    place: "耶斯列谷一帶",
    people: "基甸、三百勇士、米甸人",
    summary: "米甸人欺壓以色列，神呼召基甸，將軍隊減至三百人，使人知道得勝不是靠人多，乃靠神。",
    steps: [
      { title: "神呼召基甸", body: "膽怯的基甸被稱為大能勇士。" },
      { title: "拆毀偶像壇", body: "先處理家中的巴力壇。" },
      { title: "軍隊被減少", body: "從三萬二千人減到三百人。" },
      { title: "夜間突襲", body: "用角、空瓶、火把使敵營大亂。" },
      { title: "米甸潰敗", body: "敵人自相擊殺，以色列得釋放。" },
    ],
    lessons: ["神使用軟弱的人", "得勝不靠人多", "先除偶像再爭戰"],
    mapNote: "基甸在耶斯列谷一帶面對米甸聯軍，三百人夜間突襲敵營。",
    points: [
      { label: "俄弗拉示意", lat: 32.55, lng: 35.35 },
      { label: "哈律泉", lat: 32.55, lng: 35.35 },
      { label: "米甸營示意", lat: 32.6, lng: 35.45 },
      { label: "耶斯列谷", lat: 32.56, lng: 35.32 },
    ],
  },
  {
    id: "deborah",
    period: "judges",
    title: "底波拉與巴拉勝西西拉",
    ref: "士師記 4–5 章",
    time: "士師時期",
    place: "他泊山、基順河",
    people: "底波拉、巴拉、雅億、西西拉",
    summary: "迦南王壓制以色列，底波拉勉勵巴拉出戰。神使西西拉戰車潰敗，雅億擊殺西西拉。",
    steps: [
      { title: "神藉底波拉發聲", body: "女先知底波拉傳達神的命令。" },
      { title: "巴拉上他泊山", body: "招聚拿弗他利與西布倫人。" },
      { title: "神使敵軍混亂", body: "西西拉鐵車在基順河一帶失去優勢。" },
      { title: "西西拉逃亡", body: "離開戰車逃入雅億帳棚。" },
      { title: "雅億擊殺西西拉", body: "神按應許將敵首交在婦人手中。" },
    ],
    lessons: ["聽從神的話", "神能翻轉強弱局勢", "信心與勇氣互相扶持"],
    mapNote: "巴拉從他泊山下擊西西拉，基順河一帶使鐵車優勢失效。",
    points: [
      { label: "他泊山", lat: 32.686, lng: 35.39 },
      { label: "基順河", lat: 32.75, lng: 35.08 },
      { label: "夏瑣", lat: 33.018, lng: 35.567 },
      { label: "雅億帳棚示意", lat: 32.87, lng: 35.45 },
    ],
  },
  {
    id: "david-goliath",
    period: "kingdom",
    title: "大衛擊敗歌利亞",
    ref: "撒母耳記上 17 章",
    time: "王國初期",
    place: "以拉谷",
    people: "大衛、歌利亞、掃羅、非利士人",
    summary:
      "非利士巨人歌利亞辱罵以色列軍，少年大衛倚靠耶和華的名，用甩石擊倒歌利亞，鼓舞以色列人追擊得勝。",
    steps: [
      { title: "歌利亞挑戰", body: "非利士巨人四十日辱罵以色列。" },
      { title: "大衛看見屬靈問題", body: "不是只看巨人，而是看見他辱罵永生神。" },
      { title: "拒絕掃羅軍裝", body: "大衛不用不熟悉的裝備，只帶杖、甩石、石子。" },
      { title: "奉神名迎戰", body: "大衛宣告爭戰的勝敗全在乎耶和華。" },
      { title: "擊倒歌利亞", body: "一顆石子打中額頭，以色列人追擊非利士人。" },
    ],
    lessons: ["信心看見神大於困難", "不必模仿別人的軍裝", "爭戰的勝敗在乎神"],
    mapNote: "以拉谷位於猶大山地與非利士平原之間，是兩軍對峙之處。",
    points: [
      { label: "伯利恆", lat: 31.7054, lng: 35.2024 },
      { label: "以拉谷", lat: 31.68, lng: 34.98 },
      { label: "迦特示意", lat: 31.7, lng: 34.85 },
      { label: "耶路撒冷", lat: 31.7683, lng: 35.2137 },
    ],
  },
  {
    id: "elisha-aram",
    period: "kingdom",
    title: "以利沙與火車火馬：亞蘭軍被引入撒馬利亞",
    ref: "列王紀下 6 章",
    time: "北國以色列",
    place: "多坍、撒馬利亞",
    people: "以利沙、僕人、亞蘭軍、以色列王",
    summary:
      "亞蘭軍圍困多坍，以利沙禱告使僕人看見滿山火車火馬，又使敵軍眼目昏迷，將他們領到撒馬利亞，以恩慈待敵。",
    steps: [
      { title: "亞蘭王尋索以利沙", body: "因以利沙屢次揭露亞蘭計謀。" },
      { title: "多坍被圍", body: "僕人懼怕，以利沙說與我們同在的比他們更多。" },
      { title: "看見火車火馬", body: "神開僕人眼睛，看見屬靈保護。" },
      { title: "敵軍眼目昏迷", body: "以利沙將亞蘭軍帶入撒馬利亞。" },
      { title: "以恩慈待敵", body: "沒有殺害，反設筵席，使亞蘭軍暫不再犯境。" },
    ],
    lessons: ["屬靈眼光勝過恐懼", "神的保護超過眼見危機", "恩慈也能止息仇敵"],
    mapNote: "亞蘭軍圍困多坍；以利沙將敵軍引到撒馬利亞。",
    points: [
      { label: "多坍", lat: 32.42, lng: 35.24 },
      { label: "撒馬利亞", lat: 32.276, lng: 35.197 },
      { label: "亞蘭方向 / 大馬士革", lat: 33.5138, lng: 36.2765 },
    ],
  },
  {
    id: "jerusalem-sennacherib",
    period: "kingdom",
    title: "耶路撒冷脫離亞述王西拿基立",
    ref: "列王紀下 18–19 章；以賽亞書 36–37 章",
    time: "希西家年間",
    place: "耶路撒冷",
    people: "希西家、以賽亞、西拿基立、拉伯沙基",
    summary:
      "亞述大軍威脅耶路撒冷，希西家進殿禱告，神藉以賽亞應許拯救，一夜之間擊殺亞述軍十八萬五千人。",
    steps: [
      { title: "亞述威脅", body: "拉伯沙基用言語恐嚇，貶低倚靠耶和華。" },
      { title: "希西家進殿禱告", body: "將書信展在神面前，承認唯有神能救。" },
      { title: "以賽亞傳神諭", body: "神應許亞述王不能進城，也不能射箭攻城。" },
      { title: "神使敵軍敗亡", body: "耶和華的使者夜間擊殺亞述軍。" },
      { title: "西拿基立退回", body: "亞述王返回尼尼微，後被殺。" },
    ],
    lessons: ["危機中把問題帶到神面前", "不要被仇敵言語動搖", "神能不用人的刀槍施行拯救"],
    mapNote: "亞述軍威脅耶路撒冷；拉吉是相關軍事重鎮。",
    points: [
      { label: "耶路撒冷", lat: 31.7683, lng: 35.2137 },
      { label: "拉吉", lat: 31.565, lng: 34.846 },
      { label: "亞述軍營示意", lat: 31.82, lng: 35.0 },
      { label: "尼尼微方向", lat: 36.35, lng: 43.15 },
    ],
  },
];
