import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTutorEarnings, payOutNow } from "./data/earnings";
import { getReportsDue, getTutorDay, getTutorWeek, toggleOpenSlot } from "./data/lessons";
import { getTutorProfile, updateTutorProfile } from "./data/profiles";
import { buildReport, getReportForLesson, getReportsForParent, sendReport } from "./data/reports";
import { addResource, getTutorResources } from "./data/resources";
import { getTutorRoster, saveStudentNote } from "./data/tutorWorkspace";
import { gaboroneDate } from "./format";
import { lessonStatusView } from "./lessonStatus";
import { IDS, MOCK_NOW_ISO } from "./mock/ids";
import { LESSONS } from "./mock/lessons";
import { MOLEFE } from "./mock/tutors";
import {
  curriculumStatus,
  previewTags,
  selectedSubjects,
  setEntire,
  teachingFromOfferings,
  teachingListLabel,
  toggleCurriculum,
  toggleSubject,
} from "./teaching";
import { buildWeekGrid, formatWeekTitle, shortStudentName, weekCounts, weekStartOf } from "./tutorWeek";
import type { ReportInput, ResourceInput, TutorProfileInput } from "./types";

const now = MOCK_NOW_ISO;
const today = gaboroneDate(now);

const reportInput: ReportInput = {
  lessonId: "lesson-neo-oct-22-am",
  attendance: "on_time",
  comment: "Neo factorised every quadratic today and checked each root himself.",
  homework: { text: "Past paper 2023, Paper 1, questions 4–7", due: "2026-10-24T12:00:00+02:00" },
  takeaways: ["Set each bracket to zero.", "", "Check roots in the original equation."],
  takeawaysChecked: true,
};

describe("Tutor · Calendar week (section 7.19)", () => {
  it("counts the grid for the week of 19–25 October", async () => {
    const weekStart = weekStartOf(today);
    assert.equal(weekStart, "2026-10-19");
    assert.equal(formatWeekTitle(weekStart), "Week of 19–25 October");
    assert.equal(formatWeekTitle("2026-10-26"), "Week of 26 October – 1 November");

    const { lessons, open } = await getTutorWeek(IDS.molefe, weekStart);
    const grid = buildWeekGrid({ weekStart, lessons, open, now });
    assert.deepEqual(weekCounts(grid), { booked: 12, open: 9, expected: 176500 });
    assert.equal(grid.hours[0], 10, "the 10:00 lesson with Amantle widens the grid");
    assert.equal(grid.hours.at(-1), 20);
  });

  it("shortens student names for the cells", () => {
    assert.equal(shortStudentName("Neo Seretse"), "Neo S.");
    assert.equal(shortStudentName("Amantle K."), "Amantle K.");
  });
});

describe("Tutor · Today (section 7.18)", () => {
  it("shows today's lessons with the tutor pills", async () => {
    const lessons = await getTutorDay(IDS.molefe, today);
    const pills = lessons.map((lesson) => lessonStatusView(lesson, "tutor", { now }).label);
    assert.deepEqual(pills, ["Report sent", "Report due", "Starts in 2 h", "Confirmed"]);
    assert.deepEqual((await getReportsDue(IDS.molefe)).map((lesson) => lesson.id), ["lesson-neo-oct-22-am"]);
  });

  it("rejects a report that is too short or missing late minutes", () => {
    assert.throws(() => buildReport({ ...reportInput, comment: "Good lesson." }, {}, now), /30 characters/);
    assert.throws(() => buildReport({ ...reportInput, attendance: "late" }, {}, now), /minutes late/);
    const report = buildReport(reportInput, { aiDrafted: true }, now);
    assert.deepEqual(report.takeaways, ["Set each bracket to zero.", "Check roots in the original equation."]);
    assert.equal(report.tutorApproved, true);
  });
});

describe("Tutor · Students (section 7.20)", () => {
  it("derives next lesson and homework pills from lessons and reports", async () => {
    const roster = await getTutorRoster(IDS.molefe, now);
    assert.deepEqual(
      roster.map((row) => [row.student.firstName, row.course, row.homework.label]),
      [
        ["Neo", "BGCSE Maths", "Handed in"],
        ["Amantle", "IGCSE Maths", "Handed in"],
        ["Kabelo", "BGCSE Maths", "Handed in"],
        ["Lesego", "JCE Maths", "None set"],
        ["Tumi", "IGCSE Maths", "Due Mon"],
        ["Oratile", "BGCSE Maths", "None set"],
      ],
    );
    assert.equal(roster[0].goal, "Pass BGCSE Maths with a B or better");
    assert.equal(roster[0].nextLessonStart, "2026-10-22T17:00:00+02:00");
    assert.equal(roster[1].goal, "Pass IGCSE Maths with an A or better");
  });
});

describe("What you teach (section 8.6)", () => {
  it("toggles curricula, the entire switch and single subjects", () => {
    let state = teachingFromOfferings(MOLEFE.offerings);
    assert.equal(curriculumStatus(state, "bgcse"), "1 subject");
    assert.equal(curriculumStatus(state, "psle"), "Not selected");

    state = toggleCurriculum(state, "psle");
    assert.equal(curriculumStatus(state, "psle"), "Pick subjects below");

    state = setEntire(state, "psle", true);
    assert.equal(curriculumStatus(state, "psle"), "Entire curriculum");
    const all = selectedSubjects(state, "psle").length;

    state = toggleSubject(state, "psle", "setswana");
    assert.equal(curriculumStatus(state, "psle"), `${all - 1} subjects`);
    assert.ok(!selectedSubjects(state, "psle").includes("setswana"));

    state = toggleCurriculum(state, "psle");
    assert.equal(curriculumStatus(state, "psle"), "Not selected");
    assert.ok(state.offerings.every((offering) => offering.curriculumId !== "psle"));

    assert.equal(teachingListLabel({ curriculumId: "psle", entireCurriculum: true }), "PSLE · entire curriculum");
    assert.equal(teachingListLabel({ curriculumId: "bgcse", subjectId: "mathematics" }), "BGCSE · Mathematics");
  });

  it("builds preview tags from curricula, verification and languages", () => {
    assert.deepEqual(previewTags(MOLEFE.offerings, MOLEFE.verification, MOLEFE.languages), [
      "JCE",
      "BGCSE",
      "BSSE",
      "IGCSE",
      "Verified",
      "Setswana",
    ]);
  });
});

