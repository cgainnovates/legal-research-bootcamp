import { Mail, Phone } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-ivory">
      <div className="gold-rule" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/70">
            Legal Research Bootcamp with David Eyongndi PhD. An intensive academic
            research and publishing programme hosted by Edge Legal Consult.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold-300">Navigate</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/75">
            <li><a className="hover:text-gold-300" href="/#about">About</a></li>
            <li><a className="hover:text-gold-300" href="/#facilitator">Facilitator</a></li>
            <li><a className="hover:text-gold-300" href="/#learn">What You'll Learn</a></li>
            <li><a className="hover:text-gold-300" href="/#pricing">Pricing</a></li>
            <li><a className="hover:text-gold-300" href="/register">Register</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold-300">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-ivory/80">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-gold-400" aria-hidden />
              <a className="hover:text-gold-300" href="mailto:edgelegalconsult@gmail.com">
                edgelegalconsult@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-gold-400" aria-hidden />
              <a className="hover:text-gold-300" href="tel:09064717723">
                09064717723
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-ivory/50">
            Event date, venue and schedule have not been published on this page yet
            and will be confirmed by Edge Legal Consult.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Edge Legal Consult. All rights reserved.
      </div>
    </footer>
  );
}
