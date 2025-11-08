import { useEffect, useMemo, useState } from "react";

const QUEST_START = new Date("2025-11-16T12:30:00Z");
const QUEST_END = new Date("2025-11-16T14:30:00Z");

const clampRemaining = (milliseconds) => (milliseconds > 0 ? milliseconds : 0);

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const getStatus = (now) => {
  if (now < QUEST_START) {
    return {
      label: "Quest begins in",
      remaining: clampRemaining(QUEST_START.getTime() - now.getTime()),
      phase: "pre",
    };
  }

  if (now <= QUEST_END) {
    return {
      label: "Quest ends in",
      remaining: clampRemaining(QUEST_END.getTime() - now.getTime()),
      phase: "active",
    };
  }

  return {
    label: "Quest concluded",
    remaining: 0,
    phase: "post",
  };
};

export default function QuestCountdown({ variant = "card" }) {
  const [status, setStatus] = useState(() => getStatus(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStatus(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = useMemo(
    () => formatDuration(status.remaining),
    [status.remaining]
  );

  const countdownInline = useMemo(() => {
    if (status.phase === "post") return null;
    const { days, hours, minutes, seconds } = formatted;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  }, [formatted, status.phase]);

  if (variant === "footer") {
    return (
      <div className="flex flex-col items-center gap-2 text-center text-[0.65rem] uppercase tracking-[0.35em] text-brand-highlight/70">
        <span className="font-pixel text-[0.7rem] text-brand-accent">
          {status.phase === "post" ? "Quest concluded" : status.label}
        </span>
        {status.phase === "post" ? (
          <span className="text-[0.6rem] tracking-[0.25em] text-brand-highlight/50">
            Thanks for playing! See you soon.
          </span>
        ) : (
          <span className="font-mono text-sm tracking-[0.2em] text-brand-highlight">
            {countdownInline}
          </span>
        )}
        <span className="text-[0.55rem] tracking-[0.3em] text-brand-highlight/40">
          Kickoff 16 Nov 2025 · 6:00 PM IST · Closing 8:00 PM IST
        </span>
      </div>
    );
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-3xl rounded-3xl border-2 border-brand-accent/40 bg-brand-secondary/20 px-6 py-4 text-center shadow-pixel">
      <p className="font-pixel text-xs uppercase tracking-[0.3em] text-brand-accent">
        {status.label}
      </p>
      {status.phase === "post" ? (
        <p className="mt-3 text-sm text-brand-highlight/70">
          Thanks for playing! See you at the next LITSOC challenge.
        </p>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-4 text-sm text-brand-highlight">
          <TimeBlock label="Days" value={formatted.days} />
          <TimeBlock label="Hours" value={formatted.hours} />
          <TimeBlock label="Minutes" value={formatted.minutes} />
          <TimeBlock label="Seconds" value={formatted.seconds} />
        </div>
      )}
      <p className="mt-3 text-xs text-brand-highlight/60">
        Kickoff 16 Nov 2025 · 6:00 PM IST · Closing 8:00 PM IST
      </p>
    </section>
  );
}

function TimeBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-brand-highlight/30 bg-brand-base/80 px-3 py-2 shadow-sm">
      <span className="font-pixel text-lg tracking-[0.2em] text-brand-mellow">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-brand-highlight/70">
        {label}
      </span>
    </div>
  );
}
