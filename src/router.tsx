import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { BeatitudesPage } from "./screens/BeatitudesPage";
import { HomePage } from "./screens/HomePage";
import { HostRoomPage } from "./screens/HostRoomPage";

type BeatitudesSearch = {
  room?: string;
  token?: string;
  host?: string;
};

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
    room: typeof search.room === "string" ? search.room : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
    host: typeof search.host === "string" ? search.host : undefined,
  }),
  component: BeatitudesPage,
});

const hostRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/beatitudes/host/$roomId",
  component: HostRoomPage,
});

const routeTree = rootRoute.addChildren([indexRoute, beatitudesRoute, hostRoomRoute]);

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
