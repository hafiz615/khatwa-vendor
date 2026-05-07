import { useRef, useState, useEffect } from "react";
import { Upload, X } from "lucide-react";

function VideoUpload({ label, text = "Click or drag a video to upload", onChange, reset }) {
  const [video, setVideo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (reset && video) {
      URL.revokeObjectURL(video.url);
      setVideo(null);
    }
  }, [reset, video]);

  const handleFile = (file) => {
    if (!file) return;
    const newVideo = { file, url: URL.createObjectURL(file) };
    setVideo(newVideo);
    onChange && onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
    onChange && onChange(null);
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
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {video && (
        <div className="relative mt-3 rounded-lg overflow-hidden border">
          <video src={video.url} controls className="w-full h-56 object-cover rounded-lg" />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;