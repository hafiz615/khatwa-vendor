import { AlertCircle } from "lucide-react";

function FormErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      className="flex items-start gap-3 p-3 mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm animate-fadeIn relative"
      role="alert"
    >
      <AlertCircle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default FormErrorAlert;