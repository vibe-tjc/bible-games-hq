import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { BeatitudesPage } from "./screens/BeatitudesPage";
import { DesireListPage } from "./screens/DesireListPage";
import { HomePage } from "./screens/HomePage";
import { HostRoomPage } from "./screens/HostRoomPage";
import { JesusMinistryMapPage } from "./screens/JesusMinistryMapPage";

type BeatitudesSearch = {
  room?: string;
  token?: string;
  host?: string;
};

type DesireListSearch = {
  join?: string;
};

function optionalSearchString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand-link" aria-label="Bible Games HQ 首頁">
          <span className="brand-mark">
            <Leaf aria-hidden="true" size={20} />
          </span>
          <span>Bible Games HQ</span>
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const beatitudesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/beatitudes",
  validateSearch: (search): BeatitudesSearch => ({
    room: optionalSearchString(search.room),
    token: optionalSearchString(search.token),
    host: optionalSearchString(search.host),
  }),
  component: BeatitudesPage,
});

const hostRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/beatitudes/host/$roomId",
  component: HostRoomPage,
});

const desireListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/desire-list",
  validateSearch: (search): DesireListSearch => ({
    join: optionalSearchString(search.join),
  }),
  component: DesireListPage,
});

const jesusMinistryMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/jesus-ministry-map",
  component: JesusMinistryMapPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  beatitudesRoute,
  hostRoomRoute,
  desireListRoute,
  jesusMinistryMapRoute,
]);

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
