export default function SectionHeading({ kicker, title, subtitle, light = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {kicker && <p className={`section-kicker ${light ? "text-gold-300" : ""}`}>{kicker}</p>}
      <h2 className={`mt-3 font-serif text-3xl leading-tight sm:text-4xl ${light ? "text-ivory" : "text-navy-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? "text-ivory/75" : "text-navy-800/75"}`}>
          {subtitle}
        </p>
      )}
      <div className="gold-rule mx-auto mt-6 w-28" />
    </div>
  );
}
