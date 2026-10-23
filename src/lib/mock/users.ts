import { PLACEHOLDERS } from "@/config/placeholders";
import type { Parent, Student } from "@/lib/types";
import { IDS } from "./ids";

export const NEO: Student = {
  id: IDS.neo,
  role: "student",
  fullName: "Neo Seretse",
  firstName: "Neo",
  initials: "NS",
  email: "neo.seretse@example.com",
  isUnder18: true,
  linkedParentId: IDS.masego,
  parentRelation: "Mother",
  linkedSince: "2026-02-09",
  pronoun: "he",
  city: "Gaborone",
  preferences: {
    videoQuality: "auto",
    remindBeforeLesson: true,
    homeworkReminders: true,
    showOnLeaderboard: false,
  },
  points: 340,
  communityLevel: 3,
  card: { brand: "visa", last4: "7310", expiry: "05/29", kind: "debit", isDefault: true },
  learningProfile: {
    level: "secondary",
    system: "national",
    curriculumId: "bgcse",
    year: "Form 4",
    subjectIds: [
      "english-language",
      "setswana",
      "mathematics",
      "chemistry",
      "physics",
      "biology",
      "geography",
    ],
    goals: [
      { subjectId: "mathematics", targetGrade: "B" },
      { subjectId: "physics", targetGrade: "C" },
      { subjectId: "english-language", targetGrade: "B" },
    ],
    preferredLanguage: "English",
    school: PLACEHOLDERS.SCHOOL_NAME,
  },
  permissions: {
    canBook: true,
    canPayOwnCard: true,
    canRequestParentPayment: true,
    monthlyRequestLimit: undefined,
    parentSeesMessages: true,
  },
};

export const LESEGO: Student = {
  id: IDS.lesego,
  role: "student",
  fullName: "Lesego Seretse",
  firstName: "Lesego",
  initials: "LS",
  email: "lesego.seretse@example.com",
  isUnder18: true,
  linkedParentId: IDS.masego,
  parentRelation: "Mother",
  linkedSince: "2026-02-09",
  pronoun: "she",
  city: "Gaborone",
  points: 40,
  communityLevel: 1,
  learningProfile: {
    level: "primary",
    system: "national",
    curriculumId: "psle",
    year: "Standard 6",
    subjectIds: ["english", "setswana", "mathematics", "science", "social-studies", "reme", "agriculture", "capa"],
    goals: [],
    preferredLanguage: "Either",
    school: PLACEHOLDERS.SCHOOL_NAME,
  },
  permissions: {
    canBook: false,
    canPayOwnCard: false,
    canRequestParentPayment: false,
    canJoinWithPin: true,
    parentSeesMessages: true,
  },
};

export const AMANTLE: Student = {
  id: IDS.amantle,
  role: "student",
  fullName: "Amantle K.",
  firstName: "Amantle",
  initials: "AK",
  email: "amantle.k@example.com",
  isUnder18: true,
  linkedParentId: IDS.dineo,
  points: 1120,
  communityLevel: 4,
  learningProfile: {
    level: "secondary",
    system: "international",
    curriculumId: "igcse",
    year: "Form 4",
    subjectIds: ["mathematics"],
    goals: [{ subjectId: "mathematics", targetGrade: "A" }],
    preferredLanguage: "English",
    school: "Sample Secondary C",
  },
  permissions: {
    canBook: true,
    canPayOwnCard: false,
    canRequestParentPayment: true,
    parentSeesMessages: true,
  },
};

export const KABELO: Student = {
  id: IDS.kabelo,
  role: "student",
  fullName: "Kabelo T.",
  firstName: "Kabelo",
  initials: "KT",
  email: "kabelo.t@example.com",
  isUnder18: true,
  linkedParentId: IDS.mpho,
  points: 80,
  communityLevel: 1,
  learningProfile: {
    level: "secondary",
    system: "national",
    curriculumId: "bgcse",
    year: "Form 5",
    subjectIds: ["mathematics", "physics"],
    goals: [],
    preferredLanguage: "English",
    school: "Sample Secondary D",
  },
  permissions: {
    canBook: true,
    canPayOwnCard: false,
    canRequestParentPayment: true,
    parentSeesMessages: true,
  },
};

export const TUMI: Student = {
  id: IDS.tumi,
  role: "student",
  fullName: "Tumi M.",
  firstName: "Tumi",
  initials: "TM",
  email: "tumi.m@example.com",
  isUnder18: true,
  linkedParentId: IDS.boitumeloM,
  points: 940,
  communityLevel: 4,
  learningProfile: {
    level: "secondary",
    system: "international",
    curriculumId: "igcse",
    year: "Form 4",
    subjectIds: ["mathematics"],
    goals: [],
    preferredLanguage: "English",
    school: "Sample Secondary D",
  },
  permissions: {
    canBook: true,
    canPayOwnCard: true,
    canRequestParentPayment: false,
  },
};

