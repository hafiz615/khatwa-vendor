import { AlertCircle } from "lucide-react";

function FormTextarea({
  label,
  id,
  placeholder,
  register,
  name,
  rules = {},
  errors,
  rows = 4,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm text-gray-700 mb-2">
          {label}
        </label>
      )}

      <textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        {...register(name, rules)}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {errors && errors?.[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name].message}
        </p>
      )}
    </div>
  );
}

export default FormTextarea;