"use client";

import { useState } from "react";
import { useSaruSession } from "./SaruSessionManager";
import SaruAvatar from "./SaruAvatar";
import SaruChatWindow from "./SaruChatWindow";

/**
 * SaruWidget — floating "Ask Saru" launcher, fixed bottom-right on every page
 * (mounted in the root layout). Opens the chat window; state persists.
 */
export default function SaruWidget() {
  const session = useSaruSession();
  const [open, setOpen] = useState(false);
  const unseen = session.state ? !session.state.seen : false;

  const toggle = () => {
    setOpen((o) => !o);
    session.markSeen();
  };

  return (
    <>
      {session.state && <SaruChatWindow open={open} onMinimize={() => setOpen(false)} onClose={() => setOpen(false)} session={session} />}
      <div className="saru-launcher fixed z-[91] flex items-center gap-2.5">
        {!open && (
          <button
            type="button"
            onClick={toggle}
            className="saru-label glass-strong hidden rounded-full px-3.5 py-2 text-[13px] font-medium text-ink shadow-lg sm:block"
            tabIndex={-1}
            aria-hidden
          >
            Ask Saru
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="saru-window"
          aria-label={open ? "Close Saru Assistant" : "Open Saru Assistant chat"}
          className="saru-fab relative grid h-[60px] w-[60px] place-items-center rounded-full"
        >
          {!open && <span className="saru-fab-pulse absolute inset-0 rounded-full" aria-hidden />}
          <SaruAvatar size={44} state={open ? "listening" : "idle"} />
          {unseen && !open && (
            <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg bg-cyan" aria-label="New" />
          )}
        </button>
      </div>
    </>
  );
}