export const LESEGO_D: Student = {
  id: IDS.lesegoD,
  role: "student",
  fullName: "Lesego D.",
  firstName: "Lesego",
  initials: "LD",
  email: "lesego.d@example.com",
  isUnder18: true,
  linkedParentId: IDS.kitso,
  points: 12,
  communityLevel: 1,
  learningProfile: {
    level: "secondary",
    system: "national",
    curriculumId: "jce",
    year: "Form 2",
    subjectIds: ["mathematics"],
    goals: [],
    preferredLanguage: "Setswana",
    school: "Sample Secondary E",
  },
  permissions: {
    canBook: false,
    canPayOwnCard: false,
    canRequestParentPayment: true,
    parentSeesMessages: true,
  },
};

export const ORATILE: Student = {
  id: IDS.oratile,
  role: "student",
  fullName: "Oratile R.",
  firstName: "Oratile",
  initials: "OR",
  email: "oratile.r@example.com",
  isUnder18: true,
  linkedParentId: IDS.keabetswe,
  points: 8,
  communityLevel: 1,
  learningProfile: {
    level: "secondary",
    system: "national",
    curriculumId: "bgcse",
    year: "Form 4",
    subjectIds: ["mathematics"],
    goals: [],
    preferredLanguage: "English",
    school: "Sample Secondary A",
  },
  permissions: {
    canBook: true,
    canPayOwnCard: false,
    canRequestParentPayment: true,
    parentSeesMessages: true,
  },
};

export const STUDENTS: Student[] = [NEO, LESEGO, AMANTLE, KABELO, TUMI, LESEGO_D, ORATILE];

export const MASEGO: Parent = {
  id: IDS.masego,
  role: "parent",
  fullName: "Masego Seretse",
  firstName: "Masego",
  initials: "MS",
  email: "masego.seretse@example.com",
  phone: "71123456",
  pronoun: "she",
  language: "English",
  monthlyStatement: true,
  twoStepSms: true,
  notifications: {
    lesson_starting: { email: false, sms: true },
    report_sent: { email: true, sms: false },
    payment_request: { email: true, sms: true },
    lesson_missed: { email: true, sms: true },
    payment_update: { email: true, sms: false },
  },
  childIds: [IDS.neo, IDS.lesego],
  cards: [
    { brand: "visa", last4: "4821", expiry: "08/28", isDefault: true, kind: "credit" },
    { brand: "mastercard", last4: "0937", expiry: "03/27", kind: "credit" },
  ],
  plan: {
    name: "Thanodi Plus",
    price: null,
    renewsOn: "2026-11-01",
    covers: [IDS.neo, IDS.lesego],
  },
};

export const DINEO: Parent = {
  id: IDS.dineo,
  role: "parent",
  fullName: "Dineo K.",
  firstName: "Dineo",
  initials: "DK",
  email: "dineo.k@example.com",
  childIds: [IDS.amantle],
  cards: [{ brand: "visa", last4: "1102", expiry: "01/28", isDefault: true }],
};

export const MPHO: Parent = {
  id: IDS.mpho,
  role: "parent",
  fullName: "Mpho T.",
  firstName: "Mpho",
  initials: "MT",
  email: "mpho.t@example.com",
  childIds: [IDS.kabelo],
  cards: [{ brand: "visa", last4: "6641", expiry: "11/27", isDefault: true }],
};

export const KITSO: Parent = {
  id: IDS.kitso,
  role: "parent",
  fullName: "Kitso D.",
  firstName: "Kitso",
  initials: "KD",
  email: "kitso.d@example.com",
  childIds: [IDS.lesegoD],
  cards: [{ brand: "mastercard", last4: "2290", expiry: "06/28", isDefault: true }],
};

export const BOITUMELO_M: Parent = {
  id: IDS.boitumeloM,
  role: "parent",
  fullName: "Boitumelo M.",
  firstName: "Boitumelo",
  initials: "BM",
  email: "boitumelo.m@example.com",
  childIds: [IDS.tumi],
  cards: [],
};

export const KEABETSWE: Parent = {
  id: IDS.keabetswe,
  role: "parent",
  fullName: "Keabetswe R.",
  firstName: "Keabetswe",
  initials: "KR",
  email: "keabetswe.r@example.com",
  childIds: [IDS.oratile],
  cards: [{ brand: "visa", last4: "5518", expiry: "09/27", isDefault: true }],
};

export const PARENTS: Parent[] = [MASEGO, DINEO, MPHO, KITSO, BOITUMELO_M, KEABETSWE];

export function getStudentById(id: string) {
  return STUDENTS.find((s) => s.id === id);
}

export function getParentById(id: string) {
  return PARENTS.find((p) => p.id === id);
}
