"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type DownloadStatementButtonProps = {
  fileName: string;
  /** First row is the header. */
  rows: string[][];
};

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function DownloadStatementButton({ fileName, rows }: DownloadStatementButtonProps) {
  function download() {
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={download}>
      <Download aria-hidden="true" />
      Download statement
    </Button>
  );
}
