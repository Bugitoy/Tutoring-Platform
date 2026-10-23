import { POINTS, validateAnswer, validateQuestion } from "@/lib/community";
import { COMMUNITY_MEMBERS, LEADERBOARDS, QUESTIONS, ANSWERS, SCHOOL_OF_THE_MONTH } from "@/lib/mock/community";
import { STUDENTS } from "@/lib/mock/users";
import type {
  Answer,
  LeaderboardPeriod,
  LeaderboardRow,
  LeaderboardScope,
  Question,
  QuestionInput,
} from "@/lib/types";

export type CommunityMember = { name: string; initials: string; label: string };

export type QuestionWithActivity = Question & { lastActivityAt: string };

export function getMember(userId: string): CommunityMember {
  const known = COMMUNITY_MEMBERS[userId];
  if (known) return known;
  const student = STUDENTS.find((entry) => entry.id === userId);
  if (student) {
    const [first, last] = student.fullName.split(" ");
    return { name: last ? `${first} ${last[0]}.` : first, initials: student.initials, label: "Student" };
  }
  return { name: "Thanodi member", initials: "T", label: "Member" };
}

function answersFor(questionId: string) {
  return ANSWERS.filter((answer) => answer.questionId === questionId);
}

/** Status and answer count always come from the answers, so every screen agrees. */
function withActivity(question: Question): QuestionWithActivity {
  const answers = answersFor(question.id);
  const status = answers.some((answer) => answer.verifiedByTutorId) ? "verified" : answers.length > 0 ? "answered" : "unanswered";
  const lastActivityAt = answers.reduce(
    (latest, answer) => (answer.createdAt > latest ? answer.createdAt : latest),
    question.createdAt,
  );
  return { ...question, status, answerCount: answers.length, lastActivityAt };
}

/** Most recent activity first: a new answer brings a question back up. */
export async function getQuestions(): Promise<QuestionWithActivity[]> {
  return QUESTIONS.map(withActivity).sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}

export async function getQuestion(questionId: string): Promise<QuestionWithActivity | undefined> {
  const question = QUESTIONS.find((entry) => entry.id === questionId);
  return question ? withActivity(question) : undefined;
}

/** The verified answer is pinned first; the rest stay in the order they were posted. */
export async function getAnswers(questionId: string): Promise<Answer[]> {
  return answersFor(questionId).sort((a, b) => {
    const pinned = Number(Boolean(b.verifiedByTutorId)) - Number(Boolean(a.verifiedByTutorId));
    return pinned || a.createdAt.localeCompare(b.createdAt);
  });
}

/** Same subject and topic first, then the same subject. */
export async function getRelatedQuestions(question: Question, limit = 3): Promise<Question[]> {
  const sameSubject = QUESTIONS.filter(
    (entry) =>
      entry.id !== question.id && entry.curriculumId === question.curriculumId && entry.subjectId === question.subjectId,
  );
  const sameTopic = sameSubject.filter((entry) => question.topic && entry.topic === question.topic);
  return [...new Set([...sameTopic, ...sameSubject])].slice(0, limit);
}

/** Points the verified answer earned: the tutor's verification, plus the asker's helpful mark. */
export function pointsEarned(answer: Answer, question: Question): number {
  if (!answer.verifiedByTutorId) return 0;
  return POINTS.verified + (answer.helpfulBy?.includes(question.authorId) ? POINTS.helpful : 0);
}

export async function askQuestion(authorId: string, input: QuestionInput, now: string): Promise<Question> {
  const errors = validateQuestion(input);
  const first = errors.title ?? errors.body ?? errors.subject;
  if (first) throw new Error(first);
  const question: Question = {
    id: `q-${Date.now().toString(36)}`,
    authorId,
    title: input.title.trim(),
    body: input.body.trim(),
    curriculumId: input.curriculumId,
    subjectId: input.subjectId,
    status: "unanswered",
    createdAt: now,
    answerCount: 0,
    followerIds: [authorId],
  };
  QUESTIONS.unshift(question);
  return question;
}

export async function postAnswer(
  authorId: string,
  questionId: string,
  input: { body: string; imageName?: string },
  now: string,
): Promise<Answer> {
  const question = QUESTIONS.find((entry) => entry.id === questionId);
  if (!question) throw new Error("We couldn’t find that question.");
  const error = validateAnswer(input.body);
  if (error) throw new Error(error);
  const latest = answersFor(questionId).reduce((max, answer) => (answer.createdAt > max ? answer.createdAt : max), now);
  const answer: Answer = {
    id: `ans-${Date.now().toString(36)}`,
    questionId,
    authorId,
    body: input.body.trim(),
    helpfulCount: 0,
    helpfulBy: [],
    createdAt: latest > now ? latest : now,
    imageName: input.imageName,
  };
  ANSWERS.push(answer);
  return answer;
}

export async function toggleHelpful(userId: string, answerId: string): Promise<{ pressed: boolean; count: number }> {
  const answer = ANSWERS.find((entry) => entry.id === answerId);
  if (!answer) throw new Error("We couldn’t find that answer.");
  if (answer.authorId === userId) throw new Error("You can’t mark your own answer as helpful.");
  const by = (answer.helpfulBy ??= []);
  const pressed = !by.includes(userId);
  if (pressed) {
    by.push(userId);
    answer.helpfulCount += 1;
  } else {
    answer.helpfulBy = by.filter((id) => id !== userId);
    answer.helpfulCount = Math.max(0, answer.helpfulCount - 1);
  }
  return { pressed, count: answer.helpfulCount };
}

export async function toggleFollow(userId: string, questionId: string): Promise<boolean> {
  const question = QUESTIONS.find((entry) => entry.id === questionId);
  if (!question) throw new Error("We couldn’t find that question.");
  const followers = (question.followerIds ??= []);
  const following = !followers.includes(userId);
  question.followerIds = following ? [...followers, userId] : followers.filter((id) => id !== userId);
  return following;
}

export type LeaderboardQuery = {
  scope: LeaderboardScope;
  subjectId: string;
  period: LeaderboardPeriod;
  viewerId: string;
};

/**
 * Rows for one board, with `isYou` set for the viewer. "My school" keeps the viewer's school and
 * ranks within it.
 */
export async function getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardRow[]> {
  const board = LEADERBOARDS.find((entry) => entry.subjectId === query.subjectId && entry.period === query.period);
  if (!board) return [];
  const rows = board.rows.map((row) => ({ ...row, isYou: row.userId === query.viewerId }));
  if (query.scope !== "school") {
    // TODO(spec): there is no data from outside Botswana yet, so Global shows the Botswana board.
    return rows;
  }
  const school = rows.find((row) => row.isYou)?.school;
  if (!school) return [];
  return rows.filter((row) => row.school === school).map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function getBotswanaRank(userId: string, subjectId: string): Promise<number | undefined> {
  const board = LEADERBOARDS.find((entry) => entry.subjectId === subjectId && entry.period === "month");
  return board?.rows.find((row) => row.userId === userId)?.rank;
}

export async function getSchoolOfTheMonth() {
  return SCHOOL_OF_THE_MONTH;
}
