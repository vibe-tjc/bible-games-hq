import type { CityId } from "../../data/paulJourneys";

export type ScreenPoint = { x: number; y: number };

export interface Renderer {
  show(): void;
  after(): void;
  fit(ids: CityId[]): void;
  reset(): void;
  addCity(id: CityId): void;
  markVisited(id: CityId): void;
  shake(id: CityId): void;
  placePaul(id: CityId): void;
  movePaul(id: CityId, cb?: () => void): void;
  drawRoute(a: CityId, b: CityId, sea: boolean, anim: boolean): void;
  ring(id: CityId): void;
  clearRing(): void;
  paulXY(): ScreenPoint;
}

export type RendererDeps = {
  root: HTMLElement;
  onCityClick: (id: CityId) => void;
  isChallenge: () => boolean;
  reduceMotion: () => boolean;
};
