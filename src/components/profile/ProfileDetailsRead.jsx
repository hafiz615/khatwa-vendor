import { Edit2 } from "lucide-react";

function ProfileDetailsRead({ profile, setIsEditing }) {
  return (
    <>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
      >
        <Edit2 size={20} />
      </button>

      <div className="space-y-3">
        <DetailRow label="Bio" value={profile.bio} />
        <DetailRow label="Expertise" value={profile.expertise.join(", ")} />
        <DetailRow label="About" value={profile.about} />
        <DetailRow
          label="Business type"
          value={
            profile.businessTypeTitleEn ||
            profile.businessType ||
            "—"
          }
        />
        <DetailRow
          label="Business categories"
          value={
            profile.businessCategories?.length
              ? profile.businessCategories
                  .map((c) => c.titleEn || c.titleAr || "")
                  .filter(Boolean)
                  .join(", ") ||
                profile.businessCategoryTitleEn ||
                "—"
              : profile.businessCategoryTitleEn || "—"
          }
        />

        <h3 className="font-semibold text-gray-700 mt-4">Business Address</h3>

        {Object.entries(profile.businessAddress).map(([k, v]) => (
          <DetailRow key={k} label={k} value={v} />
        ))}
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-gray-700">{value || "—"}</p>
    </div>
  );
}

export default ProfileDetailsRead;