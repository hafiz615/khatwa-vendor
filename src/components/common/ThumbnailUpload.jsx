import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

function ThumbnailUpload({
  label,
  text = "Click or drag thumbnail to upload",
  onChange,
}) {
  const [thumbnail, setThumbnail] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const preview = { file, url: URL.createObjectURL(file) };
    setThumbnail(preview);
    onChange && onChange(file); // ✅ send actual File to parent
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleRemove = () => {
    setThumbnail(null);
    onChange && onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      {!thumbnail ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-6 h-6 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">{text}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="relative w-48 h-48">
          <img
            src={thumbnail.url}
            alt="Thumbnail preview"
            className="rounded-lg w-full h-full object-cover border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ThumbnailUpload;