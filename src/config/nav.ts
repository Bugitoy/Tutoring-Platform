import {
  Video,
  Search,
  BookOpen,
  Users,
  MessageSquare,
  CreditCard,
  Home,
  Calendar,
  FileText,
  Clock,
  Folder,
  Wallet,
  User,
  type LucideIcon,
} from "lucide-react";

export type Role = "student" | "parent" | "tutor";
export type NavItem = { label: string; href: string; icon: LucideIcon; match?: string[] };

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { label: "My lessons", href: "/student/lessons", icon: Video },
    { label: "Find tutors", href: "/student/tutors", icon: Search },
    { label: "Library", href: "/student/library", icon: BookOpen },
    { label: "Community", href: "/student/community", icon: Users },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "Payments", href: "/student/payments", icon: CreditCard },
  ],
  parent: [
    { label: "Home", href: "/parent", icon: Home, match: ["/parent"] },
    { label: "Calendar", href: "/parent/calendar", icon: Calendar },
    { label: "Find tutors", href: "/parent/tutors", icon: Search },
    { label: "Reports", href: "/parent/reports", icon: FileText },
    { label: "Messages", href: "/parent/messages", icon: MessageSquare },
    { label: "Payments", href: "/parent/payments", icon: CreditCard },
  ],
  tutor: [
    { label: "Today", href: "/tutor", icon: Clock, match: ["/tutor"] },
    { label: "Calendar", href: "/tutor/calendar", icon: Calendar },
    { label: "Students", href: "/tutor/students", icon: Users },
    { label: "Resources", href: "/tutor/resources", icon: Folder },
    { label: "Messages", href: "/tutor/messages", icon: MessageSquare },
    { label: "Earnings", href: "/tutor/earnings", icon: Wallet },
    { label: "Profile & pricing", href: "/tutor/profile", icon: User },
  ],
};

export const PROFILE_HREF: Record<Role, string> = {
  student: "/student/profile",
  parent: "/parent/profile",
  tutor: "/tutor/profile",
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "STUDENT",
  parent: "PARENT",
  tutor: "TUTOR",
};

export const ROLE_HOME: Record<Role, string> = {
  student: "/student/lessons",
  parent: "/parent",
  tutor: "/tutor",
};

export const MOBILE_TAB_HREFS: Record<Role, string[]> = {
  student: ["/student/lessons", "/student/tutors", "/student/library", "/student/messages"],
  parent: ["/parent", "/parent/calendar", "/parent/tutors", "/parent/messages"],
  tutor: ["/tutor", "/tutor/calendar", "/tutor/students", "/tutor/messages"],
};

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.match) return item.match.some((href) => pathname === href);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isProfileActive(pathname: string, role: Role): boolean {
  const href = PROFILE_HREF[role];
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function visibleNavItems(role: Role, hideFindTutors = false): NavItem[] {
  return NAV[role].filter((item) => !(hideFindTutors && item.href.endsWith("/tutors")));
}

export function mobileTabItems(role: Role, items: NavItem[]): NavItem[] {
  return MOBILE_TAB_HREFS[role]
    .map((href) => items.find((item) => item.href === href))
    .filter((item): item is NavItem => Boolean(item));
}

export function mobileMoreItems(role: Role, items: NavItem[]): NavItem[] {
  const tabHrefs = new Set(MOBILE_TAB_HREFS[role]);
  const rest = items.filter((item) => !tabHrefs.has(item.href));
  const profileHref = PROFILE_HREF[role];
  if (!items.some((item) => item.href === profileHref)) {
    rest.push({
      label: role === "tutor" ? "Profile & pricing" : "Profile",
      href: profileHref,
      icon: User,
    });
  }
  return rest;
}

export function pageTitleFromPath(pathname: string): string {
  const rules: { match: RegExp; title: string }[] = [
    { match: /^\/student\/lessons\/[^/]+$/, title: "Lesson summary" },
    { match: /^\/student\/tutors\/[^/]+\/book$/, title: "Book your lesson" },
    { match: /^\/student\/community\/leaderboard$/, title: "Top helpers" },
    { match: /^\/student\/community\/[^/]+$/, title: "Question" },
    { match: /^\/parent\/tutors\/[^/]+\/book$/, title: "Book your lesson" },
    { match: /^\/lesson\/[^/]+$/, title: "Live lesson" },
  ];
  for (const rule of rules) {
    if (rule.match.test(pathname)) return rule.title;
  }

  const allItems = [...NAV.student, ...NAV.parent, ...NAV.tutor];
  const exact = allItems.find((item) => item.href === pathname);
  if (exact) return exact.label;

  if (pathname === "/student/profile" || pathname === "/parent/profile") return "Profile";
  return "Thanodi";
}
