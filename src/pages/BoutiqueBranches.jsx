import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchBranches,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
} from "../services/ecommerceDesigner.service";
import FormErrorAlert from "../components/common/FormErrorAlert";
import BranchMapPicker from "../components/ecommerce/BranchMapPicker";
import FormModal from "../components/common/FormModal";
import { MapPin, Pencil, Trash2 } from "lucide-react";

export default function BoutiqueBranches() {
  const { token } = useSelector((state) => state.auth);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", lat: "", lng: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetchBranches(token);
      if (!res.success) throw new Error(res.message || "Failed to load branches");
      setBranches(res.branches || []);
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({ name: "", lat: "29.3759", lng: "47.9774" });
    setModal({ mode: "add" });
  };

  const openEdit = (b) => {
    setForm({
      name: b.name || "",
      lat: b.lat != null ? String(b.lat) : "",
      lng: b.lng != null ? String(b.lng) : "",
    });
    setModal({ mode: "edit", branchId: b._id });
  };

  const closeModal = () => {
    setModal(null);
    setForm({ name: "", lat: "", lng: "" });
  };

  const submitBranch = async () => {
    const name = form.name.trim();
    const latN = Number(form.lat);
    const lngN = Number(form.lng);
    if (!name) {
      toast.error("Branch name is required.");
      return;
    }
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
      toast.error("Enter valid latitude and longitude.");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "add") {
        const res = await createBranchApi(token, { name, lat: latN, lng: lngN });
        if (!res.success) throw new Error(res.message || "Create failed");
        toast.success("Branch created.");
      } else {
        const res = await updateBranchApi(token, modal.branchId, {
          name,
          lat: latN,
          lng: lngN,
        });
        if (!res.success) throw new Error(res.message || "Update failed");
        toast.success("Branch updated.");
      }
      closeModal();
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (b) => {
    setModal({
      mode: "delete",
      branchId: b._id,
      branchName: b.name,
    });
  };

  const doDelete = async () => {
    if (!modal?.branchId) return;
    setSaving(true);
    try {
      const res = await deleteBranchApi(token, modal.branchId);
      if (!res.success) throw new Error(res.message || "Delete failed");
      toast.success("Branch deleted.");
      closeModal();
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="animate-pulse h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Create pickup or fulfillment locations. Set the point on the map (or type coordinates),
            then name the branch. Every boutique product must be linked to one of these branches.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
        >
          Add branch
        </button>
      </header>

      {err && <FormErrorAlert message={err} onClose={() => setErr("")} />}

      <ul className="space-y-3">
        {branches.length === 0 && (
          <li className="text-sm text-gray-500 border rounded-xl p-6 bg-gray-50">
            No branches yet. Add one so you can assign products to a location.
          </li>
        )}
        {branches.map((b) => (
          <li
            key={b._id}
            className="flex flex-wrap items-center justify-between gap-3 border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{b.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {Number(b.lat).toFixed(6)}, {Number(b.lng).toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(b)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                aria-label="Edit branch"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(b)}
                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                aria-label="Delete branch"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {modal?.mode === "add" || modal?.mode === "edit" ? (
        <FormModal
          onClose={closeModal}
          title={modal.mode === "add" ? "Add branch" : "Edit branch"}
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Branch name
              <input
                type="text"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Salmiya showroom"
              />
            </label>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
              <BranchMapPicker
                lat={form.lat}
                lng={form.lng}
                onPositionChange={(la, ln) =>
                  setForm((f) => ({ ...f, lat: String(la), lng: String(ln) }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-700">
                Latitude
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Longitude
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={submitBranch}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </FormModal>
      ) : null}

      {modal?.mode === "delete" ? (
        <FormModal onClose={closeModal} title="Delete branch">
          <p className="text-sm text-gray-600 mb-4">
            Delete <strong>{modal.branchName}</strong>? This is only allowed if no products use this
            branch.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={doDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
            >
              {saving ? "Deleting…" : "Delete"}
            </button>
          </div>
        </FormModal>
      ) : null}
    </div>
  );
}
