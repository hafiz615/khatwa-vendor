import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  fetchDesignerPayouts,
  fetchDesignerPayoutTransactions,
} from "../services/payouts.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

function VendorPayoutsPage() {
  const token = useSelector((s) => s.auth.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [txRows, setTxRows] = useState([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [res, txRes] = await Promise.all([
          fetchDesignerPayouts(),
          fetchDesignerPayoutTransactions(),
        ]);
        if (cancelled) return;
        if (res?.success && Array.isArray(res.payouts)) {
          setRows(res.payouts);
        } else {
          setError(res?.message || "Could not load payouts.");
        }
        if (txRes?.success && Array.isArray(txRes.transactions)) {
          setTxRows(txRes.transactions);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Could not load payouts.");
          console.error(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const copyTx = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(
      () => toast.success("Copied"),
      () => toast.error("Copy failed")
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6">
      <h2 className="text-2xl font-semibold mb-2">Payouts</h2>
      <p className="text-gray-600 mb-6">
        Settlement batches from boutique orders and consultations. Bank reference
        appears after the transfer is completed.
      </p>

      {error && <FormErrorAlert message={error} />}

      {rows.length === 0 ? (
        <p className="text-gray-500 mt-4">No payouts yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Generated</th>
                <th className="px-4 py-3 font-medium">Transactions</th>
                <th className="px-4 py-3 font-medium">Opening</th>
                <th className="px-4 py-3 font-medium">Credit</th>
                <th className="px-4 py-3 font-medium">Debit</th>
                <th className="px-4 py-3 font-medium">Amount (KD)</th>
                <th className="px-4 py-3 font-medium">Closing</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bank reference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {p.generatedAt
                      ? new Date(p.generatedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{p.transactionCount ?? "—"}</td>
                  <td className="px-4 py-3">
                    {typeof p.openingBalance === "number"
                      ? p.openingBalance.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof p.periodCredit === "number"
                      ? p.periodCredit.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof p.periodDebit === "number"
                      ? p.periodDebit.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {typeof p.amount === "number" ? p.amount.toFixed(3) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof p.closingBalance === "number"
                      ? p.closingBalance.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{p.status || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {p.status === "paid" && p.bankTransactionId ? (
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => copyTx(p.bankTransactionId)}
                      >
                        {p.bankTransactionId}
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-8 mb-3">Transactions (CR/DR)</h3>
      {txRows.length === 0 ? (
        <p className="text-gray-500 mt-2">No transaction entries yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Gateway</th>
                <th className="px-4 py-3 font-medium">Net impact</th>
                <th className="px-4 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {txRows.map((t) => (
                <tr key={t._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {t.occurredAt ? new Date(t.occurredAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(t.sourceType || "—").toUpperCase()} #{String(t.sourceId || "").slice(-6)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        t.type === "DR"
                          ? "text-red-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {t.type || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {typeof t.adminAmount === "number"
                      ? t.adminAmount.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof t.vendorAmount === "number"
                      ? t.vendorAmount.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof t.gatewayAmount === "number"
                      ? t.gatewayAmount.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {typeof t.vendorImpact === "number"
                      ? t.vendorImpact.toFixed(3)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof t.balanceAfter === "number"
                      ? t.balanceAfter.toFixed(3)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VendorPayoutsPage;
