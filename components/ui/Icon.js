const P = {
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  practice: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z",
  progress: "M5 20V10M12 20V4M19 20v-7",
  library: "M5 4v16M10 4v16M15 5l4 15",
  chat: "M4 5h16v11H9l-5 4z",
  mic: "M12 3a3 3 0 013 3v5a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-3 11c.6.6 1 1.3 1 2h4c0-.7.4-1.4 1-2a6 6 0 00-3-11z",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  briefcase: "M4 8h16v11H4zM9 8V5h6v3",
  help: "M12 3a9 9 0 100 18 9 9 0 000-18zM9.5 9.5a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 3.5M12 17h.01",
  bell: "M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 20a2 2 0 004 0",
  arrow: "M5 12h14M13 6l6 6-6 6",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  check: "M5 12l5 5L20 7",
  alert: "M12 4l9 16H3zM12 10v4M12 17h.01",
  pulse: "M3 12h4l2-6 4 12 2-6h6",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
};

export default function Icon({ name, size = 18, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={P[name] || P.pulse} />
    </svg>
  );
}
