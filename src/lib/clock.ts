import { MOCK_NOW_ISO } from "./mock/ids";

/** The demo clock. Every "now" in the UI reads from here until real data is connected. */
export function nowIso(): string {
  return MOCK_NOW_ISO;
}
