import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

const faqs = [
  {
    q: "Who is the bootcamp for?",
    a: "It is intended for postgraduate LLM students, PhD students, law lecturers, legal academics and legal researchers who want to strengthen academic research and journal publication practice.",
  },
  {
    q: "How much does registration cost?",
    a: "Postgraduate LLM/PhD students: ₦40,000 early bird or ₦50,000 late registration. Legal academia: ₦50,000 early bird or ₦70,000 late registration.",
  },
  {
    q: "What is the difference between early-bird and late registration?",
    a: "The fees differ by registration window. The exact opening and closing dates for each window have not been published here yet and will be confirmed by Edge Legal Consult.",
  },
  {
    q: "How do I register?",
    a: "Complete the registration form with your details, select your category and registration type, review the fee, and pay securely with Paystack.",
  },
  {
    q: "What payment method is available?",
    a: "Payment is processed securely through Paystack. Card and other methods enabled on the organiser’s Paystack account may be offered at checkout.",
  },
  {
    q: "Will I receive confirmation after payment?",
    a: "Yes. After Paystack confirms the transaction, this website verifies the payment on the server and displays a confirmation page with your name, category, registration type, amount paid and Paystack reference.",
  },
  {
    q: "When and where will the bootcamp hold?",
    a: "Date, venue, duration and timetable have not been supplied for this page. Please contact edgelegalconsult@gmail.com or 09064717723 for the current schedule.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-ivory py-20 sm:py-24">
      <div className="container-page max-w-3xl">
        <SectionHeading kicker="FAQ" title="Questions before you register" />
        <div className="mt-10 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  <span className="font-medium text-navy-900">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gold-600 transition ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-navy-800/75">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
