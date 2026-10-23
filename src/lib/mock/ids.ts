export const IDS = {
  neo: "student-neo",
  lesego: "student-lesego",
  masego: "parent-masego",
  molefe: "tutor-molefe",
  sebego: "tutor-sebego",
  kgosi: "tutor-kgosi",
  mosweu: "tutor-mosweu",
  dintwe: "tutor-dintwe",
  nkwe: "tutor-nkwe",
  kgari: "tutor-kgari",
  amantle: "student-amantle",
  kabelo: "student-kabelo",
  tumi: "student-tumi",
  lesegoD: "student-lesego-d",
  oratile: "student-oratile",
  dineo: "parent-dineo",
  mpho: "parent-mpho",
  kitso: "parent-kitso",
  boitumeloM: "parent-boitumelo-m",
  keabetswe: "parent-keabetswe",
  support: "thanodi-support",
} as const;

/** Thursday 22 October 2026, 15:08 CAT — 1 h 52 min before Neo’s 17:00 lesson. */
export const MOCK_NOW_ISO = "2026-10-22T15:08:00+02:00";

export const cat = (date: string, time: string) => `${date}T${time}:00+02:00`;

export const pula = (amount: number): number => Math.round(amount * 100);
