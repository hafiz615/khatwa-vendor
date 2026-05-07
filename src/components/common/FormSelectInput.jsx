import { ChevronDown, AlertCircle } from "lucide-react";

function FormSelectInput({
  label,
  id,
  name,
  options = [],
  /** When set, renders <optgroup> sections; each option value/label is the string. */
  optionGroups = null,
  placeholder = "Select an option",
  prefix,
  register,
  rules,
  errors,
}) {
  const error = errors?.[name];

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 ${
          error ? "border-red-500 focus-within:ring-red-500" : "border-gray-200 focus-within:ring-blue-500"
        }`}
      >
        {/* ✅ Prefix support */}
        {prefix && (
          <>
            <span className="px-4 text-gray-400 text-sm">{prefix}</span>
            <div className="w-px h-6 bg-gray-200"></div>
          </>
        )}

        <div className="relative flex-1">
          <select
            id={id || name}
            {...register(name, rules)}
            className="w-full px-4 py-3 text-sm appearance-none bg-white outline-none"
          >
            <option value="">{placeholder}</option>
            {optionGroups && optionGroups.length > 0
              ? optionGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {(group.options || []).map((opt) => (
                      <option key={`${group.label}-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))
              : options.map((opt) => {
                  const value =
                    typeof opt === "object" && opt !== null && "value" in opt
                      ? opt.value
                      : opt;
                  const label =
                    typeof opt === "object" && opt !== null && "label" in opt
                      ? opt.label
                      : opt;
                  return (
                    <option key={String(value)} value={value}>
                      {label}
                    </option>
                  );
                })}
          </select>
          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error.message}
        </p>
      )}
    </div>
  );
}

export default FormSelectInput;