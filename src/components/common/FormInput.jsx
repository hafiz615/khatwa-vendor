import { AlertCircle  } from "lucide-react";

function FormInput({
  label,
  id,
  placeholder,
  type = "text",
  register,
  min,
  name,
  rules = {},
  errors,
  prefix, // e.g. number like "01"
  rightIcon, // e.g. password toggle button
}) {
    // console.log(register)
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {prefix && <span className="px-4 text-gray-400 text-sm">{prefix}</span>}
        {prefix && <div className="w-px h-6 bg-gray-200"></div>}

        <input
          id={id}
          min={min}
          type={type}
          placeholder={placeholder}
          {...register(name, rules)}
          className="flex-1 px-4 py-3 outline-none text-sm"
        />

        {rightIcon && <div className="px-3">{rightIcon}</div>}
      </div>

      {errors?.[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle  className="w-3 h-3" />
          {errors[name].message}
        </p>
      )}
    </div>
  );
}

export default FormInput;