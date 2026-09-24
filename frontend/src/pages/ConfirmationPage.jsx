import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { verifyPayment } from "../lib/api";
import { formatNaira } from "../lib/pricing";

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const [state, setState] = useState({ status: "loading", message: "", data: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!reference) {
        setState({
          status: "error",
          message: "No payment reference was supplied. If you completed payment, check your email or contact Edge Legal Consult with your Paystack receipt.",
          data: null,
        });
        return;
      }
      try {
        const result = await verifyPayment(reference);
        if (cancelled) return;
        setState({
          status: result.data?.verified ? "success" : "pending",
          message: result.message,
          data: result.data,
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: error.status === 402 ? "pending" : "error",
          message: error.message,
          data: error.payload?.data || null,
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <main className="bg-ivory px-5 pb-20 pt-28">
      <div className="mx-auto max-w-2xl border border-navy-900/10 bg-white p-8 shadow-card">
        {state.status === "loading" && (
          <div className="flex flex-col items-center py-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-gold-600" />
            <p className="mt-4 text-navy-800/80">Verifying your payment with Paystack…</p>
          </div>
        )}

        {state.status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-700" aria-hidden />
            <h1 className="mt-4 font-serif text-3xl text-navy-900">Registration Successful</h1>
            <p className="mt-3 text-navy-800/80">
              The registration and payment have been successfully verified.
            </p>
            <dl className="mt-8 divide-y divide-navy-900/10 border border-navy-900/10">
              <Item label="Name" value={state.data?.fullName} />
              <Item label="Registration category" value={state.data?.categoryLabel} />
              <Item label="Registration type" value={state.data?.typeLabel} />
              <Item
                label="Amount paid"
                value={state.data?.amountNaira ? formatNaira(state.data.amountNaira) : "—"}
              />
              <Item label="Paystack reference" value={state.data?.reference || reference} />
            </dl>
            <p className="mt-6 text-sm text-navy-800/65">
              Please keep this reference for your records. For programme details, write to
              edgelegalconsult@gmail.com or call 09064717723.
            </p>
          </>
        )}

        {state.status !== "loading" && state.status !== "success" && (
          <>
            <CircleAlert className="h-12 w-12 text-gold-600" aria-hidden />
            <h1 className="mt-4 font-serif text-3xl text-navy-900">
              {state.status === "pending" ? "Payment not yet confirmed" : "We could not confirm this payment"}
            </h1>
            <p className="mt-3 text-navy-800/80">{state.message}</p>
            {reference && (
              <p className="mt-4 text-sm text-navy-800/70">
                Reference: <span className="font-medium">{reference}</span>
              </p>
            )}
            <Link to="/register" className="btn-navy mt-8 inline-flex">
              Return to registration
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function Item({ label, value }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-3 text-sm">
      <dt className="text-navy-800/60">{label}</dt>
      <dd className="text-right text-navy-900">{value || "—"}</dd>
    </div>
  );
}
