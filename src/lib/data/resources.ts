import { LIBRARY_ITEMS, RESOURCES, SYLLABUS_DOCUMENTS } from "@/lib/mock/resources";
import type { LibraryItem, Resource, ResourceInput, SyllabusDocument } from "@/lib/types";

export async function getTutorResources(tutorId: string): Promise<Resource[]> {
  return RESOURCES.filter((resource) => resource.tutorId === tutorId);
}

/** Resources other tutors have put up for sale. */
export async function getSharedResources(tutorId: string): Promise<Resource[]> {
  return RESOURCES.filter((resource) => resource.tutorId !== tutorId && resource.visibility === "for_sale");
}

export async function getSyllabusDocuments(): Promise<SyllabusDocument[]> {
  return SYLLABUS_DOCUMENTS;
}

/** The student's own notes and tutor files, plus past papers for their curriculum. Newest first. */
export async function getLibraryItems(studentId: string, curriculumId: string): Promise<LibraryItem[]> {
  return LIBRARY_ITEMS.filter((item) =>
    item.studentId ? item.studentId === studentId : item.curriculumId === curriculumId,
  ).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
}

/** v1 only flips the flag; the service worker and Cache API do the real saving later. */
export async function setSavedOffline(studentId: string, itemId: string, saved: boolean): Promise<LibraryItem> {
  const item = LIBRARY_ITEMS.find((entry) => entry.id === itemId && (!entry.studentId || entry.studentId === studentId));
  if (!item) throw new Error("We couldn’t find that file.");
  item.savedOffline = saved;
  return item;
}

export async function addResource(tutorId: string, input: ResourceInput, now: string): Promise<Resource> {
  const title = input.title.trim();
  if (!title) throw new Error("Give the resource a title.");
  if (!input.fileName) throw new Error("Choose a file to upload.");
  if (input.visibility === "for_sale" && input.price !== undefined && input.price <= 0) {
    throw new Error("Enter a price above P0.");
  }

  const resource: Resource = {
    id: `res-${Date.now().toString(36)}`,
    tutorId,
    title,
    kind: input.kind,
    curriculumId: input.curriculumId,
    subjectId: input.subjectId,
    visibility: input.visibility,
    price: input.visibility === "for_sale" ? input.price : undefined,
    usedInLessons: 0,
    updatedAt: now,
  };
  RESOURCES.unshift(resource);
  return resource;
}
