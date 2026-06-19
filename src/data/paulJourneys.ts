export type CityDir = "top" | "bottom" | "left" | "right";

export type City = {
  zh: string;
  en: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  reg: string;
  dir: CityDir;
};

export const CITIES = {
  antioch: { zh: "安提阿", en: "Antioch", x: 1083, y: 378, lat: 36.20, lng: 36.16, reg: "敘利亞", dir: "top" },
  seleucia: { zh: "西流基", en: "Seleucia", x: 1060, y: 398, lat: 36.12, lng: 35.93, reg: "敘利亞", dir: "left" },
  salamis: { zh: "撒拉米", en: "Salamis", x: 931, y: 443, lat: 35.18, lng: 33.90, reg: "居比路", dir: "right" },
  paphos: { zh: "帕弗", en: "Paphos", x: 831, y: 467, lat: 34.77, lng: 32.42, reg: "居比路", dir: "bottom" },
  perga: { zh: "別加", en: "Perga", x: 725, y: 336, lat: 36.96, lng: 30.85, reg: "旁非利亞", dir: "top" },
  attalia: { zh: "亞大利", en: "Attalia", x: 712, y: 346, lat: 36.88, lng: 30.70, reg: "旁非利亞", dir: "bottom" },
  psidant: { zh: "彼西底安提阿", en: "Pisidian Antioch", x: 748, y: 259, lat: 38.30, lng: 31.19, reg: "加拉太", dir: "top" },
  iconium: { zh: "以哥念", en: "Iconium", x: 835, y: 282, lat: 37.87, lng: 32.48, reg: "加拉太", dir: "right" },
  lystra: { zh: "路司得", en: "Lystra", x: 833, y: 301, lat: 37.58, lng: 32.45, reg: "加拉太", dir: "bottom" },
  derbe: { zh: "特庇", en: "Derbe", x: 888, y: 315, lat: 37.35, lng: 33.27, reg: "加拉太", dir: "right" },
  troas: { zh: "特羅亞", en: "Troas", x: 408, y: 173, lat: 39.75, lng: 26.16, reg: "每西亞", dir: "left" },
  samothrace: { zh: "撒摩特喇", en: "Samothrace", x: 366, y: 128, lat: 40.48, lng: 25.53, reg: "愛琴海", dir: "top" },
  neapolis: { zh: "尼亞波利", en: "Neapolis", x: 298, y: 108, lat: 40.94, lng: 24.41, reg: "馬其頓", dir: "right" },
  philippi: { zh: "腓立比", en: "Philippi", x: 278, y: 88, lat: 41.01, lng: 24.29, reg: "馬其頓", dir: "top" },
  amphipolis: { zh: "暗妃波里", en: "Amphipolis", x: 250, y: 120, lat: 40.82, lng: 23.84, reg: "馬其頓", dir: "bottom" },
  thessalonica: { zh: "帖撒羅尼迦", en: "Thessalonica", x: 191, y: 121, lat: 40.64, lng: 22.94, reg: "馬其頓", dir: "top" },
  berea: { zh: "庇哩亞", en: "Berea", x: 141, y: 131, lat: 40.52, lng: 22.20, reg: "馬其頓", dir: "left" },
  athens: { zh: "雅典", en: "Athens", x: 244, y: 278, lat: 37.98, lng: 23.73, reg: "亞該亞", dir: "right" },
  corinth: { zh: "哥林多", en: "Corinth", x: 187, y: 282, lat: 37.91, lng: 22.88, reg: "亞該亞", dir: "left" },
  cenchreae: { zh: "堅革哩", en: "Cenchreae", x: 200, y: 298, lat: 37.88, lng: 22.99, reg: "亞該亞", dir: "bottom" },
  ephesus: { zh: "以弗所", en: "Ephesus", x: 488, y: 280, lat: 37.94, lng: 27.34, reg: "亞細亞", dir: "left" },
  miletus: { zh: "米利都", en: "Miletus", x: 484, y: 304, lat: 37.53, lng: 27.28, reg: "亞細亞", dir: "left" },
  assos: { zh: "亞朔", en: "Assos", x: 420, y: 189, lat: 39.49, lng: 26.34, reg: "每西亞", dir: "right" },
  mitylene: { zh: "米推利尼", en: "Mitylene", x: 437, y: 213, lat: 39.11, lng: 26.55, reg: "愛琴海", dir: "right" },
  tyre: { zh: "推羅", en: "Tyre", x: 1019, y: 556, lat: 33.27, lng: 35.20, reg: "腓尼基", dir: "left" },
  caesarea: { zh: "該撒利亞", en: "Caesarea", x: 998, y: 601, lat: 32.50, lng: 34.89, reg: "猶太", dir: "left" },
  jerusalem: { zh: "耶路撒冷", en: "Jerusalem", x: 1019, y: 644, lat: 31.78, lng: 35.21, reg: "猶太", dir: "left" },
} satisfies Record<string, City>;

