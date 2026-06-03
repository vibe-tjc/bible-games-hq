export type BeatitudePair = {
  id: string;
  blessing: string;
  promise: string;
  reference: string;
};

export const beatitudes: BeatitudePair[] = [
  {
    id: "poor-in-spirit",
    blessing: "虛心的人有福了",
    promise: "因為天國是他們的",
    reference: "馬太福音 5:3",
  },
  {
    id: "mourn",
    blessing: "哀慟的人有福了",
    promise: "因為他們必得安慰",
    reference: "馬太福音 5:4",
  },
  {
    id: "meek",
    blessing: "溫柔的人有福了",
    promise: "因為他們必承受地土",
    reference: "馬太福音 5:5",
  },
  {
    id: "hunger",
    blessing: "飢渴慕義的人有福了",
    promise: "因為他們必得飽足",
    reference: "馬太福音 5:6",
  },
  {
    id: "merciful",
    blessing: "憐恤人的人有福了",
    promise: "因為他們必蒙憐恤",
    reference: "馬太福音 5:7",
  },
  {
    id: "pure",
    blessing: "清心的人有福了",
    promise: "因為他們必得見神",
    reference: "馬太福音 5:8",
  },
  {
    id: "peacemakers",
    blessing: "使人和睦的人有福了",
    promise: "因為他們必稱為神的兒子",
    reference: "馬太福音 5:9",
  },
  {
    id: "persecuted",
    blessing: "為義受逼迫的人有福了",
    promise: "因為天國是他們的",
    reference: "馬太福音 5:10",
  },
];

export function shufflePairs<T>(items: T[]): T[] {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((left, right) => left.sort - right.sort)
    .map(({ item }) => item);
}
