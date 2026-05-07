import { useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import FormInput from "../common/FormInput";
import FormTextarea from "../common/FormTextarea";

const selectClass =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

function ProfileDetailsForm({
  register,
  handleSubmit,
  onSubmit,
  saving,
  setIsEditing,
  profile,
  businessTypes = [],
  businessCategories = [],
  watch,
  setValue,
  getValues,
}) {
  const selectedTypeId = watch("businessTypeId");
  const selectedCategoryIds = watch("businessCategoryIds") || [];

  const filteredCategories = useMemo(() => {
    if (!selectedTypeId) return [];
    return businessCategories.filter((cat) =>
      (cat.businessTypes || []).some(
        (bt) => String(bt._id || bt) === String(selectedTypeId)
      )
    );
  }, [businessCategories, selectedTypeId]);

  useEffect(() => {
    const allowed = new Set(
      filteredCategories.map((c) => String(c._id))
    );
    const cur = (getValues("businessCategoryIds") || []).map(String);
    const next = cur.filter((id) => allowed.has(id));
    if (next.length !== cur.length) {
      setValue("businessCategoryIds", next, { shouldDirty: true });
    }
  }, [selectedTypeId, filteredCategories, setValue, getValues]);

  const toggleCategory = (catId) => {
    const id = String(catId);
    const cur = (watch("businessCategoryIds") || []).map(String);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setValue("businessCategoryIds", next, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <FormInput label="Bio" name="bio" register={register} />
      <FormInput label="Expertise" name="expertise" register={register} />
      <FormTextarea label="About" name="about" register={register} />

      {businessTypes.length === 0 && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Business types and categories could not be loaded. Refresh the page
          or check that the API is reachable.
        </p>
      )}

      <div>
        <label
          htmlFor="businessTypeId"
          className="block text-sm text-gray-700 mb-2"
        >
          Business type
        </label>
        <select
          id="businessTypeId"
          className={selectClass}
          {...register("businessTypeId")}
        >
          <option value="">Select business type</option>
          {businessTypes.map((t) => (
            <option key={t._id} value={t._id}>
              {t.titleEn}
              {t.titleAr ? ` / ${t.titleAr}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm text-gray-700 mb-2">
          Business categories
        </span>
        {!selectedTypeId ? (
          <p className="text-sm text-gray-500">
            Choose a business type first, then select one or more categories.
          </p>
        ) : filteredCategories.length === 0 ? (
          <p className="text-sm text-amber-800">No categories for this type.</p>
        ) : (
          <ul className="space-y-2 border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
            {filteredCategories.map((c) => {
              const id = String(c._id);
              const checked = selectedCategoryIds.map(String).includes(id);
              return (
                <li key={id}>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      {c.titleEn}
                      {c.titleAr ? ` / ${c.titleAr}` : ""}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <h3 className="font-semibold text-gray-700 mt-4">Business Address</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(profile.businessAddress).map((field) => (
          <FormInput
            key={field}
            label={field}
            name={field}
            register={register}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : "Save"}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProfileDetailsForm;
