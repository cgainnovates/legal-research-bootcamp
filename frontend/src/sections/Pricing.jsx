import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { fetchPricing } from "../lib/api";
import { CATEGORIES, formatNaira } from "../lib/pricing";
import { formatDeadline, getRegistrationWindow } from "../lib/deadline";

export default function Pricing() {
  const [windowInfo, setWindowInfo] = useState(() => getRegistrationWindow());

  useEffect(() => {
    let cancelled = false;
    fetchPricing()
      .then((result) => {
        if (cancelled || !result.window) return;
        setWindowInfo(result.window);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="pricing" className="bg-parchment py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          kicker="Registration fees"
          title="Choose the category that matches your role"
          subtitle={
            windowInfo.earlyBirdOpen
              ? `Early Bird is open until ${formatDeadline(windowInfo.deadline)}. Late Registration becomes available after that time.`
              : `Early Bird has closed. Late Registration is now open.`
          }
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
                {category.types.map((type) => {
                  const available =
                    type.id === "early" ? windowInfo.earlyBirdOpen : windowInfo.lateOpen;
                  return (
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
                        {!available && (
                          <p className="mt-1 text-xs text-navy-800/55">
                            {type.id === "early" ? "Closed" : "Opens after Early Bird ends"}
                          </p>
                        )}
                      </div>
                      {available ? (
                        <Link
                          to={`/register?category=${category.id}&type=${type.id}`}
                          className="btn-navy"
                        >
                          Register
                        </Link>
                      ) : (
                        <span className="inline-flex items-center rounded-sm border border-navy-900/20 px-6 py-3 text-sm text-navy-800/45">
                          Unavailable
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
