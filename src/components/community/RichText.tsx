import { answerBlocks, workingParts } from "@/lib/community";

/** Answer text: paragraphs, with indented blocks shown as a maths box. */
export function AnswerBody({ body }: { body: string }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-text-secondary">
      {answerBlocks(body).map((block, index) =>
        block.kind === "math" ? (
          <div key={index} className="rounded-lg bg-surface-subtle px-4 py-3 font-medium text-foreground">
            {block.lines.map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        ) : (
          <p key={index} className="whitespace-pre-line">
            {block.lines.join("\n")}
          </p>
        ),
      )}
    </div>
  );
}

/** The student's written working, with crossed-out steps. */
export function WorkingBox({ lines }: { lines: string[] }) {
  return (
    <figure className="max-w-md rounded-xl border border-paper-border bg-paper px-4 py-3">
      <figcaption className="sr-only">The student’s working</figcaption>
      {lines.map((line, index) => (
        <p key={index} className="text-lg leading-loose text-foreground">
          {workingParts(line).map((part, partIndex) =>
            part.struck ? (
              <s key={partIndex} className="decoration-strike decoration-2">
                <span className="sr-only">crossed out: </span>
                {part.text}
              </s>
            ) : (
              <span key={partIndex}>{part.text}</span>
            ),
          )}
        </p>
      ))}
    </figure>
  );
}
