import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, Film, Image } from "lucide-react";

function MediaUpload({ label, text = "Click or drag images/videos to upload", onChange, reset }) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (reset) {
      files.forEach((f) => URL.revokeObjectURL(f.url));
      setFiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const handleFiles = useCallback(
    (incoming) => {
      const newFiles = Array.from(incoming).map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      }));
      const updated = [...files, ...newFiles];
      setFiles(updated);
      onChange && onChange(updated.map((f) => f.file));
    },
    [files, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index) => {
    URL.revokeObjectURL(files[index].url);
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onChange && onChange(updated.map((f) => f.file));
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
        <p className="text-gray-400 text-xs mt-1">Images (JPG, PNG, WEBP) or Videos (MP4)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((item, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border bg-gray-100 h-28">
              {item.isVideo ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Film className="w-6 h-6 mb-1" />
                  <span className="text-xs text-center px-1 truncate w-full text-center">
                    {item.file.name}
                  </span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`media-${index}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-1 left-1">
                {item.isVideo ? (
                  <Film className="w-4 h-4 text-white drop-shadow" />
                ) : (
                  <Image className="w-4 h-4 text-white drop-shadow" />
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                type="button"
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaUpload;
