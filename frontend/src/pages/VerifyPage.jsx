import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, CircleAlert, Loader2 } from "lucide-react";
import { lookupRegistration } from "../lib/api";

export default function VerifyPage() {
  const { registrationId = "" } = useParams();
  const [state, setState] = useState({ status: "loading", message: "", data: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!registrationId) {
        setState({ status: "error", message: "No registration ID was supplied.", data: null });
        return;
      }
      try {
        const result = await lookupRegistration(registrationId);
        if (cancelled) return;
        setState({ status: "success", message: result.message, data: result.data });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: "error",
          message: error.message || "This registration could not be verified.",
          data: null,
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [registrationId]);

  return (
    <main className="bg-ivory px-5 pb-20 pt-28">
      <div className="mx-auto max-w-lg border border-navy-900/10 bg-white p-8 shadow-card">
        {state.status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-gold-600" />
            <p className="mt-3 text-navy-800/75">Checking registration…</p>
          </div>
        )}

        {state.status === "success" && (
          <>
            <BadgeCheck className="h-12 w-12 text-emerald-700" />
            <h1 className="mt-4 font-serif text-3xl text-navy-900">Registration Verified</h1>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Name" value={state.data?.fullName} />
              <Row label="Category" value={state.data?.categoryLabel} />
              <Row label="Registration type" value={state.data?.typeLabel} />
              <Row label="Registration ID" value={state.data?.registrationId} />
              <Row label="Payment status" value={state.data?.paymentStatus} />
              <Row label="Status" value={state.data?.status} />
            </dl>
          </>
        )}

        {state.status === "error" && (
          <>
            <CircleAlert className="h-12 w-12 text-gold-600" />
            <h1 className="mt-4 font-serif text-3xl text-navy-900">Not verified</h1>
            <p className="mt-3 text-navy-800/75">{state.message}</p>
          </>
        )}

        <Link to="/" className="mt-8 inline-block text-sm text-gold-700 hover:underline">
          Back to the bootcamp page
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy-900/10 py-2">
      <dt className="text-navy-800/60">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value || "—"}</dd>
    </div>
  );
}
