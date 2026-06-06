import type { LucideIcon } from "lucide-react";
import { HeartHandshake, Mountain } from "lucide-react";

export type GameCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "ready" | "planned";
};

export const games: GameCard[] = [
  {
    id: "beatitudes",
    title: "登山寶訓中的八福連連看",
    description: "把八福的上句與下句重新配對，適合聚會破冰、查經暖身與投影互動。",
    href: "/games/beatitudes",
    icon: Mountain,
    status: "ready",
  },
  {
    id: "desire-list",
    title: "渴望清單：人生三階段",
    description: "走過三個人生階段，保留有限渴望，觀察信仰與行義在選擇中的位置。",
    href: "/games/desire-list",
    icon: HeartHandshake,
    status: "ready",
  },
];
