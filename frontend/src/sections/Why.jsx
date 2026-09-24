import SectionHeading from "../components/SectionHeading";

const points = [
  "Identify research problems with academic discipline",
  "Think critically about sources, doctrine and method",
  "Structure academic work for scholarly readers",
  "Develop research that can be prepared for publication",
  "Approach high-quality journals with a clearer strategy",
];

export default function Why() {
  return (
    <section id="why" className="bg-ivory py-20 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            kicker="Why this bootcamp"
            title="Knowing what to research is not the same as knowing how researchers work"
          />
        </div>
        <ol className="space-y-4">
          {points.map((point, index) => (
            <li
              key={point}
              className="flex gap-4 border border-navy-900/10 bg-white p-4 shadow-sm"
            >
              <span className="font-serif text-xl text-gold-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="pt-1 text-navy-800/85">{point}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
