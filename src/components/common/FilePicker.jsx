import { useRef, useState } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";

function FilePicker({ label, onFileSelect, accept = ".pdf", required = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const fileExtension = `.${file.name.split(".").pop()}`;
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      
      if (!acceptedTypes.includes(fileExtension)) {
        setError(`Please upload a valid file type: ${accept}`);
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      setError("");
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError("");
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex items-center gap-3">
          {selectedFile ? (
            <>
              <File className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-500">
                Click to upload {accept}
              </p>
            </>
          )}
        </div>

        {selectedFile && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export default FilePicker;