import { HomeIcon, MyGamesIcon, ProfileIcon, SubmitIcon } from "./NavIcons.jsx";

/**
 * Signed-in navigation: Home, Submit Game, My Games and Profile (map §18).
 * Signed-out visitors reach the shell only on the public Submit and game pages, so they
 * see just the destinations that work without an account.
 */
export const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/submit", label: "Submit Game", Icon: SubmitIcon },
  { to: "/my-games", label: "My Games", Icon: MyGamesIcon, requiresAuth: true },
  { to: "/profile", label: "Profile", Icon: ProfileIcon, requiresAuth: true },
];

export function navItemsFor(isAuthenticated) {
  return isAuthenticated ? NAV_ITEMS : NAV_ITEMS.filter((item) => !item.requiresAuth);
}

export function isActivePath(pathname, to) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export const PAGE_TITLES = [
  { match: (pathname) => pathname === "/", title: "Home" },
  { match: (pathname) => pathname.startsWith("/submit"), title: "Submit a game" },
  { match: (pathname) => pathname.startsWith("/my-games"), title: "My games" },
  { match: (pathname) => pathname.startsWith("/profile"), title: "Profile" },
  { match: (pathname) => pathname.startsWith("/game-detail"), title: "Game" },
  { match: (pathname) => pathname.startsWith("/review-game"), title: "Review" },
];

export function titleForPath(pathname) {
  return PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? "Boardmates";
}
