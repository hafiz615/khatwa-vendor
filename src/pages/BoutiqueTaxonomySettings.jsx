import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  FolderTree,
  CheckSquare,
  Square,
  Tag,
  Sparkles,
} from "lucide-react";
import {
  fetchStoreTaxonomy,
  createVendorCategory,
  createVendorSubcategory,
  saveStoreTaxonomySelection,
} from "../services/ecommerceDesigner.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

/// Page that lets a vendor with ecommerceAccess pick which categories and
/// subcategories appear in their boutique store on mobile, and add their own
/// vendor-scoped categories/subcategories.
export default function BoutiqueTaxonomySettings() {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState(new Set());
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [subcategoryDrafts, setSubcategoryDrafts] = useState({}); // { [parentId]: { name, description, image, submitting } }

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetchStoreTaxonomy(token);
      if (!res?.success) throw new Error(res?.message || "Failed to load");
      const tree = res.data?.categories || [];
      setCategories(tree);
      const initialCats = new Set(res.data?.selection?.selectedCategoryIds || []);
      const initialSubs = new Set(
        res.data?.selection?.selectedSubcategoryIds || []
      );
      setSelectedCategoryIds(initialCats);
      setSelectedSubcategoryIds(initialSubs);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          "Failed to load store taxonomy."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const subcategoryParentMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      for (const sub of cat.subcategories || []) {
        map.set(String(sub._id), String(cat._id));
      }
    }
    return map;
  }, [categories]);

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      const idStr = String(categoryId);
      if (next.has(idStr)) {
        next.delete(idStr);
        // Also drop any selected subcategories under it.
        setSelectedSubcategoryIds((subs) => {
          const nextSubs = new Set(subs);
          for (const sub of nextSubs) {
            if (subcategoryParentMap.get(sub) === idStr) {
              nextSubs.delete(sub);
            }
          }
          return nextSubs;
        });
      } else {
        next.add(idStr);
      }
      return next;
    });
  };

  const toggleSubcategory = (subcategoryId, parentCategoryId) => {
    const parentIdStr = String(parentCategoryId);
    setSelectedSubcategoryIds((prev) => {
      const next = new Set(prev);
      const idStr = String(subcategoryId);
      if (next.has(idStr)) {
        next.delete(idStr);
      } else {
        next.add(idStr);
        // Auto-select parent for clarity.
        setSelectedCategoryIds((cats) => {
          const nextCats = new Set(cats);
          nextCats.add(parentIdStr);
          return nextCats;
        });
      }
      return next;
    });
  };

  const handleCreateCategory = async (e) => {
    e?.preventDefault?.();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Category name is required.");
      return;
    }
    setCreatingCategory(true);
    setErr("");
    try {
      const formData = new FormData();
      formData.append("name", trimmed);
      if (newCategoryDescription.trim()) {
        formData.append("description", newCategoryDescription.trim());
      }
      if (newCategoryImage) formData.append("image", newCategoryImage);

      const res = await createVendorCategory(token, formData);
      if (!res?.success) throw new Error(res?.message || "Create failed");
      toast.success("Category created.");
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryImage(null);
      await load();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Create failed.";
      setErr(msg);
      toast.error(msg);
    } finally {
      setCreatingCategory(false);
    }
  };

  const updateSubcategoryDraft = (parentId, patch) => {
    setSubcategoryDrafts((prev) => ({
      ...prev,
      [parentId]: { ...(prev[parentId] || {}), ...patch },
    }));
  };

  const handleCreateSubcategory = async (parentId) => {
    const draft = subcategoryDrafts[parentId] || {};
    const trimmed = (draft.name || "").trim();
    if (!trimmed) {
      toast.error("Subcategory name is required.");
      return;
    }
    updateSubcategoryDraft(parentId, { submitting: true });
    setErr("");
    try {
      const formData = new FormData();
      formData.append("name", trimmed);
      formData.append("parentCategoryId", parentId);
      if ((draft.description || "").trim()) {
        formData.append("description", draft.description.trim());
      }
      if (draft.image) formData.append("image", draft.image);
      const res = await createVendorSubcategory(token, formData);
      if (!res?.success) throw new Error(res?.message || "Create failed");
      toast.success("Subcategory created.");
      setSubcategoryDrafts((prev) => ({ ...prev, [parentId]: {} }));
      await load();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Create failed.";
      setErr(msg);
      toast.error(msg);
    } finally {
      updateSubcategoryDraft(parentId, { submitting: false });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await saveStoreTaxonomySelection(token, {
        selectedCategoryIds: Array.from(selectedCategoryIds),
        selectedSubcategoryIds: Array.from(selectedSubcategoryIds),
      });
      if (!res?.success) throw new Error(res?.message || "Save failed");
      toast.success("Store category selection saved.");
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
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="animate-pulse h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-blue-600" />
          Store categories
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pick which categories and subcategories appear in your boutique store
          on the mobile app. You can also add your own vendor-only categories
          and subcategories. If you do not pick anything, your store will show
          the default admin categories.
        </p>
      </header>

      {err && <FormErrorAlert message={err} onClose={() => setErr("")} />}

      <section className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-900">
            Add a vendor category
          </h2>
        </div>
        <form
          onSubmit={handleCreateCategory}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewCategoryImage(e.target.files?.[0] || null)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creatingCategory}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {creatingCategory ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add category
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Choose what to show in your store
          </h2>
        </div>
        {categories.length === 0 && (
          <div className="bg-white border rounded-xl p-5 text-sm text-gray-600">
            No categories available yet. Create your first vendor category
            above.
          </div>
        )}
        <div className="space-y-3">
          {categories.map((cat) => {
            const catIdStr = String(cat._id);
            const isSelected = selectedCategoryIds.has(catIdStr);
            const draft = subcategoryDrafts[catIdStr] || {};
            return (
              <div
                key={cat._id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-gray-50">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat._id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cat.scope === "vendor" ? "Your category" : "Admin category"}
                      </div>
                    </div>
                  </button>
                </div>

                <div className="px-4 py-3 space-y-3">
                  {(cat.subcategories || []).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.subcategories.map((sub) => {
                        const subIdStr = String(sub._id);
                        const subSelected = selectedSubcategoryIds.has(subIdStr);
                        return (
                          <button
                            key={sub._id}
                            type="button"
                            onClick={() => toggleSubcategory(sub._id, cat._id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${
                              subSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {subSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="flex-1">{sub.name}</span>
                            <span className="text-[10px] uppercase tracking-wide text-gray-500">
                              {sub.scope === "vendor" ? "Yours" : "Admin"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Add a subcategory under {cat.name}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Subcategory name"
                        value={draft.name || ""}
                        onChange={(e) =>
                          updateSubcategoryDraft(catIdStr, {
                            name: e.target.value,
                          })
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={draft.description || ""}
                        onChange={(e) =>
                          updateSubcategoryDraft(catIdStr, {
                            description: e.target.value,
                          })
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateSubcategoryDraft(catIdStr, {
                            image: e.target.files?.[0] || null,
                          })
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleCreateSubcategory(catIdStr)}
                        disabled={draft.submitting}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 text-sm"
                      >
                        {draft.submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add subcategory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckSquare className="w-4 h-4" />
          )}
          Save store categories
        </button>
      </div>
    </div>
  );
}
