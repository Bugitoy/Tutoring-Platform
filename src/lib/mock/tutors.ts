import type { Tutor } from "../types";
import { IDS, cat, pula } from "./ids";

export const MOLEFE: Tutor = {
  id: IDS.molefe,
  role: "tutor",
  fullName: "Ms. Kagiso Molefe",
  firstName: "Kagiso",
  initials: "KM",
  email: "kagiso.molefe@example.com",
  headline: "Maths teacher · 6 years",
  bio: "Secondary maths teacher in Gaborone. Algebra and exam technique with past papers.",
  languages: ["English", "Setswana"],
  prices: { min60: pula(150), min45: pula(115), min30: pula(80) },
  freeTrial: true,
  verification: { id: "verified", qualification: "verified", background: "in_review" },
  rating: 4.9,
  lessonsTaught: 310,
  nextFreeSlot: cat("2026-10-22", "17:00"),
  offerings: [
    { curriculumId: "bgcse", subjectId: "mathematics" },
    { curriculumId: "bsse", subjectId: "general-mathematics" },
    { curriculumId: "bsse", subjectId: "scientific-mathematics" },
    { curriculumId: "jce", subjectId: "mathematics" },
    { curriculumId: "igcse", subjectId: "mathematics" },
    { curriculumId: "igcse", subjectId: "additional-mathematics" },
  ],
};

export const SEBEGO: Tutor = {
  id: IDS.sebego,
  role: "tutor",
  fullName: "Thato Sebego",
  firstName: "Thato",
  initials: "TS",
  email: "thato.sebego@example.com",
  headline: "University student · Engineering",
  bio: "Explains physics with everyday examples. Patient with students who are behind.",
  languages: ["English", "Setswana"],
  prices: { min60: pula(90), min45: pula(70), min30: pula(50) },
  freeTrial: false,
  verification: { id: "verified", qualification: "in_review", background: "not_started" },
  rating: 4.8,
  lessonsTaught: 96,
  nextFreeSlot: cat("2026-10-23", "15:30"),
  offerings: [
    { curriculumId: "bsse", subjectId: "physics" },
    { curriculumId: "bgcse", subjectId: "physics" },
    { curriculumId: "bgcse", subjectId: "mathematics" },
    { curriculumId: "bgcse", subjectId: "science-double" },
    { curriculumId: "jce", subjectId: "integrated-science" },
    { curriculumId: "jce", subjectId: "mathematics" },
  ],
};

export const KGOSI: Tutor = {
  id: IDS.kgosi,
  role: "tutor",
  fullName: "Boitumelo Kgosi",
  firstName: "Boitumelo",
  initials: "BK",
  email: "boitumelo.kgosi@example.com",
  headline: "Chemistry specialist · 9 years",
  bio: "Works through past papers step by step. Strong on organic chemistry and practicals.",
  languages: ["English"],
  prices: { min60: pula(180), min45: pula(140), min30: pula(95) },
  freeTrial: true,
  verification: { id: "verified", qualification: "verified", background: "verified" },
  rating: 5.0,
  lessonsTaught: 402,
  nextFreeSlot: cat("2026-10-23", "18:00"),
  offerings: [
    { curriculumId: "igcse", subjectId: "chemistry" },
    { curriculumId: "a-level", subjectId: "chemistry" },
    { curriculumId: "ib-dp", subjectId: "chemistry", ibLevel: "HL" },
    { curriculumId: "bgcse", subjectId: "chemistry" },
  ],
};

