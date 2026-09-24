import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="bg-navy-950 py-20 text-center text-ivory">
      <div className="container-page">
        <p className="section-kicker text-gold-300">Limited seats</p>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
          Ready to Strengthen Your Legal Research?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ivory/70">
          Reserve your place on the Legal Research Bootcamp with David Eyongndi PhD.
        </p>
        <Link to="/register" className="btn-gold mt-8">
          Reserve Your Seat
        </Link>
      </div>
    </section>
  );
}
