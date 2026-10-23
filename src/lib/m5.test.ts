import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  answerBlocks,
  contactError,
  similarQuestions,
  validateAnswer,
  validateQuestion,
  workingParts,
} from "./community";
import { CONTACT_MASK, findContactDetails, maskContactDetails } from "./contactSafety";
import { getCurriculum } from "./curricula";
import { createBooking, declinePaymentRequest, payPaymentRequest, requestParentPayment } from "./data/booking";
import {
  getAnswers,
  getLeaderboard,
  getQuestion,
  getQuestions,
  pointsEarned,
  postAnswer,
  toggleHelpful,
} from "./data/community";
import { acceptOffer, getMessages, sendMessage, shareFile } from "./data/messages";
import {
  addCard,
  getParentMonthTotals,
  getPaymentsForParent,
  getPaymentsForStudent,
  getStudentMonthTotals,
} from "./data/payments";
import { getChildrenForParent, updateParentProfile, updateStudentProfile } from "./data/profiles";
import { getLibraryItems, setSavedOffline } from "./data/resources";
import { cascadeProfile, profileLine, subjectTags, validateLearningProfile, yearOptions } from "./learningProfile";
import { IDS, MOCK_NOW_ISO } from "./mock/ids";
import { MESSAGES } from "./mock/messages";
import { LESEGO, MASEGO, NEO } from "./mock/users";
import { lockedPermissions } from "./permissions";
import type { BookingInput, ParentProfileInput } from "./types";

const now = MOCK_NOW_ISO;

describe("Contact safety (sections 7.8 and 7.10)", () => {
  it("finds phone numbers, emails, links and handles", () => {
    assert.deepEqual(findContactDetails("call me on 71 234 567"), ["phone"]);
    assert.deepEqual(findContactDetails("+267 7123 4567"), ["phone"]);
    assert.deepEqual(findContactDetails("mail neo.s@example.com"), ["email"]);
    assert.deepEqual(findContactDetails("see www.example.com"), ["link"]);
    assert.deepEqual(findContactDetails("wa.me/26771234567").includes("link"), true);
    assert.deepEqual(findContactDetails("dm me @neo_s"), ["handle"]);
  });

  it("leaves maths, times, prices and past paper names alone", () => {
    for (const text of [
      "x² − 2x − 8 = 0 so (x + 2)(x − 4) = 0",
      "2023 Paper 1 Q5",
      "Thu 23 Oct, 17:00–18:00 · P150",
      "Check: 2(3) + 3(2) = 12",
    ]) {
      assert.deepEqual(findContactDetails(text), [], text);
    }
  });

  it("masks every contact detail and says so", () => {
    const result = maskContactDetails("Text 71234567 or email me@example.com");
    assert.equal(result.masked, true);
    assert.equal(result.text, `Text ${CONTACT_MASK} or email ${CONTACT_MASK}`);
    assert.deepEqual(maskContactDetails("See you on Thursday"), { text: "See you on Thursday", masked: false });
  });
});

describe("Messages (section 7.10)", () => {
  it("masks contact details in sent messages", async () => {
    const { messages, masked } = await sendMessage("thread-neo-molefe", IDS.neo, { text: "my number is 71 234 567" }, now);
    assert.equal(masked, true);
    assert.equal(messages[0].text, `my number is ${CONTACT_MASK}`);
  });

  it("won't post into a thread you aren't in", async () => {
    await assert.rejects(sendMessage("thread-dineo-molefe", IDS.neo, { text: "hi" }, now));
  });

  it("adds files a tutor shares to the student's Library", async () => {
    const before = (await getLibraryItems(IDS.neo, "bgcse")).length;
    await shareFile("thread-neo-molefe", IDS.molefe, { name: "Quadratics_recap.pdf", kind: "pdf", sizeKb: 512 }, now);
    const items = await getLibraryItems(IDS.neo, "bgcse");
    assert.equal(items.length, before + 1);
    const added = items.find((item) => item.title === "Quadratics_recap.pdf");
    assert.equal(added?.tab, "from-tutors");
    assert.equal(added?.subjectId, "mathematics");
  });

  it("marks an offer accepted once checkout books it", async () => {
    const offer = MESSAGES.find((message) => message.kind === "lesson_offer" && message.offer?.status === "open");
    if (!offer) return;
    await acceptOffer(offer.id, "lesson-test");
    const after = (await getMessages(offer.threadId)).find((message) => message.id === offer.id);
    assert.equal(after?.offer?.status, "accepted");
    assert.equal(after?.offer?.lessonId, "lesson-test");
  });
});

