import SectionHeading from "../components/SectionHeading";

const stats = [
  { value: "10+", label: "Years of legal research experience" },
  { value: "150+", label: "Peer-reviewed publications" },
  { value: "Scopus", label: "Indexed publications" },
  { value: "Q1", label: "Journal publications" },
];

export default function Facilitator() {
  return (
    <section id="facilitator" className="bg-parchment py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading kicker="Facilitator" title="David Eyongndi PhD" />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute left-4 top-4 h-full w-full border border-gold-500/50" />
            <img
              src="/facilitator.jpg"
              alt="Portrait of David Eyongndi PhD"
              className="relative z-10 w-full object-cover object-top shadow-card"
            />
          </div>
          <div>
            <p className="section-kicker">Associate Professor & Distinguished Legal Researcher</p>
            <p className="mt-5 text-lg leading-relaxed text-navy-800/85">
              Dr David Eyongndi is a published researcher with multiple
              peer-reviewed articles in Scopus indexed journals with over 10 years
              of legal research experience. He is passionate about making academic
              grade research accessible.
            </p>
            <p className="mt-4 leading-relaxed text-navy-800/80">
              His body of work includes over 150 peer-reviewed and published
              articles, including multiple publications in Scopus-indexed, Q1
              journals and other highly rated journals.
            </p>
            <p className="mt-4 text-sm text-navy-800/60">
              Figures above are presented as supplied for this programme page and
              are not independently verified on this website.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border border-navy-900/10 bg-white p-4">
                  <dt className="font-serif text-2xl text-gold-600">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-navy-800/75">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
