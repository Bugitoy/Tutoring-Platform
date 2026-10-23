import type { Level, System } from "./curricula";

export type Role = "student" | "parent" | "tutor";
export type Money = number; // Pula, stored in thebe (P1 = 100 thebe) to avoid float errors

export interface UserBase {
  id: string;
  role: Role;
  fullName: string;
  firstName: string;
  initials: string;
  email: string;
  avatarUrl?: string;
}

export interface LearningProfile {
  level: Level;
  system: System;
  curriculumId: string;
  year: string;
  subjectIds: string[];
  goals: { subjectId: string; targetGrade: string }[];
  preferredLanguage: "English" | "Setswana" | "Either";
  school?: string;
}

export interface StudentPermissions {
  canBook: boolean;
  canPayOwnCard: boolean;
  canRequestParentPayment: boolean;
  monthlyRequestLimit?: Money;
  canJoinWithPin?: boolean;
  parentSeesMessages?: boolean;
}

export type VideoQuality = "hd" | "auto" | "data_saver";

export interface StudentPreferences {
  videoQuality: VideoQuality;
  remindBeforeLesson: boolean;
  homeworkReminders: boolean;
  showOnLeaderboard: boolean;
}

export interface Student extends UserBase {
  role: "student";
  isUnder18: boolean;
  linkedParentId?: string;
  /** "Mother", "Father", "Guardian" — how the linked parent is related. */
  parentRelation?: string;
  linkedSince?: string;
  pronoun?: "he" | "she";
  city?: string;
  learningProfile: LearningProfile;
  permissions: StudentPermissions;
  preferences?: StudentPreferences;
  card?: SavedCard;
  points: number;
  communityLevel: number;
}

export type NotificationEvent = "lesson_starting" | "report_sent" | "payment_request" | "lesson_missed" | "payment_update";
export type NotificationChannel = "email" | "sms";
export type NotificationPrefs = Record<NotificationEvent, Record<NotificationChannel, boolean>>;

export interface Parent extends UserBase {
  role: "parent";
  childIds: string[];
  cards: SavedCard[];
  plan?: Plan;
  phone?: string;
  pronoun?: "he" | "she";
  language?: "English" | "Setswana";
  notifications?: NotificationPrefs;
  monthlyStatement?: boolean;
  twoStepSms?: boolean;
}

export type StudentProfileInput = {
  fullName: string;
  email: string;
  learningProfile: LearningProfile;
  preferences: StudentPreferences;
};

export type ParentProfileInput = {
  fullName: string;
  email: string;
  phone: string;
  language: "English" | "Setswana";
  notifications: NotificationPrefs;
  children: { id: string; permissions: StudentPermissions; learningProfile: LearningProfile }[];
};

export interface TutorOffering {
  curriculumId: string;
  subjectId?: string;
  entireCurriculum?: boolean;
  ibLevel?: "SL" | "HL";
}

export interface Tutor extends UserBase {
  role: "tutor";
  headline: string;
  bio: string;
  offerings: TutorOffering[];
  languages: ("English" | "Setswana")[];
  prices: { min60: Money; min45: Money; min30: Money };
  freeTrial: boolean;
  verification: { id: VerifyState; qualification: VerifyState; background: VerifyState };
  rating: number;
  lessonsTaught: number;
  nextFreeSlot?: string;
}

export type VerifyState = "verified" | "in_review" | "not_started";

export type LessonStatus = "awaiting_payment" | "booked" | "live" | "completed" | "missed" | "cancelled";
export interface Lesson {
  id: string;
  studentId: string;
  tutorId: string;
  curriculumId: string;
  subjectId: string;
  title: string;
  goal?: string;
  start: string;
  durationMin: 30 | 45 | 60;
  status: LessonStatus;
  reportStatus?: "report_due" | "report_sent";
  payer: "student" | "parent";
  paymentId?: string;
  paymentRequestId?: string;
  price: Money;
  refunded?: boolean;
}

export interface Report {
  id: string;
  lessonId: string;
  attendance: "on_time" | "late" | "absent";
  lateMinutes?: number;
  comment: string;
  homework?: { text: string; due?: string; done: boolean; minutes?: number };
  files: FileRef[];
  takeaways?: string[];
  aiDrafted?: boolean;
  tutorApproved?: boolean;
  agenda?: { time: string; title: string; detail: string }[];
  sentAt: string;
}

/** What the after-class form starts from: the study helper's draft plus the whiteboard export. */
export type ReportDraft = Partial<Omit<Report, "id" | "lessonId" | "sentAt">>;

export interface ReportInput {
  lessonId: string;
  attendance: Report["attendance"];
  lateMinutes?: number;
  comment: string;
  homework?: { text: string; due?: string };
  takeaways: string[];
  takeawaysChecked: boolean;
}

export interface PaymentRequest {
  id: string;
  lessonId: string;
  fromStudentId: string;
  toParentId: string;
  amount: Money;
  expiresAt: string;
  status: "pending" | "paid" | "declined" | "expired";
  declineMessage?: string;
}

export interface Payment {
  id: string;
  date: string;
  description: string;
  detail: string;
  payerLabel: string;
  cardLabel: string;
  status: "paid" | "refunded" | "waiting";
  amount: Money | null;
  receiptUrl?: string;
  lessonId?: string;
  paymentRequestId?: string;
}

export interface SavedCard {
  brand: "visa" | "mastercard";
  last4: string;
  expiry: string;
  isDefault?: boolean;
  kind?: "debit" | "credit";
}

