import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#facilitator", label: "Facilitator" },
  { href: "/#learn", label: "What You'll Learn" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const solid = !onHome || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition ${
        solid ? "bg-navy-950/95 shadow-lg shadow-black/20 backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-[72px] items-center justify-between" aria-label="Primary">
        <Logo light compact={false} />
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ivory/85 transition hover:text-gold-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <Link to="/register" className="btn-gold">
            Register Now
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-ivory lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-navy-950 lg:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-sm px-2 py-3 text-ivory/90 hover:bg-white/5 hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/register" className="btn-gold w-full">
                Register Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
