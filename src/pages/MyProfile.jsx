import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import ProfileCardsEditor from "../components/profile/ProfileCardsEditor";
import { updateUser } from "../slices/profile";
import {
  fetchProfileData,
  updateImageAPI,
  updateProfileInfoAPI,
} from "../services/profile.service";
import { fetchPublicBusinessMaster } from "../services/businessMaster.service";
import FormErrorAlert from "../components/common/FormErrorAlert";

import ProfileCover from "../components/profile/ProfileCover";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileDetailsRead from "../components/profile/ProfileDetailsRead";
import ProfileDetailsForm from "../components/profile/ProfileDetailsForm";

function MyProfile() {
  const { user } = useSelector((state) => state.profile);
  const token = useSelector((state) => state.auth.token);
  const subscriptionState = useSelector((state) => state.subscription);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingField, setUploadingField] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [master, setMaster] = useState({
    businessTypes: [],
    businessCategories: [],
  });

  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm();

  // Fetch profile + public business type / category lists
  useEffect(() => {
    const load = async () => {
      try {
        const [res, masterData] = await Promise.all([
          fetchProfileData(token),
          fetchPublicBusinessMaster().catch(() => ({
            businessTypes: [],
            businessCategories: [],
          })),
        ]);
        if (res.success) {
          setMaster({
            businessTypes: masterData.businessTypes,
            businessCategories: masterData.businessCategories,
          });
          setProfile(res.data);
          setCoverPreview(res.data.cover);
          setProfilePreview(res.data.profile);

          const categoryIds = Array.isArray(res.data.businessCategoryIds)
            ? res.data.businessCategoryIds.map(String)
            : res.data.businessCategoryId
              ? [String(res.data.businessCategoryId)]
              : [];
          reset({
            bio: res.data.bio,
            expertise: res.data.expertise.join(", "),
            about: res.data.about,
            businessTypeId: res.data.businessTypeId
              ? String(res.data.businessTypeId)
              : "",
            businessCategoryIds: categoryIds,
            ...res.data.businessAddress,
          });
        }
      } catch {
        setErrorMsg("Failed to load profile.");
      }
    };
    if (token) load();
  }, [token, reset]);

  // Handle Upload
  const handleImageChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    field === "cover"
      ? setCoverPreview(localPreview)
      : setProfilePreview(localPreview);
    setUploadingField(field);

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const res = await updateImageAPI(field, formData, token);
      const updatedUrl = res.data[field];

      field === "cover"
        ? setCoverPreview(updatedUrl)
        : setProfilePreview(updatedUrl);

      setProfile((prev) => ({ ...prev, [field]: updatedUrl }));

      const updatedUser = { ...user, [field]: updatedUrl };
      dispatch(updateUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      setErrorMsg(`Failed to upload ${field}. Try again.`);
    }

    setUploadingField("");
  };

  // Save Profile
  const onSubmit = async (data) => {
    setSaving(true);

    const updatedFields = {};
    const expertiseArr = data.expertise
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (data.bio !== profile.bio) updatedFields.bio = data.bio;
    if (data.about !== profile.about) updatedFields.about = data.about;

    const catIds = Array.isArray(data.businessCategoryIds)
      ? [...new Set(data.businessCategoryIds.filter(Boolean).map(String))]
      : [];
    const hasAnyTax = Boolean(data.businessTypeId || catIds.length);
    const hasBothTax = Boolean(data.businessTypeId && catIds.length >= 1);
    if (hasAnyTax && !hasBothTax) {
      setErrorMsg(
        "Please select a business type and at least one business category."
      );
      setSaving(false);
      return;
    }
    if (hasBothTax) {
      const prevT = profile.businessTypeId ? String(profile.businessTypeId) : "";
      const prevCatsKey = Array.isArray(profile.businessCategoryIds)
        ? [...profile.businessCategoryIds.map(String)].sort().join(",")
        : profile.businessCategoryId
          ? String(profile.businessCategoryId)
          : "";
      const nextCatsKey = [...catIds].sort().join(",");
      if (String(data.businessTypeId) !== prevT || nextCatsKey !== prevCatsKey) {
        updatedFields.businessTypeId = data.businessTypeId;
        updatedFields.businessCategoryIds = catIds;
      }
    }

    if (JSON.stringify(expertiseArr) !== JSON.stringify(profile.expertise))
      updatedFields.expertise = expertiseArr;

    const addressChanges = {};
    [
      "block",
      "street",
      "house",
      "avenue",
      "floor",
      "apartment",
      "area",
    ].forEach((f) => {
      if (data[f] !== profile.businessAddress[f]) {
        addressChanges[f] = data[f];
      }
    });

    if (Object.keys(addressChanges).length) {
      updatedFields.businessAddress = {
        ...profile.businessAddress,
        ...addressChanges,
      };
    }

    let res;
    try {
      res = await updateProfileInfoAPI(updatedFields, token);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message || "Failed to update profile."
      );
      setSaving(false);
      return;
    }

    if (res.success) {
      setProfile((prev) => {
        const next = {
          ...prev,
          ...updatedFields,
          businessTypeId: updatedFields.businessTypeId ?? prev.businessTypeId,
          businessCategoryIds:
            updatedFields.businessCategoryIds ?? prev.businessCategoryIds,
          businessCategoryId:
            updatedFields.businessCategoryIds?.[0] ??
            prev.businessCategoryId,
        };
        if (
          updatedFields.businessTypeId &&
          updatedFields.businessCategoryIds?.length
        ) {
          const t = master.businessTypes.find(
            (x) => String(x._id) === String(updatedFields.businessTypeId)
          );
          const titles = updatedFields.businessCategoryIds
            .map((cid) =>
              master.businessCategories.find(
                (x) => String(x._id) === String(cid)
              )
            )
            .filter(Boolean)
            .map((c) => c.titleEn);
          next.businessType = t?.titleEn || prev.businessType;
          next.businessTypeTitleEn = t?.titleEn ?? prev.businessTypeTitleEn;
          next.businessCategoryTitleEn =
            titles.length > 0 ? titles.join(", ") : prev.businessCategoryTitleEn;
          next.businessCategories = updatedFields.businessCategoryIds.map(
            (cid) => {
              const c = master.businessCategories.find(
                (x) => String(x._id) === String(cid)
              );
              return c
                ? { _id: c._id, titleEn: c.titleEn, titleAr: c.titleAr }
                : { _id: cid };
            }
          );
        }
        return next;
      });
      setIsEditing(false);
    } else {
      setErrorMsg(res.message || "Failed to update profile.");
    }

    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white border rounded-2xl shadow-sm p-6">
      {errorMsg && (
        <FormErrorAlert message={errorMsg} onClose={() => setErrorMsg("")} />
      )}

      {/* Cover Image */}
      <ProfileCover
        coverPreview={coverPreview}
        uploadingField={uploadingField}
        handleImageChange={handleImageChange}
        profile={profile}
      />

      {/* Avatar + Basic Info */}
      <ProfileAvatar
        profilePreview={profilePreview}
        uploadingField={uploadingField}
        handleImageChange={handleImageChange}
        profile={profile}
      />

      {/* Details */}
      <div className="relative border rounded-xl p-5 bg-gray-50">
        {!profile ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="loader" />
          </div>
        ) : !isEditing ? (
          <ProfileDetailsRead profile={profile} setIsEditing={setIsEditing} />
        ) : (
          <ProfileDetailsForm
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            saving={saving}
            setIsEditing={setIsEditing}
            profile={profile}
            businessTypes={master.businessTypes}
            businessCategories={master.businessCategories}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        )}
      </div>

      {profile && (
        <ProfileCardsEditor
          profile={profile}
          token={token}
          subscriptionState={subscriptionState}
          setErrorMsg={setErrorMsg}
          onProfileCardsSaved={(nextCards) => {
            setProfile((prev) =>
              prev ? { ...prev, profileCards: nextCards } : prev
            );
          }}
        />
      )}

    </div>
  );
}

export default MyProfile;