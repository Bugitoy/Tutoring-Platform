import { findContactDetails, type ContactKind } from "@/lib/contactSafety";

export const MIN_ANSWER_LENGTH = 40;
export const MAX_ANSWER_LENGTH = 4000;
export const MIN_TITLE_LENGTH = 10;
export const MAX_TITLE_LENGTH = 150;
export const MAX_DETAILS_LENGTH = 2000;

export const POINTS = { helpful: 10, verified: 25, question: 2 } as const;

export const LEVELS = [
  { level: 1, label: "Learner", min: 0 },
  { level: 3, label: "Helper", min: 250 },
  { level: 5, label: "Expert helper", min: 1000 },
  { level: 7, label: "Community mentor", min: 3000 },
] as const;

const KIND_WORDS: Record<ContactKind, string> = {
  phone: "phone numbers",
  email: "email addresses",
  link: "links",
  handle: "social handles",
};

function listWords(words: string[]) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} or ${words[words.length - 1]}`;
}

/** "Remove phone numbers or links. The community keeps contact details off Thanodi." or null. */
export function contactError(text: string): string | null {
  const kinds = findContactDetails(text);
  if (kinds.length === 0) return null;
  const words = listWords(kinds.map((kind) => KIND_WORDS[kind]));
  return `Remove ${words}. Contact details aren’t allowed in the community.`;
}

export function validateAnswer(body: string): string | null {
  const text = body.trim();
  if (text.length < MIN_ANSWER_LENGTH) {
    return `Explain the steps in at least ${MIN_ANSWER_LENGTH} characters (${text.length} so far).`;
  }
  if (text.length > MAX_ANSWER_LENGTH) return `Keep your answer under ${MAX_ANSWER_LENGTH} characters.`;
  return contactError(text);
}

export type QuestionErrors = { title?: string; body?: string; subject?: string };

export function validateQuestion(input: { title: string; body: string; subjectId: string }): QuestionErrors {
  const errors: QuestionErrors = {};
  const title = input.title.trim();
  if (title.length < MIN_TITLE_LENGTH) errors.title = "Write your question in a sentence, so others know what you’re stuck on.";
  else if (title.length > MAX_TITLE_LENGTH) errors.title = `Keep the title under ${MAX_TITLE_LENGTH} characters. Put the rest in the details.`;
  else {
    const contact = contactError(title);
    if (contact) errors.title = contact;
  }
  if (input.body.length > MAX_DETAILS_LENGTH) errors.body = `Keep the details under ${MAX_DETAILS_LENGTH} characters.`;
  else {
    const contact = contactError(input.body);
    if (contact) errors.body = contact;
  }
  if (!input.subjectId) errors.subject = "Choose a subject.";
  return errors;
}

const STOP_WORDS = new Set(
  "a an and are as at be but by can do does for from get how i if in is it me my of on or so that the this to use what when where which why with you your".split(" "),
);

function words(text: string) {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9²]+/)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word)),
  );
}

type Similarable = { id: string; title: string; curriculumId: string; subjectId: string };

/** Questions sharing at least two meaningful words with `title`, same subject first. */
export function similarQuestions<T extends Similarable>(
  title: string,
  subject: { curriculumId: string; subjectId: string },
  pool: T[],
  limit = 3,
): T[] {
  const wanted = words(title);
  if (wanted.size === 0) return [];
  return pool
    .map((question) => {
      const shared = [...words(question.title)].filter((word) => wanted.has(word)).length;
      const sameSubject = question.subjectId === subject.subjectId ? 1 : 0;
      const sameCurriculum = question.curriculumId === subject.curriculumId ? 0.5 : 0;
      return { question, shared, score: shared * 2 + sameSubject + sameCurriculum };
    })
    .filter((entry) => entry.shared >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.question);
}

/** Answer bodies: blank lines split blocks; a block whose lines are all indented four spaces is a maths box. */
export function answerBlocks(body: string): { kind: "text" | "math"; lines: string[] }[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.replace(/^\n+|\n+$/g, ""))
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split("\n");
      const math = lines.every((line) => line.startsWith("    "));
      return { kind: math ? "math" : "text", lines: math ? lines.map((line) => line.slice(4)) : lines };
    });
}

/** "~~x = 2~~, x = 4" → [{ text: "x = 2", struck: true }, { text: ", x = 4", struck: false }] */
export function workingParts(line: string): { text: string; struck: boolean }[] {
  return line
    .split(/(~~[^~]+~~)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("~~") && part.endsWith("~~") ? { text: part.slice(2, -2), struck: true } : { text: part, struck: false },
    );
}

export function levelLabel(level: number): string {
  const match = [...LEVELS].reverse().find((entry) => entry.level <= level);
  return `Level ${level} · ${match?.label ?? "Learner"}`;
}
