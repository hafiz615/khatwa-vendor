import { useRef, useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { useEffect } from "react";

function ImageUpload({
  label,
  text = "Click or drag images to upload",
  onChange,
  reset
}) {
  const [images, setImages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (reset) setImages([]);
  }, [reset]);

  const handleFiles = useCallback(
    (files) => {
      const newFiles = Array.from(files);
      const previews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      const updated = [...images, ...previews];
      setImages(updated);
      onChange && onChange(updated.map((i) => i.file)); // ✅ send actual files up
    },
    [images, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange && onChange(updated.map((i) => i.file));
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

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
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Uploaded ${index}`}
                className="rounded-lg w-full h-32 object-cover border"
              />
              <button
                onClick={() => handleRemove(index)}
                type="button"
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;