export const MOSWEU: Tutor = {
  id: IDS.mosweu,
  role: "tutor",
  fullName: "Onalenna Mosweu",
  firstName: "Onalenna",
  initials: "OM",
  email: "onalenna.mosweu@example.com",
  headline: "Languages teacher · English & Setswana",
  bio: "Helps learners write clearly and speak with confidence, from PSLE up to BGCSE.",
  languages: ["English", "Setswana"],
  prices: { min60: pula(110), min45: pula(85), min30: pula(60) },
  freeTrial: false,
  verification: { id: "verified", qualification: "verified", background: "verified" },
  rating: 4.7,
  lessonsTaught: 154,
  nextFreeSlot: cat("2026-10-25", "10:00"),
  offerings: [
    { curriculumId: "bgcse", subjectId: "english-language" },
    { curriculumId: "bgcse", subjectId: "literature-english" },
    { curriculumId: "bsse", subjectId: "english-language" },
    { curriculumId: "jce", subjectId: "english" },
    { curriculumId: "jce", subjectId: "setswana" },
    { curriculumId: "psle", subjectId: "english" },
    { curriculumId: "psle", subjectId: "setswana" },
  ],
};

export const DINTWE: Tutor = {
  id: IDS.dintwe,
  role: "tutor",
  fullName: "Lorato Dintwe",
  firstName: "Lorato",
  initials: "LD",
  email: "lorato.dintwe@example.com",
  headline: "Maths & computer science · A Level / IB",
  bio: "University lecturer. Best for learners heading into A Level or IB Diploma maths.",
  languages: ["English"],
  prices: { min60: pula(200), min45: pula(155), min30: pula(110) },
  freeTrial: false,
  verification: { id: "verified", qualification: "verified", background: "verified" },
  rating: 4.9,
  lessonsTaught: 88,
  nextFreeSlot: cat("2026-10-24", "19:00"),
  offerings: [
    { curriculumId: "a-level", subjectId: "mathematics" },
    { curriculumId: "a-level", subjectId: "further-mathematics" },
    { curriculumId: "a-level", subjectId: "computer-science" },
    { curriculumId: "ib-dp", subjectId: "maths-aa", ibLevel: "HL" },
    { curriculumId: "igcse", subjectId: "computer-science" },
  ],
};

export const NKWE: Tutor = {
  id: IDS.nkwe,
  role: "tutor",
  fullName: "Gofaone Nkwe",
  firstName: "Gofaone",
  initials: "GN",
  email: "gofaone.nkwe@example.com",
  headline: "Primary teacher · PSLE & Cambridge",
  bio: "Warm, structured lessons for Standard 4–7. Covers the whole PSLE curriculum.",
  languages: ["English", "Setswana"],
  prices: { min60: pula(80), min45: pula(65), min30: pula(45) },
  freeTrial: true,
  verification: { id: "verified", qualification: "verified", background: "verified" },
  rating: 4.8,
  lessonsTaught: 211,
  nextFreeSlot: cat("2026-10-22", "16:00"),
  offerings: [
    { curriculumId: "psle", entireCurriculum: true },
    { curriculumId: "cambridge-primary", subjectId: "mathematics" },
    { curriculumId: "cambridge-primary", subjectId: "science" },
    { curriculumId: "jce", subjectId: "mathematics" },
  ],
};

export const KGARI: Tutor = {
  id: IDS.kgari,
  role: "tutor",
  fullName: "Refilwe Kgari",
  firstName: "Refilwe",
  initials: "RK",
  email: "refilwe.kgari@example.com",
  headline: "IB PYP & Cambridge Primary",
  bio: "Inquiry-led primary teaching with a calm, encouraging style.",
  languages: ["English", "Setswana"],
  prices: { min60: pula(140), min45: pula(110), min30: pula(75) },
  freeTrial: false,
  verification: { id: "verified", qualification: "verified", background: "in_review" },
  rating: 4.9,
  lessonsTaught: 176,
  nextFreeSlot: cat("2026-10-27", "15:00"),
  offerings: [
    { curriculumId: "ib-pyp", entireCurriculum: true },
    { curriculumId: "cambridge-primary", subjectId: "english" },
    { curriculumId: "cambridge-primary", subjectId: "mathematics" },
  ],
};

export const TUTORS: Tutor[] = [MOLEFE, SEBEGO, KGOSI, MOSWEU, DINTWE, NKWE, KGARI];

export function getTutorById(id: string) {
  return TUTORS.find((t) => t.id === id);
}
