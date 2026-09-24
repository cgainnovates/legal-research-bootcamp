import { GraduationCap, BookMarked, Landmark, Library, Search } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

const audiences = [
  {
    title: "LLM Students",
    icon: GraduationCap,
    text: "For postgraduate candidates who need to move from course work to structured, publishable legal research.",
  },
  {
    title: "PhD Students",
    icon: BookMarked,
    text: "For doctoral researchers who want a clearer method for thinking, structuring and placing academic work.",
  },
  {
    title: "Law Lecturers",
    icon: Landmark,
    text: "For lecturers who intend to strengthen their research output for Scopus-indexed and other top-rated journals.",
  },
  {
    title: "Legal Academics",
    icon: Library,
    text: "For scholars in legal academia who want a focused setting in which to refine research and publication practice.",
  },
  {
    title: "Legal Researchers",
    icon: Search,
    text: "For researchers whose work must meet the standards expected by high-quality legal and interdisciplinary journals.",
  },
];

export default function Audience() {
  return (
    <section id="audience" className="bg-navy-900 py-20 text-ivory sm:py-24">
      <div className="container-page">
        <SectionHeading
          light
          kicker="Who should attend"
          title="Designed for postgraduate and academic researchers"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <article key={item.title} className="border border-white/10 bg-white/5 p-6">
              <item.icon className="h-6 w-6 text-gold-400" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/75">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
