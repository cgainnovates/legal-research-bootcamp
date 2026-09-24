export default function Logo({ light = false, compact = false }) {
  const word = light ? "text-ivory" : "text-navy-900";
  const sub = light ? "text-gold-300" : "text-gold-600";

  return (
    <a href="/#home" className="flex items-center gap-3" aria-label="Edge Legal Consult home">
      <svg
        viewBox="0 0 56 56"
        className={compact ? "h-9 w-9" : "h-11 w-11"}
        aria-hidden="true"
      >
        <rect width="56" height="56" rx="6" fill={light ? "#122748" : "#0B1C36"} />
        <path
          d="M18 16h20M28 14v6.5M19.5 21.5c0 5 3.8 8.5 8.5 8.5s8.5-3.5 8.5-8.5"
          fill="none"
          stroke="#C9A45B"
          strokeWidth="1.6"
        />
        <text
          x="28"
          y="44"
          textAnchor="middle"
          fill="#C9A45B"
          fontFamily="Georgia, serif"
          fontSize="18"
          fontWeight="700"
        >
          E
        </text>
      </svg>
      <span className="leading-tight">
        <span className={`block font-serif text-lg font-semibold tracking-wide ${word}`}>
          Edge Legal Consult
        </span>
        {!compact && (
          <span className={`block text-[10px] uppercase tracking-[0.22em] ${sub}`}>
            Legal Research Bootcamp
          </span>
        )}
      </span>
    </a>
  );
}
