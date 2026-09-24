import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-navy-950 pt-28 text-ivory sm:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-sheen" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="container-page relative grid items-center gap-12 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-0">
        <div className="reveal">
          <p className="section-kicker text-gold-300">Edge Legal Consult</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            Legal Research
            <span className="block text-gold-300">Bootcamp</span>
          </h1>
          <p className="mt-4 font-serif text-xl italic text-ivory/85 sm:text-2xl">
            With David Eyongndi PhD
          </p>
          <p className="mt-5 max-w-xl text-sm uppercase tracking-[0.16em] text-gold-200/80">
            Associate Professor · Distinguished Legal Researcher
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">
            An intensive academic research and publishing programme for law
            lecturers, postgraduate students and legal researchers who need work
            that meets the standards of Scopus-indexed and other top-rated journals.
          </p>
          <dl className="mt-8 grid max-w-lg grid-cols-2 gap-4 text-sm">
            <div className="border border-white/10 bg-white/5 p-4">
              <dt className="text-gold-300">Scopus-indexed</dt>
              <dd className="mt-1 text-ivory/80">Publication experience</dd>
            </div>
            <div className="border border-white/10 bg-white/5 p-4">
              <dt className="text-gold-300">10+ years</dt>
              <dd className="mt-1 text-ivory/80">Legal research practice</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-gold">
              Reserve Your Seat <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#about" className="btn-outline">
              Explore the Bootcamp
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-3 rounded-sm border border-gold-500/30" />
          <img
            src="/facilitator.jpg"
            alt="David Eyongndi PhD, Associate Professor and Distinguished Legal Researcher"
            className="relative z-10 h-full w-full object-cover object-top shadow-card"
          />
          <p className="relative z-10 border border-t-0 border-gold-500/20 bg-navy-900 px-4 py-3 text-center text-xs uppercase tracking-[0.2em] text-gold-300">
            Hosted by Edge Legal Consult
          </p>
        </div>
      </div>
      <div className="gold-rule mt-10" />
    </section>
  );
}
