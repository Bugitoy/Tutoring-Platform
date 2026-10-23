import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTACT_MASK } from "./contactSafety";
import { getReportsDue } from "./data/lessons";
import { endLesson, getLessonRoom, markLessonChatRead, sendLessonChat, setVideoQuality } from "./data/room";
import { lessonStatusView } from "./lessonStatus";
import { IDS, MOCK_NOW_ISO } from "./mock/ids";
import { LESSONS } from "./mock/lessons";
import { getStudentById } from "./mock/users";
import {
  connectionQuality,
  dataNote,
  elapsedMs,
  formatElapsed,
  leaveHref,
  modeBadge,
  roomAccess,
  roomRoleParam,
  unreadCount,
} from "./room";

const PM = "lesson-neo-oct-22-pm";
const lesson = (id: string) => LESSONS.find((item) => item.id === id)!;

describe("room access", () => {
  it("lets the lesson's own student and tutor in", () => {
    assert.deepEqual(roomAccess(lesson(PM), "student", IDS.neo), { ok: true, role: "student" });
    assert.deepEqual(roomAccess(lesson(PM), "tutor", IDS.molefe), { ok: true, role: "tutor" });
  });

  it("keeps parents and other people out", () => {
    assert.deepEqual(roomAccess(lesson(PM), "parent", IDS.masego), { ok: false, reason: "parent" });
    assert.deepEqual(roomAccess(lesson(PM), "student", IDS.amantle), { ok: false, reason: "not_participant" });
  });

  it("closes finished lessons", () => {
    assert.deepEqual(roomAccess(lesson("lesson-neo-oct-22-am"), "student", IDS.neo), { ok: false, reason: "ended" });
  });

  it("reads the role from ?as=", () => {
    assert.equal(roomRoleParam("tutor"), "tutor");
    assert.equal(roomRoleParam("parent"), "parent");
    assert.equal(roomRoleParam(undefined), "student");
    assert.equal(roomRoleParam("admin"), "student");
  });
});

describe("live timer", () => {
  it("formats minutes and seconds, then hours", () => {
    assert.equal(formatElapsed((24 * 60 + 13) * 1000), "24:13");
    assert.equal(formatElapsed(0), "00:00");
    assert.equal(formatElapsed((62 * 60 + 5) * 1000), "1:02:05");
  });

  it("counts from the start, or from joining when early", () => {
    const start = "2026-10-22T17:00:00+02:00";
    const startMs = new Date(start).getTime();
    assert.equal(elapsedMs(start, startMs + 90_000, startMs - 60_000), 90_000);
    assert.equal(elapsedMs(start, startMs - 50_000, startMs - 60_000), 10_000);
  });
});

describe("quality and voice only", () => {
  it("shows the data note for the selection (section 7.1)", () => {
    assert.equal(dataNote("hd", false), "HD video · est. 1.2 GB per hour");
    assert.equal(dataNote("auto", false), "Auto quality · adjusts to your connection");
    assert.equal(dataNote("data_saver", false), "Data saver · est. 300 MB per hour");
    assert.equal(dataNote("hd", true), "Voice only · est. 40 MB per hour");
  });

  it("labels the phone corner badge", () => {
    assert.equal(modeBadge("data_saver", false), "Data saver on");
    assert.equal(modeBadge("auto", true), "Voice only");
  });

  it("judges the connection from the browser estimate", () => {
    assert.equal(connectionQuality("4g"), "good");
    assert.equal(connectionQuality(undefined), "good");
    assert.equal(connectionQuality("3g"), "fair");
  });

  it("remembers the student's last choice in their profile", async () => {
    await setVideoQuality(IDS.neo, "data_saver");
    const neo = getStudentById(IDS.neo)!;
    assert.equal(neo.preferences?.videoQuality, "data_saver");
    assert.equal(neo.preferences?.remindBeforeLesson, true);
    await setVideoQuality(IDS.neo, "auto");
  });
});

describe("lesson chat", () => {
  it("starts with two unread messages from the tutor for Neo", async () => {
    const room = await getLessonRoom(PM);
    assert.ok(room);
    assert.equal(unreadCount(room.chat, IDS.neo), 2);
    assert.equal(unreadCount(room.chat, IDS.molefe), 0);
    assert.ok(room.board?.graph);
  });

  it("masks contact details and only lets participants post", async () => {
    const { message, masked } = await sendLessonChat(PM, IDS.neo, "Call me on 71 234 567", MOCK_NOW_ISO);
    assert.equal(masked, true);
    assert.ok(message.text.includes(CONTACT_MASK));
    await assert.rejects(sendLessonChat(PM, IDS.amantle, "Hi", MOCK_NOW_ISO));
    await assert.rejects(sendLessonChat(PM, IDS.neo, "   ", MOCK_NOW_ISO));
  });

  it("marks the tutor's messages read when Neo opens chat", async () => {
    await markLessonChatRead(PM, IDS.neo, MOCK_NOW_ISO);
    const room = await getLessonRoom(PM);
    assert.equal(unreadCount(room!.chat, IDS.neo), 0);
  });
});

describe("leaving", () => {
  it("sends students to My lessons and tutors to the report", () => {
    assert.equal(leaveHref("student", PM), "/student/lessons");
    assert.equal(leaveHref("tutor", PM), `/tutor?report=${PM}#after-class-report`);
  });

  it("links tutors into the room as the tutor", () => {
    const live = { ...lesson(PM), status: "live" as const };
    assert.equal(lessonStatusView(live, "tutor", { now: MOCK_NOW_ISO }).action?.href, `/lesson/${PM}?as=tutor`);
    assert.equal(lessonStatusView(live, "student", { now: MOCK_NOW_ISO }).action?.href, `/lesson/${PM}`);
  });

  it("ends the lesson when the tutor leaves, so the report is due", async () => {
    await assert.rejects(endLesson(PM, IDS.neo));
    const ended = await endLesson(PM, IDS.molefe);
    assert.equal(ended.status, "completed");
    assert.equal(ended.reportStatus, "report_due");
    const due = await getReportsDue(IDS.molefe);
    assert.ok(due.some((item) => item.id === PM));
    assert.deepEqual(roomAccess(ended, "student", IDS.neo), { ok: false, reason: "ended" });
  });
});
