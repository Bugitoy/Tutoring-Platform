"use client";

import { useState } from "react";
import { cn } from "cn";

type Tone = "good" | "fair" | "bad";
type Result = { label: string; tone: Tone };
type Results = { camera: Result; microphone: Result; connection: Result };

const TONE_CLASS: Record<Tone, string> = {
  good: "text-room-good",
  fair: "text-room-fair",
  bad: "text-status-live-fg",
};

async function checkDevice(kind: "video" | "audio"): Promise<Result> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ [kind]: true });
    stream.getTracks().forEach((track) => track.stop());
    return { label: "Working", tone: "good" };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError") return { label: "Blocked", tone: "bad" };
    if (name === "NotFoundError") return { label: "Not found", tone: "bad" };
    return { label: "Not working", tone: "bad" };
  }
}

function checkConnection(): Result {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  switch (connection?.effectiveType) {
    case "4g":
      return { label: "Good", tone: "good" };
    case "2g":
    case "slow-2g":
      return { label: "Weak · Audio only", tone: "bad" };
    default:
      return { label: "Fair · Auto quality", tone: "fair" };
  }
}

const ROWS = [
  { key: "camera", label: "Camera" },
  { key: "microphone", label: "Microphone" },
  { key: "connection", label: "Connection" },
] as const;

/** Asks for camera and microphone access only when the student starts the check. */
export function SetupCheck() {
  const [results, setResults] = useState<Results | null>(null);
  const [checking, setChecking] = useState(false);

  async function run() {
    if (checking) return;
    setChecking(true);
    const supported = Boolean(navigator.mediaDevices?.getUserMedia);
    const unsupported: Result = { label: "Not supported", tone: "bad" };
    const camera = supported ? await checkDevice("video") : unsupported;
    const microphone = supported ? await checkDevice("audio") : unsupported;
    setResults({ camera, microphone, connection: checkConnection() });
    setChecking(false);
  }

  return (
    <section className="rounded-xl bg-navy-raised p-4 lg:w-72" aria-live="polite">
      <h3 className="text-sm font-bold text-on-navy">Check your setup</h3>
      <dl className="mt-2 flex flex-col">
        {ROWS.map((row) => {
          const result = results?.[row.key];
          return (
            <div key={row.key} className="flex min-h-9 items-center justify-between gap-3 text-[13px]">
              <dt className="text-on-navy-muted">{row.label}</dt>
              <dd className={cn("font-semibold", result ? TONE_CLASS[result.tone] : "text-link-on-navy")}>
                {result ? (
                  result.label
                ) : (
                  <button
                    type="button"
                    onClick={() => void run()}
                    className="min-h-9 underline underline-offset-2"
                    aria-label={`Check ${row.label.toLowerCase()}`}
                  >
                    {checking ? "Checking…" : "Check"}
                  </button>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