describe("Payments stay in step with bookings (sections 7.11 and 7.16)", () => {
  const base: Omit<BookingInput, "start" | "payer"> = {
    studentId: IDS.neo,
    tutorId: IDS.molefe,
    durationMin: 60,
    curriculumId: "bgcse",
    subjectId: "mathematics",
    title: "Quadratics, part 3",
  };

  it("starts from the designed October totals", async () => {
    const student = await getStudentMonthTotals(IDS.neo);
    assert.equal(student.paidByStudent, 9000);
    assert.equal(student.paidByParent, 160500);
    assert.equal(student.waiting, 9000);
    const parent = await getParentMonthTotals(IDS.masego);
    assert.equal(parent.lessonsCount, 11);
    assert.equal(parent.lessonsAmount, 160500);
  });

  it("adds a row and a total when the student pays", async () => {
    const before = await getStudentMonthTotals(IDS.neo);
    const paidBefore = before.paidByStudent;
    const lesson = await createBooking({ ...base, start: "2026-11-03T19:00:00+02:00", payer: "student" });
    const after = await getStudentMonthTotals(IDS.neo);
    assert.equal(after.paidByStudent, paidBefore + lesson.price);
    const row = (await getPaymentsForStudent(IDS.neo))[0];
    assert.equal(row.lessonId, lesson.id);
    assert.equal(row.payerLabel, "You · Visa 7310");
    assert.equal(row.status, "paid");
  });

  it("moves a request from waiting to paid, on both screens", async () => {
    const request = await requestParentPayment({ ...base, start: "2026-11-04T19:00:00+02:00", payer: "parent" });
    let totals = await getStudentMonthTotals(IDS.neo);
    const waiting = totals.waiting;
    const paidByParent = totals.paidByParent;
    const parentCount = (await getParentMonthTotals(IDS.masego)).lessonsCount;
    assert.equal((await getPaymentsForStudent(IDS.neo))[0].payerLabel, "Masego (requested)");

    await payPaymentRequest(request.id);
    totals = await getStudentMonthTotals(IDS.neo);
    assert.equal(totals.waiting, waiting - request.amount);
    assert.equal(totals.paidByParent, paidByParent + request.amount);
    const studentRow = (await getPaymentsForStudent(IDS.neo)).find((row) => row.paymentRequestId === request.id);
    assert.equal(studentRow?.status, "paid");
    assert.equal(studentRow?.payerLabel, "Masego");
    assert.equal((await getParentMonthTotals(IDS.masego)).lessonsCount, parentCount + 1);
    assert.equal((await getPaymentsForParent(IDS.masego))[0].lessonId, request.lessonId);
  });

  it("drops the waiting row when a request is declined", async () => {
    const request = await requestParentPayment({ ...base, start: "2026-11-05T19:00:00+02:00", payer: "parent" });
    const waiting = (await getStudentMonthTotals(IDS.neo)).waiting;
    await declinePaymentRequest(request.id);
    assert.equal((await getStudentMonthTotals(IDS.neo)).waiting, waiting - request.amount);
    assert.equal(
      (await getPaymentsForStudent(IDS.neo)).some((row) => row.paymentRequestId === request.id),
      false,
    );
  });

  it("saves new cards and refuses duplicates", async () => {
    const card = await addCard(MASEGO, { brand: "visa", last4: "1188", expiry: "04/30" });
    assert.equal(card.last4, "1188");
    await assert.rejects(addCard(MASEGO, { brand: "visa", last4: "1188", expiry: "04/30" }));
    await assert.rejects(addCard(MASEGO, { brand: "visa", last4: "12", expiry: "04/30" }));
  });
});

describe("Library (section 7.6)", () => {
  it("shows 12 saved files, 48 MB, for Neo", async () => {
    const saved = (await getLibraryItems(IDS.neo, "bgcse")).filter((item) => item.savedOffline);
    assert.equal(saved.length, 12);
    assert.equal(Math.round(saved.reduce((sum, item) => sum + item.sizeMb, 0) * 10) / 10, 48);
  });

  it("toggles offline saving, but not on another student's files", async () => {
    const item = await setSavedOffline(IDS.neo, "lib-maths-2023-p2", true);
    assert.equal(item.savedOffline, true);
    await setSavedOffline(IDS.neo, "lib-maths-2023-p2", false);
    await assert.rejects(setSavedOffline(IDS.lesego, "lib-notes-oct-22", true));
  });
});

