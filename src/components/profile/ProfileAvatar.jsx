import { Camera, Loader2 } from "lucide-react";

function ProfileAvatar({
  profilePreview,
  uploadingField,
  handleImageChange,
  profile,
}) {
  return (
    <div className="flex items-center gap-6 mb-6">
      <div className="relative">
        <img
          src={profilePreview}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />

        <label className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full cursor-pointer">
          {uploadingField === "profile" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Camera size={16} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e, "profile")}
          />
        </label>
      </div>

      <div>
        <h2 className="text-2xl font-semibold">{profile?.name}</h2>
        <p className="text-gray-600">{profile?.bio}</p>
        <p className="text-sm text-gray-500">{profile?.email}</p>
        <p className="text-sm text-gray-500">{profile?.phone}</p>
      </div>
    </div>
  );
}

export default ProfileAvatar;