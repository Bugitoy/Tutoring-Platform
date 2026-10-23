"use server";

import { revalidatePath } from "next/cache";
import { askQuestion, postAnswer, toggleFollow, toggleHelpful } from "@/lib/data/community";
import { MOCK_NOW_ISO } from "@/lib/mock/ids";
import type { QuestionInput } from "@/lib/types";
import { attempt, sessionUserId } from "./attempt";

export async function askCommunityQuestion(input: QuestionInput) {
  return attempt(async () => {
    const question = await askQuestion(await sessionUserId("student"), input, MOCK_NOW_ISO);
    revalidatePath("/student/community");
    return { questionId: question.id };
  });
}

export async function postCommunityAnswer(questionId: string, input: { body: string; imageName?: string }) {
  return attempt(async () => {
    const answer = await postAnswer(await sessionUserId("student"), questionId, input, MOCK_NOW_ISO);
    revalidatePath(`/student/community/${questionId}`);
    revalidatePath("/student/community");
    return { answerId: answer.id };
  });
}

export async function markHelpful(questionId: string, answerId: string) {
  return attempt(async () => {
    const result = await toggleHelpful(await sessionUserId("student"), answerId);
    revalidatePath(`/student/community/${questionId}`);
    return result;
  });
}

export async function followQuestion(questionId: string) {
  return attempt(async () => {
    const following = await toggleFollow(await sessionUserId("student"), questionId);
    revalidatePath(`/student/community/${questionId}`);
    return { following };
  });
}
