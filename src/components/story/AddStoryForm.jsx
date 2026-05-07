import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import FormErrorAlert from "../common/FormErrorAlert";
import { Upload, X, Image as ImageIcon, Film } from "lucide-react";
import { createStory } from "../../services/story.service";
import { useNavigate } from "react-router-dom";

function AddStoryForm() {
  const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useSelector((state) => state.auth.token);

  const handleFileChange = (file) => {
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      setErr("Please upload an image or video file.");
      return;
    }

    setMediaFile(file);
    setPreview({ url: URL.createObjectURL(file), isVideo });
    setErr(null);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setMediaFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!mediaFile) {
      return setErr("Please upload an image or video.");
    }

    const formData = new FormData();
    formData.append("media", mediaFile);

    try {
      setIsSubmitting(true);
      const result = await createStory(token, formData, setErr);
      if (result) {
        toast.success("Story created successfully! It will expire in 24 hours.");
        navigate("/dashboard/stories");
        handleRemove();
      }
    } catch (error) {
      console.error("Error creating story", error);
      toast.error("Failed to create story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm space-y-5"
    >
      <h2 className="text-lg font-semibold mb-4">Create New Story</h2>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
        <p className="font-medium">Story will expire in 24 hours</p>
        <p className="text-xs mt-1">Upload a single image or video (max 30 seconds)</p>
      </div>

      {err && <FormErrorAlert message={err} onClose={() => setErr(null)} />}

      {!preview ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Media</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => document.getElementById("story-media-input").click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">Click or drag to upload</p>
            <p className="text-gray-400 text-xs mt-1">Image (JPG, PNG, WEBP) or Video (MP4, max 30s)</p>
            <input
              id="story-media-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Preview</label>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
            {preview.isVideo ? (
              <div className="relative aspect-[9/16] max-h-[600px] mx-auto">
                <video
                  src={preview.url}
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  Video
                </div>
              </div>
            ) : (
              <div className="relative aspect-[9/16] max-h-[600px] mx-auto">
                <img
                  src={preview.url}
                  alt="Story preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Image
                </div>
              </div>
            )}
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !mediaFile}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Publishing..." : "Publish Story"}
      </button>
    </form>
  );
}

export default AddStoryForm;
