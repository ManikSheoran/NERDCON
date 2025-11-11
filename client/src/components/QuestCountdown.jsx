import { useEffect, useMemo, useState } from "react";

const QUEST_START = new Date("2025-11-15T11:30:00Z");
const QUEST_END = new Date("2025-11-15T14:30:00Z");

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
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-block">
          <span className="font-pixel text-[0.75rem] text-brand-gray-50 uppercase tracking-[0.3em]">
            {status.phase === "post" ? "Quest concluded" : status.label}
          </span>
          <div className="mt-2 h-0.5 w-full bg-brand-accent"></div>
        </div>
        {status.phase === "post" ? (
          <span className="text-[0.65rem] tracking-[0.25em] text-nerd-dark/70">
            Thanks for playing! See you at NERDCON 4.
          </span>
        ) : (
          <span className="font-pixel text-base tracking-[0.2em] text-brand-primary font-bold">
            {countdownInline}
          </span>
        )}
        <span className="text-[0.6rem] tracking-[0.3em] text-nerd-dark/60 uppercase">
          Kickoff 15 Nov 2025 · 5:00 PM IST · Closing 8:00 PM IST
        </span>
      </div>
    );
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-3xl rounded-3xl border-4 border-brand-accent bg-white px-8 py-6 text-center shadow-pixel">
      <p className="font-pixel text-sm uppercase tracking-[0.35em] text-brand-gray-50">
        {status.label}
      </p>
      {status.phase === "post" ? (
        <p className="mt-4 text-sm text-nerd-dark">
          Thanks for playing! See you at NERDCON 4.
        </p>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <TimeBlock label="Days" value={formatted.days} />
          <TimeBlock label="Hours" value={formatted.hours} />
          <TimeBlock label="Minutes" value={formatted.minutes} />
          <TimeBlock label="Seconds" value={formatted.seconds} />
        </div>
      )}
      <p className="mt-6 text-xs text-nerd-dark/60 tracking-wider">
        Kickoff 16 Nov 2025 · 6:00 PM IST · Closing 8:00 PM IST
      </p>
    </section>
  );
}

function TimeBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-brand-primary bg-brand-secondary px-5 py-4 shadow-pixel transition-transform hover:scale-105">
      <span className="font-pixel text-2xl tracking-[0.2em] text-brand-gray-50">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[0.65rem] uppercase tracking-[0.35em] text-brand-primary">
        {label}
      </span>
    </div>
  );
}
