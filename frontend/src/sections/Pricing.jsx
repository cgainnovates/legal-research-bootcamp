import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { CATEGORIES, formatNaira } from "../lib/pricing";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-parchment py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          kicker="Registration fees"
          title="Choose the category that matches your role"
          subtitle="The amount charged at checkout is confirmed by the server from this pricing schedule. Early-bird and late windows will be announced by Edge Legal Consult."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {CATEGORIES.map((category) => (
            <article
              key={category.id}
              className="border border-navy-900/10 bg-white p-8 shadow-card"
            >
              <p className="section-kicker">Category</p>
              <h3 className="mt-2 font-serif text-3xl text-navy-900">{category.shortLabel}</h3>
              <ul className="mt-8 space-y-5">
                {category.types.map((type) => (
                  <li
                    key={type.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-900/10 pt-5"
                  >
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-navy-800/60">
                        {type.label}
                      </p>
                      <p className="font-serif text-3xl text-navy-900">
                        {formatNaira(type.amountNaira)}
                      </p>
                    </div>
                    <Link
                      to={`/register?category=${category.id}&type=${type.id}`}
                      className="btn-navy"
                    >
                      Register
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
