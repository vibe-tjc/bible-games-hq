import type { LucideIcon } from "lucide-react";
import { Scale, Swords } from "lucide-react";

export type ResourceCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "ready" | "planned";
};

export const resources: ResourceCard[] = [
  {
    id: "bible-unit-converter",
    title: "聖經單位換算器",
    description:
      "輸入聖經中的長度、重量、乾量、液量與工資單位，快速換算成公制或英制，並附現代生活的直覺理解。",
    href: "/resources/bible-unit-converter",
    icon: Scale,
    status: "ready",
  },
  {
    id: "bible-wars",
    title: "聖經戰爭",
    description:
      "互動瀏覽舊約代表性戰役的背景、戰爭流程與信仰功課，並在真實地圖上對照各場戰役的相關地點。",
    href: "/resources/bible-wars",
    icon: Swords,
    status: "ready",
  },
];
