import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gridRange, monthGrid } from "./calendar";
import { getLessonsForParent, getLessonsForStudent, getParentMonthSummary, getUpcomingLessons, getPastLessons } from "./data/lessons";
import { gaboroneDate } from "./format";
import { lessonStatusView, parentPayerNote } from "./lessonStatus";
import { IDS, MOCK_NOW_ISO } from "./mock/ids";
import { LESSONS } from "./mock/lessons";

const now = MOCK_NOW_ISO;
const lesson = (id: string) => {
  const found = LESSONS.find((item) => item.id === id);
  assert.ok(found, id);
  return found;
};

describe("month grid", () => {
  it("lays October 2026 out Monday-first with adjacent days", () => {
    const weeks = monthGrid("2026-10");
    assert.equal(weeks.length, 5);
    assert.deepEqual(gridRange("2026-10"), { from: "2026-09-28", to: "2026-11-01" });
    assert.equal(weeks[3][3], "2026-10-22");
  });
});

describe("Student · My lessons October data (section 7.2)", () => {
  it("puts the right lessons on each date, including 1 Nov", async () => {
    const lessons = await getLessonsForStudent(IDS.neo, "2026-10");
    const byDate = new Map<string, string[]>();
    for (const item of lessons) {
      const date = gaboroneDate(item.start);
      byDate.set(date, [...(byDate.get(date) ?? []), item.subjectId]);
    }
    assert.deepEqual(Object.fromEntries(byDate), {
      "2026-10-04": ["physics"],
      "2026-10-06": ["mathematics"],
      "2026-10-08": ["mathematics"],
      "2026-10-11": ["physics"],
      "2026-10-13": ["mathematics"],
      "2026-10-15": ["mathematics"],
      "2026-10-18": ["physics"],
      "2026-10-20": ["mathematics"],
      "2026-10-22": ["mathematics", "mathematics"],
      "2026-10-24": ["mathematics"],
      "2026-10-25": ["physics"],
      "2026-10-28": ["mathematics"],
      "2026-11-01": ["physics"],
    });
  });

  it("maps statuses through one helper", () => {
    const ctx = { now, parentName: "Masego" };
    const done = lessonStatusView(lesson("lesson-neo-oct-22-am"), "student", ctx);
    assert.equal(done.label, "Done");
    assert.equal(done.chip, "done");
    assert.equal(done.action?.label, "View summary");

    const next = lessonStatusView(lesson("lesson-neo-oct-22-pm"), "student", ctx);
    assert.equal(next.label, "Starts in 1 h 52 min");
    assert.equal(next.action?.href, "/lesson/lesson-neo-oct-22-pm");

    const missed = lessonStatusView(lesson("lesson-neo-oct-15"), "student", ctx);
    assert.equal(missed.chip, "missed");
    assert.equal(missed.action?.label, "Rebook");

    const waiting = lessonStatusView(lesson("lesson-neo-nov-01"), "student", ctx);
    assert.equal(waiting.label, "Waiting for Masego to pay");
    assert.equal(waiting.chip, "pending");
  });

  it("lists the next 4 upcoming lessons after the hero and the last 3 done", async () => {
    const upcoming = await getUpcomingLessons(IDS.neo, now, 4, "lesson-neo-oct-22-pm");
    assert.deepEqual(
      upcoming.map((item) => item.id),
      ["lesson-neo-oct-24", "lesson-neo-oct-25", "lesson-neo-oct-28", "lesson-neo-nov-01"],
    );
    const past = await getPastLessons(IDS.neo, now, 3);
    assert.deepEqual(
      past.map((item) => item.title),
      ["Quadratics, part 1", "Completing the square", "Speed, distance and time"],
    );
  });
});

describe("Parent · Calendar October data (section 7.14)", () => {
  it("shows both children’s lessons with the cancelled and refunded one", async () => {
    const lessons = await getLessonsForParent(IDS.masego, "2026-10");
    const lesego = lessons.filter((item) => item.studentId === IDS.lesego).map((item) => gaboroneDate(item.start));
    assert.deepEqual(lesego, ["2026-10-07", "2026-10-14", "2026-10-16", "2026-10-21", "2026-10-28"]);

    const cancelled = lessonStatusView(lesson("lesson-lesego-oct-16"), "parent", { now });
    assert.equal(cancelled.label, "Cancelled · refunded");
    assert.equal(cancelled.action?.label, "Payments");

    assert.equal(parentPayerNote(lesson("lesson-neo-oct-11"), "Neo"), "Neo paid");
    assert.equal(parentPayerNote(lesson("lesson-neo-nov-01"), "Neo"), "Neo asked you to pay");
    assert.equal(parentPayerNote(lesson("lesson-neo-oct-22-pm"), "Neo"), "you paid");
  });

  it("matches “October so far”", async () => {
    const summary = await getParentMonthSummary(IDS.masego, [IDS.neo, IDS.lesego], "2026-10", now);
    assert.deepEqual(summary.children, [
      { studentId: IDS.neo, attended: 8, held: 9 },
      { studentId: IDS.lesego, attended: 3, held: 3 },
    ]);
    assert.equal(summary.stillToCome, 5);
    assert.deepEqual(summary.waiting, { count: 1, amount: 9000 });
  });
});
