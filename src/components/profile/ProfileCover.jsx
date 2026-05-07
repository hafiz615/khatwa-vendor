import { Camera, Loader2 } from "lucide-react";

function ProfileCover({ coverPreview, uploadingField, handleImageChange }) {
  return (
    <div className="relative mb-6">
      <img src={coverPreview} className="w-full h-64 object-cover rounded-xl" />

      <label className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full cursor-pointer">
        {uploadingField === "cover" ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Camera size={18} />
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e, "cover")}
        />
      </label>
    </div>
  );
}

export default ProfileCover;