describe("Community (sections 7.7–7.9)", () => {
  it("works out counts and statuses from the answers, in activity order", async () => {
    const questions = await getQuestions();
    const byId = Object.fromEntries(questions.map((question) => [question.id, question]));
    assert.deepEqual(
      ["q-paper1-q5", "q-formula-vs-factor", "q-speed-velocity", "q-elimination", "q-argumentative-essay"].map(
        (id) => byId[id].answerCount,
      ),
      [3, 0, 2, 4, 1],
    );
    assert.equal(byId["q-paper1-q5"].status, "verified");
    assert.equal(byId["q-speed-velocity"].status, "answered");
    assert.deepEqual(
      questions.slice(0, 5).map((question) => question.id),
      ["q-paper1-q5", "q-formula-vs-factor", "q-speed-velocity", "q-elimination", "q-argumentative-essay"],
    );
  });

  it("pins the verified answer and gives it 35 points", async () => {
    const question = (await getQuestion("q-paper1-q5"))!;
    const answers = await getAnswers(question.id);
    assert.ok(answers[0].verifiedByTutorId);
    assert.equal(pointsEarned(answers[0], question), 35);
    assert.equal(pointsEarned(answers[1], question), 0);
  });

  it("validates answers: 40 characters and no contact details", () => {
    assert.match(validateAnswer("Too short") ?? "", /at least 40/);
    assert.match(validateAnswer("Set each bracket to zero, then call me on 71 234 567 for more") ?? "", /phone numbers/);
    assert.equal(validateAnswer("Set each bracket to zero and solve it, then check by substituting."), null);
  });

  it("validates questions", () => {
    assert.ok(validateQuestion({ title: "help", body: "", subjectId: "mathematics" }).title);
    assert.ok(validateQuestion({ title: "How do I complete the square?", body: "email me@example.com", subjectId: "mathematics" }).body);
    assert.ok(validateQuestion({ title: "How do I complete the square?", body: "", subjectId: "" }).subject);
    assert.deepEqual(validateQuestion({ title: "How do I complete the square?", body: "", subjectId: "mathematics" }), {});
    assert.equal(contactError("no contact here"), null);
  });

  it("posting an answer turns an unanswered question into an answered one", async () => {
    await postAnswer(
      IDS.neo,
      "q-formula-vs-factor",
      { body: "Try factorising first. If no two whole numbers work within a minute, use the formula." },
      now,
    );
    const question = await getQuestion("q-formula-vs-factor");
    assert.equal(question?.status, "answered");
    assert.equal(question?.answerCount, 1);
  });

  it("toggles helpful, but not on your own answer", async () => {
    const first = await toggleHelpful(IDS.neo, "ans-q5-amantle");
    assert.deepEqual(first, { pressed: true, count: 5 });
    const second = await toggleHelpful(IDS.neo, "ans-q5-amantle");
    assert.deepEqual(second, { pressed: false, count: 4 });
    const own = (await getAnswers("q-formula-vs-factor")).find((answer) => answer.authorId === IDS.neo)!;
    await assert.rejects(toggleHelpful(IDS.neo, own.id));
  });

  it("finds similar questions by shared words", async () => {
    const pool = await getQuestions();
    const similar = similarQuestions("Factorising quadratics with a negative constant", { curriculumId: "bgcse", subjectId: "mathematics" }, pool);
    assert.equal(similar[0]?.id, "q-negative-constant");
    assert.deepEqual(similarQuestions("hello", { curriculumId: "bgcse", subjectId: "mathematics" }, pool), []);
  });

  it("splits answer bodies into text and maths boxes, and reads crossed-out working", () => {
    const blocks = answerBlocks("Intro line.\n\n    x + 2 = 0\n    x = −2\n\nTip.");
    assert.deepEqual(blocks.map((block) => block.kind), ["text", "math", "text"]);
    assert.deepEqual(blocks[1].lines, ["x + 2 = 0", "x = −2"]);
    assert.deepEqual(workingParts("~~x = 2~~, x = 4"), [
      { text: "x = 2", struck: true },
      { text: ", x = 4", struck: false },
    ]);
  });

  it("ranks the leaderboard by scope", async () => {
    const botswana = await getLeaderboard({ scope: "botswana", subjectId: "mathematics", period: "month", viewerId: IDS.neo });
    const you = botswana.find((row) => row.isYou);
    assert.equal(you?.rank, 12);
    const school = await getLeaderboard({ scope: "school", subjectId: "mathematics", period: "month", viewerId: IDS.neo });
    assert.deepEqual(school.map((row) => [row.name, row.rank]), [["Kagelelo R.", 1], ["Neo S.", 2]]);
    assert.deepEqual(await getLeaderboard({ scope: "botswana", subjectId: "physics", period: "month", viewerId: IDS.neo }), []);
  });
});

