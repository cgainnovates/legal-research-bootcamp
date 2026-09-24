import SectionHeading from "../components/SectionHeading";

export default function About() {
  return (
    <section id="about" className="bg-ivory py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          kicker="About the Bootcamp"
          title="Built for legal scholars who need to publish well"
          subtitle="A focused, intensive training taught by a researcher who already publishes in the journals this programme prepares you to approach."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="border border-navy-900/10 bg-white p-7 shadow-card sm:p-9">
            <h3 className="font-serif text-2xl text-navy-900">The purpose</h3>
            <p className="mt-4 text-navy-800/80 leading-relaxed">
              If you are in legal academia and you are not publishing in Scopus
              indexed journals, this Bootcamp is built for you.
            </p>
            <p className="mt-4 text-navy-800/80 leading-relaxed">
              It is a focused, intensive training for law lecturers, postgraduate
              law students and legal researchers who need to produce work that
              meets the rigorous standards of Scopus-indexed and other top-rated
              journals, taught by someone who already does.
            </p>
          </article>
          <article className="border border-navy-900/10 bg-navy-900 p-7 text-ivory shadow-card sm:p-9">
            <h3 className="font-serif text-2xl text-gold-300">How researchers work</h3>
            <p className="mt-4 leading-relaxed text-ivory/80">
              As a postgraduate LLM/PhD student, this Bootcamp does not just tell
              you what to research. It teaches you how researchers think,
              structure and publish.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/80">
              {[
                "Academic research and legal research methodology",
                "Journal publication strategy",
                "Standards of Scopus-indexed journals",
                "Research thinking, structure and publishing practice",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
