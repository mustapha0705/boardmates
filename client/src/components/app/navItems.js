import { HomeIcon, ProfileIcon, SubmitIcon } from "./NavIcons.jsx";

/**
 * Signed-in navigation. "My Games" joins this list in UI-3, when its route exists;
 * nothing here links to a page that has not shipped.
 */
export const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/submit", label: "Submit Game", Icon: SubmitIcon },
  { to: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function isActivePath(pathname, to) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export const PAGE_TITLES = [
  { match: (pathname) => pathname === "/", title: "Home" },
  { match: (pathname) => pathname.startsWith("/submit"), title: "Submit a game" },
  { match: (pathname) => pathname.startsWith("/profile"), title: "Profile" },
  { match: (pathname) => pathname.startsWith("/game-detail"), title: "Game" },
  { match: (pathname) => pathname.startsWith("/review-game"), title: "Review" },
];

export function titleForPath(pathname) {
  return PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? "Boardmates";
}