export type CityId = keyof typeof CITIES;

export type LegKind = "start" | "land" | "sea";
export type Stop = { p: CityId; leg: LegKind; ref: string; ft: string };
export type Journey = {
  id: number;
  title: string;
  ref: string;
  desc: string;
  route: string;
  verse: string;
  stops: Stop[];
};

export const JOURNEYS: Journey[] = [
  {
    id: 0,
    title: "第一次宣道旅程",
    ref: "使徒行傳 13–14 章",
    desc: "由聖靈差遣,巴拿巴與保羅從敘利亞安提阿出發,經居比路島深入小亞細亞內陸,建立外邦教會後原路折返。",
    route: "安提阿 → 居比路 → 加拉太 → 返回",
    verse: "「聖靈說:要為我分派巴拿巴和掃羅,去做我召他們去做的工。」(徒13:2)",
    stops: [
      { p: "antioch", leg: "start", ref: "徒13:1-3", ft: "安提阿教會禁食禱告,聖靈說「要為我分派巴拿巴和掃羅」,眾人按手,差遣他們出去傳道。" },
      { p: "seleucia", leg: "land", ref: "徒13:4", ft: "安提阿的外港。兩人受聖靈差遣下到這裡,從此乘船前往居比路。" },
      { p: "salamis", leg: "sea", ref: "徒13:5", ft: "抵達居比路島東岸,在猶太人各會堂傳講神的道,約翰馬可作他們的幫手。" },
      { p: "paphos", leg: "land", ref: "徒13:6-12", ft: "行法術的以呂馬抵擋真道,被保羅責備而瞎了眼;方伯士求保羅看見後就信了主。掃羅從此又稱保羅。" },
      { p: "perga", leg: "sea", ref: "徒13:13", ft: "進入旁非利亞的別加。約翰馬可在此離開他們,自己回耶路撒冷去了。" },
      { p: "psidant", leg: "land", ref: "徒13:14-50", ft: "保羅在會堂講述救恩的歷史,外邦人歡喜領受;猶太人卻嫉妒、煽動逼迫,把他們趕出境外。" },
      { p: "iconium", leg: "land", ref: "徒14:1-7", ft: "許多猶太人與希臘人信主,但全城分黨;得知有人要用石頭打他們,便逃往呂高尼。" },
      { p: "lystra", leg: "land", ref: "徒14:8-20", ft: "保羅醫好生來瘸腿的人,眾人誤以為神明降臨要獻祭。隨後保羅被石頭打、拖出城外,神卻保守他起身。日後同工提摩太的家鄉。" },
      { p: "derbe", leg: "land", ref: "徒14:20-23", ft: "第一次旅程最遠之地,使許多人作了門徒。此後原路折返,沿途堅固門徒、選立長老。" },
      { p: "attalia", leg: "land", ref: "徒14:25", ft: "回到旁非利亞海邊的港口,在別加講道後,由這裡乘船返航。" },
      { p: "antioch", leg: "sea", ref: "徒14:26-28", ft: "回到當初蒙差遣的安提阿教會,聚集會眾,述說神藉著他們所行的一切,與門徒同住了多日。" },
    ],
  },
  {
    id: 1,
    title: "第二次宣道旅程",
    ref: "使徒行傳 15:36–18:22",
    desc: "保羅與西拉重訪眾教會,因馬其頓異象首次將福音帶入歐洲,在腓立比、雅典、哥林多留下重要的腳蹤。",
    route: "安提阿 → 加拉太 → 馬其頓(歐洲) → 亞該亞 → 返回",
    verse: "「請過到馬其頓來幫助我們!」(徒16:9)",
    stops: [
      { p: "antioch", leg: "start", ref: "徒15:36-40", ft: "保羅與巴拿巴為馬可起了爭論而分手;保羅揀選西拉,被弟兄們交託在主的恩中,再次出發。" },
      { p: "derbe", leg: "land", ref: "徒15:41-16:1", ft: "經敘利亞、基利家堅固眾教會,先來到特庇。" },
      { p: "lystra", leg: "land", ref: "徒16:1-5", ft: "收門徒提摩太同行。眾教會信心堅固,人數天天增加。" },
      { p: "troas", leg: "land", ref: "徒16:8-10", ft: "夜間異象——有馬其頓人站著懇求:「請過到馬其頓來幫助我們!」他們斷定是神召他們去傳福音。" },
      { p: "samothrace", leg: "sea", ref: "徒16:11", ft: "從特羅亞開船,一路順風直行,在此島停泊過夜。" },
      { p: "neapolis", leg: "sea", ref: "徒16:11", ft: "次日抵達馬其頓的登陸港口——福音正式踏上歐洲。" },
      { p: "philippi", leg: "land", ref: "徒16:12-40", ft: "歐洲第一個教會。賣紫色布的呂底亞一家受洗;保羅趕出使女的鬼,與西拉被下監;半夜唱詩禱告,地大震動,禁卒一家歸主。" },
      { p: "amphipolis", leg: "land", ref: "徒17:1", ft: "經過暗妃波里、亞波羅尼亞兩城,繼續沿大道前行。" },
      { p: "thessalonica", leg: "land", ref: "徒17:1-9", ft: "一連三個安息日在會堂講道,證明耶穌是基督;有人信了,猶太人卻嫉妒,聚眾生亂。" },
      { p: "berea", leg: "land", ref: "徒17:10-12", ft: "這裡的人比帖撒羅尼迦人開明,甘心領受真道,天天查考聖經,要曉得所傳的是否如此。" },
      { p: "athens", leg: "sea", ref: "徒17:16-34", ft: "保羅見滿城都是偶像,心裡著急;在亞略巴古論「未識之神」,傳講創造萬有的獨一真神與死人復活。" },
      { p: "corinth", leg: "land", ref: "徒18:1-17", ft: "與作帳棚的亞居拉、百基拉同住同工;主在異象中說「在這城裡我有許多的百姓」,他便住了一年零六個月;迦流不受理控告。" },
      { p: "cenchreae", leg: "land", ref: "徒18:18", ft: "哥林多的港口。保羅曾許過願,在這裡剪了頭髮,然後乘船起行。" },
      { p: "ephesus", leg: "sea", ref: "徒18:19-21", ft: "短暫停留,進會堂與猶太人辯論;留下亞居拉、百基拉,自己說「神若許可,我還要回到你們這裡」。" },
      { p: "caesarea", leg: "sea", ref: "徒18:22", ft: "渡海上岸的港口。" },
      { p: "jerusalem", leg: "land", ref: "徒18:22", ft: "上去向耶路撒冷的教會問安。" },
      { p: "antioch", leg: "land", ref: "徒18:22", ft: "回到差遣他的安提阿教會,第二次旅程結束。" },
    ],
  },
  {
    id: 2,
    title: "第三次宣道旅程",
    ref: "使徒行傳 18:23–21:17",
    desc: "保羅以以弗所為中心,在亞細亞作工兩年多,再巡訪馬其頓與希臘,最後堅定地走向耶路撒冷。",
    route: "安提阿 → 以弗所 → 馬其頓、希臘 → 沿岸南下 → 耶路撒冷",
    verse: "「我卻不以性命為念,只要行完我的路程。」(徒20:24)",
    stops: [
      { p: "antioch", leg: "start", ref: "徒18:23", ft: "住了些日子又出發,挨次走遍加拉太、弗呂家一帶,堅固眾門徒。" },
      { p: "ephesus", leg: "land", ref: "徒19章", ft: "住了兩年多,主藉保羅行非常的奇事;許多行邪術的把書堆起來當眾燒掉;銀匠底米丟因亞底米廟生意受損,煽動全城大亂。" },
      { p: "philippi", leg: "sea", ref: "徒20:1-2", ft: "經過馬其頓一帶,用許多話勸勉門徒。" },
      { p: "corinth", leg: "land", ref: "徒20:2-3", ft: "在希臘住了三個月;因猶太人設計害他,就決意取道馬其頓回去。" },
      { p: "troas", leg: "sea", ref: "徒20:6-12", ft: "七日的第一日聚會擘餅,保羅講道直到半夜;少年人猶推古坐在窗台睡著、墜樓而死,保羅下去把他救活了。" },
      { p: "assos", leg: "land", ref: "徒20:13-14", ft: "保羅自己選擇步行到這裡,再與乘船的同伴會合。" },
      { p: "mitylene", leg: "sea", ref: "徒20:14", ft: "沿著愛琴海航行,停泊之地。" },
      { p: "miletus", leg: "sea", ref: "徒20:15-38", ft: "請以弗所教會的長老前來,作懇切的臨別贈言:「我未曾避諱不傳神一切的旨意。」眾人痛哭,與他送別。" },
      { p: "tyre", leg: "sea", ref: "徒21:3-6", ft: "找到門徒,住了七天;他們被聖靈感動,再三勸保羅不要上耶路撒冷。" },
      { p: "caesarea", leg: "sea", ref: "徒21:8-14", ft: "住在傳福音的腓利家;先知亞迦布拿保羅的腰帶捆自己的手腳,預言保羅必在耶路撒冷被捆綁。" },
      { p: "jerusalem", leg: "land", ref: "徒21:15-17", ft: "旅程的終點,弟兄們歡歡喜喜地接待。此後保羅在聖殿被捉拿,開始為福音受苦、作見證的新路程。" },
    ],
  },
];
