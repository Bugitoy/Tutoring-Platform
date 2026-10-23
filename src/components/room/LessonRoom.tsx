"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudyHelper } from "@/components/library/StudyHelper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { leaveLessonRoom, readLessonChat, saveRoomQuality } from "@/lib/actions/room";
import { connectionQuality, elapsedMs, formatElapsed, unreadCount, type ConnectionQuality, type RoomRole } from "@/lib/room";
import type { LessonChatMessage, VideoQuality, WhiteboardPage } from "@/lib/types";
import { CallControls } from "./CallControls";
import { LessonChat } from "./LessonChat";
import { LessonTools, type ToolsTab } from "./LessonTools";
import { RoomHeader } from "./RoomHeader";
import { VideoStage } from "./VideoStage";
import { Whiteboard } from "./Whiteboard";

type Person = { name: string; shortName: string; initials: string };

export type LessonRoomProps = {
  lessonId: string;
  role: RoomRole;
  viewerId: string;
  start: string;
  now: string;
  title: string;
  subline: string;
  phoneTitle: string;
  phoneSubline: string;
  remote: Person;
  self: Person & { label: string };
  names: Record<string, string>;
  chat: LessonChatMessage[];
  initialQuality: VideoQuality;
  board?: WhiteboardPage;
  goal?: string;
  /** "Rejoin until 18:00" for students; tutors end the lesson when they leave. */
  leaveDescription: string;
  /** The study helper is a student tool (section 7.6). */
  helper?: { workingOn: string; tutorName: string };
};

type Permission = PermissionState | "unsupported";

async function permission(name: "camera" | "microphone"): Promise<Permission> {
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state;
  } catch {
    return "unsupported";
  }
}

const CAMERA_BLOCKED = "Camera blocked — enable in browser settings";

export function LessonRoom(props: LessonRoomProps) {
  const { lessonId, role, viewerId, start, now, remote, self, helper } = props;
  const router = useRouter();
  const [quality, setQuality] = useState<VideoQuality>(props.initialQuality);
  const [voiceOnly, setVoiceOnly] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [connection, setConnection] = useState<ConnectionQuality>("good");
  const [tab, setTab] = useState<ToolsTab>("whiteboard");
  const [messages, setMessages] = useState(props.chat);
  const [unread, setUnread] = useState(() => unreadCount(props.chat, viewerId));
  const [helperOpen, setHelperOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, startLeaving] = useTransition();
  const [sinceJoin, setSinceJoin] = useState(0);

  useEffect(() => {
    const joined = Date.now();
    const timer = window.setInterval(() => setSinceJoin(Date.now() - joined), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const [camera, microphone] = await Promise.all([permission("camera"), permission("microphone")]);
      if (cancelled) return;
      const network = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      setConnection(connectionQuality(network?.effectiveType));
      if (camera === "denied") {
        setCameraBlocked(true);
        setCameraOff(true);
        setVoiceOnly(true);
      }
      if (microphone === "denied") setMicBlocked(true);
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const nowMs = new Date(now).getTime();
  const elapsed = formatElapsed(elapsedMs(start, nowMs + sinceJoin, nowMs));

  function changeQuality(next: VideoQuality) {
    setQuality(next);
    setVoiceOnly(false);
    void saveRoomQuality(role, next).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  function toggleCamera() {
    if (cameraBlocked) {
      toast.error(CAMERA_BLOCKED);
      return;
    }
    setCameraOff((current) => !current);
  }

  function changeTab(next: ToolsTab) {
    setTab(next);
    if (next === "chat" && unread > 0) {
      setUnread(0);
      void readLessonChat(lessonId, role);
    }
  }

  // TODO(spec): screen sharing goes through Stream; v1 only shows that you're sharing.
  function toggleShare() {
    setSharing((current) => !current);
  }

  async function retryMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicBlocked(false);
    } catch {
      toast.error("The microphone is still blocked. Allow it in your browser settings, then try again.");
    }
  }

  function leave() {
    startLeaving(async () => {
      const result = await leaveLessonRoom(lessonId, role);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(result.href);
    });
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-room-bg text-room-text sm:h-auto sm:min-h-dvh sm:overflow-visible">
      <RoomHeader
        title={props.title}
        subline={props.subline}
        phoneTitle={props.phoneTitle}
        phoneSubline={props.phoneSubline}
        elapsed={elapsed}
        quality={quality}
        voiceOnly={voiceOnly}
        onQualityChange={changeQuality}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 pt-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-4">
        <div className="flex shrink-0 flex-col gap-3 sm:flex-[999_1_560px]">
          {cameraBlocked || micBlocked ? (
            <div role="status" className="flex flex-col gap-2">
              {cameraBlocked ? (
                <p className="rounded-xl bg-room-panel px-4 py-2.5 text-sm text-room-text">{CAMERA_BLOCKED}</p>
              ) : null}
              {micBlocked ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-room-panel px-4 py-2 text-sm">
                  <span>Microphone needed to talk</span>
                  <Button variant="outline-navy" size="sm" onClick={() => void retryMicrophone()}>
                    Retry
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
          <VideoStage
            className="sm:flex-1"
            remote={remote}
            self={self}
            voiceOnly={voiceOnly}
            muted={muted}
            cameraOff={cameraOff}
            sharing={sharing}
            connection={connection}
            quality={quality}
            onQualityChange={changeQuality}
          />
        </div>

        <LessonTools
          tab={tab}
          onTabChange={changeTab}
          unread={unread}
          goal={props.goal}
          whiteboard={<Whiteboard board={props.board} partnerLabel={remote.shortName} />}
          chat={
            <LessonChat
              lessonId={lessonId}
              role={role}
              viewerId={viewerId}
              messages={messages}
              names={props.names}
              onSent={(message) => setMessages((current) => [...current, message])}
            />
          }
        />
      </main>

      <CallControls
        muted={muted}
        voiceOnly={voiceOnly}
        cameraOff={cameraOff}
        sharing={sharing}
        showHelper={Boolean(helper)}
        onToggleMute={() => setMuted((current) => !current)}
        onToggleVoiceOnly={() => setVoiceOnly((current) => !current)}
        onToggleCamera={toggleCamera}
        onToggleShare={toggleShare}
        onOpenHelper={() => setHelperOpen(true)}
        onOpenChat={() => changeTab("chat")}
        onLeave={() => setLeaveOpen(true)}
      />

      {helper ? (
        <Sheet open={helperOpen} onOpenChange={setHelperOpen}>
          <SheetContent side="right" className="w-full overflow-y-auto p-4 pt-12 sm:max-w-md">
            <SheetTitle className="sr-only">Ask AI helper</SheetTitle>
            <StudyHelper workingOn={helper.workingOn} tutorName={helper.tutorName} />
          </SheetContent>
        </Sheet>
      ) : null}

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave the lesson?</DialogTitle>
            <DialogDescription>{props.leaveDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Stay in lesson</DialogClose>
            <Button variant="destructive" disabled={leaving} onClick={leave}>
              {leaving ? "Leaving…" : "Leave lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
