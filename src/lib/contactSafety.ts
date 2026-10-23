export type ContactKind = "phone" | "email" | "link" | "handle";

export const CONTACT_MASK = "[hidden]";
export const CONTACT_NOTE = "Contact details are hidden to keep everyone safe.";

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;
const LINK =
  /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|co|bw|za|io|me|ly|app|info|biz|link|gg)(?:\/[^\s]*)?\b/gi;
const HANDLE = /(^|[\s(])@[a-z0-9_.]{2,}/gi;
/** Runs of digits with spaces, dots, dashes or brackets between them. Seven or more digits counts as a phone number. */
const DIGIT_RUN = /\+?\(?\d[\d\s().-]*\d/g;
const MIN_PHONE_DIGITS = 7;

function isPhone(candidate: string) {
  return candidate.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
}

export function findContactDetails(text: string): ContactKind[] {
  const found = new Set<ContactKind>();
  if (text.match(EMAIL)) found.add("email");
  const withoutEmails = text.replace(EMAIL, " ");
  if (withoutEmails.match(LINK)) found.add("link");
  if (withoutEmails.match(HANDLE)) found.add("handle");
  if ((withoutEmails.match(DIGIT_RUN) ?? []).some(isPhone)) found.add("phone");
  return [...found];
}

export function maskContactDetails(text: string): { text: string; masked: boolean } {
  const masked = text
    .replace(EMAIL, CONTACT_MASK)
    .replace(LINK, CONTACT_MASK)
    .replace(HANDLE, (_match, lead: string) => `${lead}${CONTACT_MASK}`)
    .replace(DIGIT_RUN, (match) => (isPhone(match) ? CONTACT_MASK : match));
  return { text: masked, masked: masked !== text };
}