describe("After-class report feeds three screens (section 8.3)", () => {
  it("changes Report due to Report sent and shows the report to the student and parent", async () => {
    assert.equal(await getReportForLesson("lesson-neo-oct-22-am"), undefined);
    const before = await getReportsForParent(IDS.masego, IDS.neo);
    assert.equal(before[0].lesson.id, "lesson-neo-oct-20");

    const { lesson } = await sendReport(reportInput, IDS.molefe, now);
    assert.equal(lessonStatusView(lesson, "tutor", { now }).label, "Report sent");
    assert.equal((await getReportForLesson(lesson.id))?.comment, reportInput.comment);

    const after = await getReportsForParent(IDS.masego, IDS.neo);
    assert.equal(after[0].lesson.id, "lesson-neo-oct-22-am");
    assert.deepEqual(await getReportsDue(IDS.molefe), []);

    const roster = await getTutorRoster(IDS.molefe, now);
    assert.equal(roster[0].homework.label, "Due Sat");
    await assert.rejects(sendReport(reportInput, IDS.molefe, now), /already been sent/);
  });
});

describe("Tutor workspace saves", () => {
  it("toggles an open slot but never a booked or past one", async () => {
    const start = "2026-10-29T13:00:00+02:00";
    const first = await toggleOpenSlot(IDS.molefe, start, now);
    const second = await toggleOpenSlot(IDS.molefe, start, now);
    assert.notEqual(first, second);

    const booked = LESSONS.find(
      (lesson) => lesson.tutorId === IDS.molefe && new Date(lesson.start) > new Date(now) && lesson.status !== "cancelled",
    );
    assert.ok(booked);
    await assert.rejects(toggleOpenSlot(IDS.molefe, booked.start, now), /already booked|is booked/);
    await assert.rejects(toggleOpenSlot(IDS.molefe, "2026-10-20T13:00:00+02:00", now), /already passed/);
  });

  it("saves a private note that the Students page reads back", async () => {
    await saveStudentNote(IDS.molefe, IDS.neo, "Prefers worked examples first.");
    const neo = (await getTutorRoster(IDS.molefe, now)).find((row) => row.student.id === IDS.neo);
    assert.equal(neo?.privateNote, "Prefers worked examples first.");
    await assert.rejects(saveStudentNote(IDS.molefe, "student-nobody", "x"), /couldn’t find/);
  });

  it("validates an upload and puts it first in My resources", async () => {
    const input: ResourceInput = {
      title: "  Trig ratios drill  ",
      fileName: "trig.pdf",
      kind: "pdf",
      curriculumId: "bgcse",
      subjectId: "mathematics",
      visibility: "for_sale",
    };
    await assert.rejects(addResource(IDS.molefe, { ...input, title: " " }, now), /title/);
    await assert.rejects(addResource(IDS.molefe, { ...input, fileName: "" }, now), /Choose a file/);
    await assert.rejects(addResource(IDS.molefe, { ...input, price: 0 }, now), /above P0/);

    const resource = await addResource(IDS.molefe, input, now);
    assert.equal(resource.title, "Trig ratios drill");
    assert.equal(resource.price, undefined);
    assert.equal((await getTutorResources(IDS.molefe))[0].id, resource.id);
  });

  it("pays out the ready balance once", async () => {
    const { readyToPayout } = await getTutorEarnings(IDS.molefe);
    assert.ok(readyToPayout > 0);
    assert.deepEqual(await payOutNow(IDS.molefe), { amount: readyToPayout, bankLast4: "2210" });
    assert.equal((await getTutorEarnings(IDS.molefe)).readyToPayout, 0);
    await assert.rejects(payOutNow(IDS.molefe), /nothing ready/);
  });

  it("saves Profile & pricing to the record search reads", async () => {
    const input: TutorProfileInput = {
      headline: "  Maths teacher · 7 years ",
      bio: MOLEFE.bio,
      offerings: [{ curriculumId: "jce", subjectId: "mathematics" }],
      languages: ["English"],
      prices: { min60: 16000, min45: 12000, min30: 8000 },
      freeTrial: false,
    };
    await assert.rejects(updateTutorProfile(IDS.molefe, { ...input, offerings: [] }), /at least one subject/);
    await assert.rejects(updateTutorProfile(IDS.molefe, { ...input, languages: [] }), /language/);
    await assert.rejects(
      updateTutorProfile(IDS.molefe, { ...input, prices: { ...input.prices, min30: 0 } }),
      /price for every lesson length/,
    );

    await updateTutorProfile(IDS.molefe, input);
    const saved = await getTutorProfile(IDS.molefe);
    assert.equal(saved?.headline, "Maths teacher · 7 years");
    assert.equal(saved?.prices.min60, 16000);
    assert.deepEqual(previewTags(saved?.offerings ?? [], MOLEFE.verification, saved?.languages ?? []), ["JCE", "Verified"]);
  });
});