describe("Profiles (sections 7.12 and 7.17)", () => {
  it("cascades the learning profile from curricula.ts", () => {
    assert.deepEqual(yearOptions("psle"), ["Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5", "Standard 6", "Standard 7"]);
    assert.deepEqual(yearOptions("jce"), ["Form 1", "Form 2", "Form 3"]);
    const jce = cascadeProfile(NEO.learningProfile, { curriculumId: "jce" });
    assert.equal(jce.year, "Form 1");
    const jceSubjects = new Set(getCurriculum("jce")!.subjects.map((subject) => subject.id));
    assert.ok(jce.subjectIds.length > 0);
    assert.ok(jce.subjectIds.every((id) => jceSubjects.has(id)));
    assert.ok(jce.goals.every((goal) => jceSubjects.has(goal.subjectId)));
    const primary = cascadeProfile(NEO.learningProfile, { level: "primary" });
    assert.equal(primary.curriculumId, "psle");
    assert.equal(primary.year, "Standard 1");
    assert.equal(cascadeProfile(NEO.learningProfile, { year: "Form 5" }).year, "Form 5");
  });

  it("describes children the way the parent profile shows them", () => {
    assert.equal(profileLine(NEO.learningProfile), "Form 4 · Secondary · Public · BGCSE");
    assert.equal(profileLine(LESEGO.learningProfile), "Standard 6 · Primary · Botswana national · PSLE");
    assert.deepEqual(subjectTags(LESEGO.learningProfile), ["PSLE · entire curriculum"]);
  });

  it("needs at least one subject and one goal per subject", () => {
    assert.ok(validateLearningProfile({ ...NEO.learningProfile, subjectIds: [] }).subjects);
    const twice = [{ subjectId: "physics", targetGrade: "B" }, { subjectId: "physics", targetGrade: "A" }];
    assert.ok(validateLearningProfile({ ...NEO.learningProfile, goals: twice }).goals);
  });

  it("keeps locked permissions locked", async () => {
    assert.deepEqual(lockedPermissions(LESEGO, LESEGO.learningProfile), { canPayOwnCard: false, parentSeesMessages: true });
    const children = await getChildrenForParent(IDS.masego);
    const input: ParentProfileInput = {
      fullName: "Masego Seretse",
      email: "masego.seretse@example.com",
      phone: "71123456",
      language: "English",
      notifications: MASEGO.notifications!,
      children: children.map((child) => ({
        id: child.id,
        learningProfile: child.learningProfile,
        permissions: { ...child.permissions, canPayOwnCard: true, parentSeesMessages: false },
      })),
    };
    await updateParentProfile(IDS.masego, input);
    assert.equal(LESEGO.permissions.canPayOwnCard, false);
    assert.equal(LESEGO.permissions.parentSeesMessages, true);
    assert.equal(NEO.permissions.parentSeesMessages, true);
    await assert.rejects(updateParentProfile(IDS.masego, { ...input, phone: "1234" }));
  });

  it("saves the student profile and rejects a curriculum outside the level", async () => {
    const base = {
      fullName: "Neo Seretse",
      email: "neo.seretse@example.com",
      learningProfile: NEO.learningProfile,
      preferences: NEO.preferences!,
    };
    await updateStudentProfile(IDS.neo, { ...base, preferences: { ...base.preferences, showOnLeaderboard: true } });
    assert.equal(NEO.preferences?.showOnLeaderboard, true);
    await assert.rejects(
      updateStudentProfile(IDS.neo, { ...base, learningProfile: { ...base.learningProfile, curriculumId: "psle" } }),
    );
    await assert.rejects(updateStudentProfile(IDS.neo, { ...base, email: "not-an-email" }));
  });
});
