"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { unlockAudio } from "@/lib/saru/recorder";
import { useSaruSession } from "./SaruSessionManager";
import SaruAvatar from "./SaruAvatar";
import SaruChatWindow from "./SaruChatWindow";

/**
 * SaruWidget — fixed bottom-right on every page (mounted in the root layout):
 *  • "Call Saru" — one tap opens a voice call and starts listening immediately
 *  • the round avatar button opens text chat
 */
export default function SaruWidget() {
  const session = useSaruSession();
  const [open, setOpen] = useState(false);
  const [voiceRequest, setVoiceRequest] = useState(0);
  const unseen = session.state ? !session.state.seen : false;

  const toggle = () => {
    setOpen((o) => !o);
    session.markSeen();
  };

  const call = () => {
    unlockAudio(); // must run inside the tap so phones allow Saru's voice
    session.markSeen();
    setOpen(true);
    setVoiceRequest((n) => n + 1);
  };

  return (
    <>
      {session.state && (
        <SaruChatWindow
          open={open}
          onMinimize={() => setOpen(false)}
          onClose={() => setOpen(false)}
          session={session}
          voiceRequest={voiceRequest}
        />
      )}
      <div className="saru-launcher fixed z-[91] flex flex-col items-center gap-2 sm:flex-row sm:gap-2.5">
        {!open && (
          <button
            type="button"
            onClick={call}
            className="saru-call group flex h-12 w-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white sm:w-auto sm:justify-start sm:pl-1.5 sm:pr-4"
            aria-label="Call Saru: start a voice conversation"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
              <Phone size={17} aria-hidden className="transition-transform group-hover:rotate-12" />
            </span>
            <span className="hidden sm:block">
              Call Saru
              <span className="block text-[10.5px] font-medium leading-none text-white/75">EN · اردو · سنڌي</span>
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="saru-window"
          aria-label={open ? "Close Saru Assistant" : "Open Saru Assistant chat"}
          className="saru-fab relative grid h-[52px] w-[52px] place-items-center rounded-full sm:h-[60px] sm:w-[60px]"
        >
          {!open && <span className="saru-fab-pulse absolute inset-0 rounded-full" aria-hidden />}
          <SaruAvatar size={38} state={open ? "listening" : "idle"} />
          {unseen && !open && (
            <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg bg-cyan" aria-label="New" />
          )}
        </button>
      </div>
    </>
  );
}
