import type { LucideIcon } from "lucide-react";
import { Archive, HeartHandshake, Map, Mountain } from "lucide-react";

export type GameCategory = "game" | "resource";

export type GameCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "ready" | "planned";
  category: GameCategory;
};

export const games: GameCard[] = [
  {
    id: "beatitudes",
    title: "登山寶訓中的八福連連看",
    description: "把八福的上句與下句重新配對，適合聚會破冰、查經暖身與投影互動。",
    href: "/games/beatitudes",
    icon: Mountain,
    status: "ready",
    category: "game",
  },
  {
    id: "desire-list",
    title: "渴望清單：人生三階段",
    description: "走過三個人生階段，保留有限渴望，觀察信仰與行義在選擇中的位置。",
    href: "/games/desire-list",
    icon: HeartHandshake,
    status: "ready",
    category: "game",
  },
  {
    id: "bible-canon-archive",
    title: "經卷歸檔",
    description: "把聖經六十六卷歸回新舊約與九大分類書架，透過牌局熟悉正典結構。",
    href: "/games/bible-canon-archive",
    icon: Archive,
    status: "ready",
    category: "game",
  },
  {
    id: "jesus-ministry-map",
    title: "耶穌傳道的腳蹤",
    description: "用互動地圖走過耶穌傳道的重要地點，查看路線、經文與每處發生的事蹟。",
    href: "/games/jesus-ministry-map",
    icon: Map,
    status: "ready",
    category: "resource",
  },
];
