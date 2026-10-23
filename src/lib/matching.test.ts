import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { offeringMatches, tutorMatchesFilter, withCurriculum, withLevel, withSystem } from "./matching";
import { KGOSI, MOLEFE, MOSWEU, NKWE, SEBEGO, TUTORS } from "./mock/tutors";
import type { TutorFilter } from "./types";

function names(filter: TutorFilter) {
  return TUTORS.filter((tutor) => tutorMatchesFilter(tutor, filter)).map((tutor) => tutor.fullName);
}

describe("tutor matching", () => {
  it("shows Molefe and Sebego for BGCSE Mathematics", () => {
    assert.deepEqual(
      names({
        level: "secondary",
        system: "national",
        curriculumId: "bgcse",
        subjectId: "mathematics",
      }),
      [MOLEFE.fullName, SEBEGO.fullName],
    );
  });

  it("shows Mosweu and Nkwe for PSLE, any subject", () => {
    assert.deepEqual(
      names({
        level: "primary",
        system: "national",
        curriculumId: "psle",
        subjectId: "any",
      }),
      [MOSWEU.fullName, NKWE.fullName],
    );
  });

  it("treats an entire-curriculum offering as a match for a specific subject", () => {
    assert.equal(
      offeringMatches(
        { curriculumId: "psle", entireCurriculum: true },
        { level: "primary", system: "national", curriculumId: "psle", subjectId: "mathematics" },
      ),
      true,
    );
    assert.equal(
      offeringMatches(
        { curriculumId: "psle", subjectId: "english" },
        { curriculumId: "psle", subjectId: "mathematics" },
      ),
      false,
    );
  });

  it("shows Kgosi for IB Diploma Chemistry", () => {
    assert.deepEqual(
      names({
        level: "secondary",
        system: "international",
        curriculumId: "ib-dp",
        subjectId: "chemistry",
      }),
      [KGOSI.fullName],
    );
  });
});

describe("filter cascade", () => {
  it("clears an IB Diploma selection when level changes to Primary", () => {
    const next = withLevel(
      {
        level: "secondary",
        system: "international",
        curriculumId: "ib-dp",
        subjectId: "chemistry",
      },
      "primary",
    );
    assert.equal(next.level, "primary");
    assert.equal(next.curriculumId, "any");
    assert.equal(next.subjectId, "any");
  });

  it("clears a national curriculum when the system becomes international", () => {
    const next = withSystem(
      {
        level: "secondary",
        system: "national",
        curriculumId: "bgcse",
        subjectId: "mathematics",
      },
      "international",
    );
    assert.equal(next.curriculumId, "any");
    assert.equal(next.subjectId, "any");
  });

  it("resets the subject when the curriculum changes", () => {
    const next = withCurriculum(
      {
        level: "secondary",
        system: "national",
        curriculumId: "bgcse",
        subjectId: "mathematics",
      },
      "jce",
    );
    assert.equal(next.curriculumId, "jce");
    assert.equal(next.subjectId, "any");
  });
});
