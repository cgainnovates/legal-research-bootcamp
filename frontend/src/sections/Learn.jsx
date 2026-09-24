import { BookOpen, Brain, Compass, Users, Rocket } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

const items = [
  {
    title: "Mastering Publication",
    text: "Publication in Scopus-indexed and other top-rated journals.",
    icon: BookOpen,
  },
  {
    title: "Critical Analysis & Legal Reasoning",
    text: "Sharpen the analytical habits that underwrite credible legal scholarship.",
    icon: Brain,
  },
  {
    title: "Strategic Research Methods",
    text: "Approach research design with method rather than guesswork.",
    icon: Compass,
  },
  {
    title: "Exclusive Peer Mentoring",
    text: "Guided feedback within a focused academic setting.",
    icon: Users,
  },
  {
    title: "Academic Career Advancement",
    text: "Accelerate the research and publishing practice that supports an academic career.",
    icon: Rocket,
  },
];

export default function Learn() {
  return (
    <section id="learn" className="bg-ivory py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          kicker="What you'll learn"
          title="Core training benefits"
          subtitle="The programme concentrates on the research and publishing skills listed here. A fuller timetable will be issued by the organisers."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="group border border-navy-900/10 bg-white p-6 transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-gold"
            >
              <item.icon className="h-7 w-7 text-gold-600" aria-hidden />
              <h3 className="mt-4 font-serif text-xl text-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-800/75">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
