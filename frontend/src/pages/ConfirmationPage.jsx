import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2, Printer } from "lucide-react";
import { verifyPayment } from "../lib/api";
import { formatNaira } from "../lib/pricing";

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const [state, setState] = useState({ status: "loading", message: "", data: null });
  const receiptRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!reference) {
        setState({
          status: "error",
          message: "No payment reference was supplied. If you completed payment, contact Edge Legal Consult with your Paystack receipt.",
          data: null,
        });
        return;
      }
      try {
        const result = await verifyPayment(reference);
        if (cancelled) return;
        const data = result?.data || null;
        setState({
          status: data?.verified ? "success" : "pending",
          message: result?.message || (data ? "Payment is still pending." : "No payment data was returned."),
          data,
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

            <div ref={receiptRef} className="mt-8 border border-navy-900/10 p-6">
              <p className="section-kicker">Edge Legal Consult</p>
              <h2 className="mt-2 font-serif text-2xl text-navy-900">Registration Receipt</h2>
              <p className="text-sm text-navy-800/70">Legal Research Bootcamp with David Eyongndi PhD</p>
              <dl className="mt-6 divide-y divide-navy-900/10 border border-navy-900/10">
                <Item label="Name" value={state.data?.fullName} />
                <Item label="Email" value={state.data?.email} />
                <Item label="Phone" value={state.data?.phone} />
                <Item label="Category" value={state.data?.categoryLabel} />
                <Item label="Registration type" value={state.data?.typeLabel} />
                <Item label="Amount paid" value={state.data?.amountNaira ? formatNaira(state.data.amountNaira) : "—"} />
                <Item label="Payment status" value="Paid / Verified" />
                <Item label="Paystack reference" value={state.data?.reference || reference} />
                <Item label="Registration ID" value={state.data?.registrationId} />
                <Item
                  label="Registration date"
                  value={
                    state.data?.paidAt || state.data?.createdAt
                      ? new Date(state.data.paidAt || state.data.createdAt).toLocaleString("en-NG")
                      : "—"
                  }
                />
              </dl>
              {state.data?.qrImageUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <img
                    src={state.data.qrImageUrl}
                    alt={`QR code for ${state.data.registrationId}`}
                    className="h-40 w-40 border border-navy-900/10 bg-white p-2"
                  />
                  <p className="mt-2 text-xs text-navy-800/60">Scan to verify this registration</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn-navy" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print / save receipt
              </button>
              {state.data?.registrationId && (
                <Link
                  to={`/verify/${encodeURIComponent(state.data.registrationId)}?ref=${encodeURIComponent(state.data.reference || reference)}`}
                  className="btn-gold"
                >
                  Open verification page
                </Link>
              )}
            </div>
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