export interface Plan {
  name: "Thanodi Plus";
  price: Money | null;
  renewsOn: string;
  covers: string[];
}

export interface FileRef {
  id: string;
  name: string;
  kind: "pdf" | "img";
  sizeKb: number;
  url?: string;
}

export interface Thread {
  id: string;
  participantIds: string[];
  aboutStudentId?: string;
  lastMessageAt: string;
  preview: string;
}

/** Chat inside the live lesson room; separate from Messages threads. */
export interface LessonChatMessage {
  id: string;
  lessonId: string;
  senderId: string;
  sentAt: string;
  text: string;
  readAt?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sentAt: string;
  readAt?: string;
  kind: "text" | "file" | "lesson_offer";
  text?: string;
  file?: FileRef;
  offer?: LessonOffer;
}

export interface LessonOffer {
  start: string;
  durationMin: 30 | 45 | 60;
  curriculumId: string;
  subjectId: string;
  price: Money;
  status: "open" | "accepted" | "expired";
  /** Set once the offer is paid and becomes a lesson. */
  lessonId?: string;
}

export type OfferInput = Pick<LessonOffer, "start" | "durationMin" | "curriculumId" | "subjectId">;

export interface Question {
  id: string;
  authorId: string;
  title: string;
  body: string;
  imageUrl?: string;
  curriculumId: string;
  subjectId: string;
  topic?: string;
  pastPaperRef?: string;
  /** The student's written working, one line each; `~~x = 2~~` marks a crossed-out step. */
  working?: string[];
  status: "unanswered" | "answered" | "verified";
  createdAt: string;
  answerCount: number;
  followerIds?: string[];
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  /** Paragraphs split by blank lines; lines indented with four spaces form a maths box. */
  body: string;
  helpfulCount: number;
  /** Users who marked it helpful, when known. The asker's mark earns the author +10. */
  helpfulBy?: string[];
  verifiedByTutorId?: string;
  createdAt: string;
  imageName?: string;
}

export type QuestionInput = {
  title: string;
  body: string;
  curriculumId: string;
  subjectId: string;
  imageName?: string;
};

export interface Resource {
  id: string;
  tutorId: string;
  title: string;
  kind: "pdf" | "img";
  curriculumId: string;
  subjectId?: string;
  visibility: "private" | "my_students" | "for_sale";
  price?: Money;
  usedInLessons: number;
  updatedAt: string;
  /** Shown in the meta line, e.g. "whiteboard background". */
  note?: string;
  /** For resources on sale: how many tutors bought it. */
  boughtBy?: number;
}

export interface SyllabusDocument {
  id: string;
  title: string;
  kind: "pdf";
  curriculumId: string;
  subjectId: string;
  source: string;
}

export type ResourceInput = {
  title: string;
  fileName: string;
  kind: Resource["kind"];
  curriculumId: string;
  subjectId?: string;
  visibility: Resource["visibility"];
  price?: Money;
};

export interface TutorStudent {
  tutorId: string;
  studentId: string;
  /** Lessons taught together, including ones before the mock data starts. */
  lessonsTogether: number;
  privateNote: string;
}

export interface TutorStats {
  activeStudents: number;
  newThisWeek: number;
}

export interface BookingSettings {
  lessonLength: 30 | 45 | 60;
  breakMin: 0 | 15 | 30;
  bookAhead: "1w" | "2w" | "1m";
  repeatWeekly: boolean;
}

export type TutorProfileInput = Pick<
  Tutor,
  "headline" | "bio" | "offerings" | "languages" | "prices" | "freeTrial"
>;

export type FilterAny = "any";

export type AvailabilityFilter = "any" | "today" | "week";
export type PriceBand = "any" | "under-100" | "100-150" | "over-150";

export interface TutorFilter {
  level?: Level | FilterAny;
  system?: System | FilterAny;
  curriculumId?: string | FilterAny;
  subjectId?: string | FilterAny;
  verifiedOnly?: boolean;
  teachesSetswana?: boolean;
  freeTrial?: boolean;
  availability?: AvailabilityFilter;
  priceBand?: PriceBand;
}

export interface BookingInput {
  studentId: string;
  tutorId: string;
  start: string;
  durationMin: 30 | 45 | 60;
  curriculumId: string;
  subjectId: string;
  title: string;
  goal?: string;
  payer: "student" | "parent";
}

export interface Slot {
  start: string;
  end: string;
  tutorId: string;
}

export interface EarningsWeek {
  weekStart: string;
  label: string;
  amount: Money;
}

export interface TermProgress {
  termLabel: string;
  termStart: string;
  attended: number;
  scheduled: number;
  homeworkDone: number;
  homeworkSet: number;
  tutors: number;
}

export interface WhiteboardPage {
  caption: string;
  lines: { text: string; tone: "ink" | "work" | "answer" }[];
  graph?: boolean;
}

export interface TopicProgress {
  topic: string;
  label: "Confident" | "Improving" | "Started" | "Not yet";
  percent: number;
}

export interface LibraryItem {
  id: string;
  title: string;
  meta: string;
  kind: "pdf" | "img";
  sizeMb: number;
  savedOffline: boolean;
  tab: "notes" | "past-papers" | "from-tutors";
  curriculumId: string;
  subjectId: string;
  /** Lesson notes and tutor files belong to one student; past papers are for everyone. */
  studentId?: string;
  addedAt?: string;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  initials: string;
  levelLabel: string;
  school: string;
  verifiedAnswers: number;
  points: number;
  isYou?: boolean;
}

export type LeaderboardScope = "school" | "botswana" | "global";
export type LeaderboardPeriod = "month" | "all";
