export type BibleAuthorOccupationMatch = {
  id: string;
  person: string;
  occupation: string;
  bookHint: string;
  verseRef: string;
  verseText: string;
  note: string;
};

export const bibleAuthorOccupationMatches: BibleAuthorOccupationMatch[] = [
  {
    id: "amos",
    person: "阿摩司",
    occupation: "牧人、修理桑樹的人",
    bookHint: "小先知書",
    verseRef: "摩七14-15",
    verseText:
      "我原不是先知，也不是先知的門徒；我是牧人，又是修理桑樹的。耶和華選召我……",
    note: "神呼召平凡農牧工作者，成為責備不義、宣告公義的先知。",
  },
  {
    id: "luke",
    person: "路加",
    occupation: "醫生",
    bookHint: "福音書、使徒行傳",
    verseRef: "西四14",
    verseText: "所親愛的醫生路加和底馬問你們安。",
    note: "路加以細心查考的筆法，見證主耶穌與初代教會的腳蹤。",
  },
  {
    id: "david",
    person: "大衛",
    occupation: "牧羊人、國王、詩人",
    bookHint: "詩篇的重要作者",
    verseRef: "撒下二十三1",
    verseText: "耶西的兒子大衛得居高位，是雅各神所膏的，作以色列的美歌者……",
    note: "從牧場到王宮，大衛把信心、悔改與讚美寫成許多詩歌。",
  },
  {
    id: "solomon",
    person: "所羅門",
    occupation: "國王、智慧人",
    bookHint: "箴言、傳道書、雅歌傳統歸屬",
    verseRef: "傳一1",
    verseText: "在耶路撒冷作王、大衛的兒子、傳道者的言語。",
    note: "所羅門以王者與智慧人的角度，思想敬畏神與人生道路。",
  },
  {
    id: "moses",
    person: "摩西",
    occupation: "牧羊人、領袖、律法頒布者",
    bookHint: "律法書傳統歸屬",
    verseRef: "出三1",
    verseText: "摩西牧養他岳父米甸祭司葉忒羅的羊群……到了神的山，就是何烈山。",
    note: "神在曠野呼召牧羊的摩西，帶領以色列人出埃及並領受律法。",
  },
  {
    id: "peter",
    person: "彼得",
    occupation: "漁夫、使徒",
    bookHint: "彼得前後書",
    verseRef: "太四18-19",
    verseText: "耶穌看見弟兄二人……彼得和他兄弟安得烈，在海裡撒網；他們本是打魚的。",
    note: "主呼召漁夫彼得，使他成為得人的漁夫，後來牧養受苦中的信徒。",
  },
  {
    id: "matthew",
    person: "馬太",
    occupation: "稅吏",
    bookHint: "馬太福音",
    verseRef: "太九9",
    verseText: "耶穌看見一個人名叫馬太，坐在稅關上，就對他說：你跟從我來。",
    note: "被人輕看的稅吏蒙主呼召，見證耶穌是天國君王。",
  },
  {
    id: "paul",
    person: "保羅",
    occupation: "製帳棚者、使徒",
    bookHint: "保羅書信",
    verseRef: "徒十八3",
    verseText: "他們本是製造帳棚為業。保羅因與他們同業，就和他們同住做工。",
    note: "保羅邊做工邊傳道，也寫下許多勉勵教會的書信。",
  },
  {
    id: "ezra",
    person: "以斯拉",
    occupation: "文士、祭司",
    bookHint: "以斯拉記",
    verseRef: "拉七6",
    verseText: "這以斯拉從巴比倫上來，他是敏捷的文士，通達耶和華以色列神所賜摩西的律法書。",
    note: "以斯拉專心考究、遵行並教訓神的律法，帶動歸回群體更新。",
  },
  {
    id: "nehemiah",
    person: "尼希米",
    occupation: "酒政、省長",
    bookHint: "尼希米記",
    verseRef: "尼一11",
    verseText: "我是作王酒政的。",
    note: "尼希米在宮廷工作，卻掛念耶路撒冷，禱告並帶領重建城牆。",
  },
];
