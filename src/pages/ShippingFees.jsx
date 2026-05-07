import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchShippingFeeTiers,
  saveShippingFeeTiers,
} from "../services/ecommerceDesigner.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

export default function ShippingFees() {
  const { token } = useSelector((state) => state.auth);
  const [feeKwd, setFeeKwd] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetchShippingFeeTiers(token);
      if (!res.success) throw new Error(res.message || "Failed to load");
      const fee = Number(res.feeKwd ?? 0);
      setFeeKwd(Number.isFinite(fee) ? String(fee) : "0");
    } catch (e) {
      setErr(
        e.response?.data?.message || e.message || "Failed to load shipping fee."
      );
      setFeeKwd("0");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const fee = Number(feeKwd);
    if (!Number.isFinite(fee) || fee < 0) {
      const msg = "Shipping fee must be a non-negative number.";
      setErr(msg);
      toast.error(msg);
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await saveShippingFeeTiers(token, fee);
      if (!res.success) throw new Error(res.message || "Save failed");
      setFeeKwd(String(Number(res.feeKwd ?? fee)));
      toast.success("Shipping fee saved.");
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Save failed.";
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="animate-pulse h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-lg font-semibold text-gray-900">Shipping fee</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set one fixed delivery fee (KWD) for all boutique orders.
        </p>
      </header>

      {err && <FormErrorAlert message={err} onClose={() => setErr("")} />}

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-gray-700">
        This fee is applied once per order at checkout.
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Fixed shipping fee (KWD)
        </label>
        <input
          type="number"
          step="0.001"
          min="0"
          className="w-full max-w-xs border rounded-lg px-3 py-2"
          value={feeKwd}
          onChange={(e) => setFeeKwd(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save shipping fee"}
      </button>
    </div>
  );
}
