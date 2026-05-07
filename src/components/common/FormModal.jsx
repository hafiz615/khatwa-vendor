import { X } from "lucide-react";

/**
 * Simple overlay modal for forms (distinct from confirmation Modal.jsx).
 */
export default function FormModal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {title ? (
          <h2 id="form-modal-title" className="px-6 pt-6 pb-2 text-lg font-semibold text-gray-900">
            {title}
          </h2>
        ) : null}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
