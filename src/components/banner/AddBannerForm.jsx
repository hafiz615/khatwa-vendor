import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Upload, X, ExternalLink, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../common/FormInput";
import FormSelectInput from "../common/FormSelectInput";
import FormErrorAlert from "../common/FormErrorAlert";
import {
  createBanner,
  getVendorBanners,
  updateVendorBanner,
} from "../../services/banner.service";
import { hasBannerAccess } from "../../utils/subscriptionAccess";

function AddBannerForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useSelector((state) => state.auth.token);
  const subscriptionState = useSelector((state) => state.subscription);
  const allowed = hasBannerAccess(subscriptionState);
  const [err, setErr] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [existingBanner, setExistingBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const resubmitId = searchParams.get("resubmit");

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      tapActionType: "profile",
      externalUrl: "",
    },
  });

  const tapActionType = watch("tapActionType");
  const isResubmit = Boolean(resubmitId);

  const toInputDate = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    let active = true;
    const loadExistingBanner = async () => {
      if (!isResubmit || !token) return;
      setLoadingDraft(true);
      const list = await getVendorBanners(token);
      if (!active) return;
      const b = (list || []).find((x) => String(x._id) === String(resubmitId));
      if (!b) {
        setErr("Could not find the selected banner for resubmission.");
        setLoadingDraft(false);
        return;
      }
      if (b.approvalStatus !== "rejected") {
        setErr("Only rejected banners can be resubmitted.");
        setLoadingDraft(false);
        return;
      }
      setExistingBanner(b);
      reset({
        name: b.name || "",
        startDate: toInputDate(b.startDate),
        endDate: toInputDate(b.endDate),
        tapActionType: b.tapActionType || "profile",
        externalUrl: b.externalUrl || "",
      });
      setPreviewUrl(b.image || "");
      setLoadingDraft(false);
    };
    loadExistingBanner();
    return () => {
      active = false;
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isResubmit, token, resubmitId, reset]);

  const actionHint = useMemo(
    () =>
      tapActionType === "profile"
        ? "Banner tap will open your business profile in the mobile app."
        : "Banner tap will open your external URL in the mobile app browser.",
    [tapActionType]
  );

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Banner must be an image file.");
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageFile(file);
    setErr(null);
  };

  const clearImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setImageFile(null);
  };

  const onSubmit = async (data) => {
    if (!allowed) return;
    setErr(null);
    if (!imageFile) {
      setErr(
        isResubmit
          ? "Please upload a new banner image before resubmitting."
          : "Please upload a banner image."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("tapActionType", data.tapActionType);
    if (data.tapActionType === "external_link") {
      formData.append("externalUrl", data.externalUrl);
    }
    if (imageFile) formData.append("image", imageFile);

    const saved = isResubmit
      ? await updateVendorBanner(resubmitId, token, formData, setErr)
      : await createBanner(token, formData, setErr);
    if (saved) {
      toast.success(
        isResubmit
          ? "Banner updated and resubmitted for review."
          : "Banner submitted for admin approval."
      );
      navigate("/dashboard/banners");
    }
  };

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Create Banner</h2>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
          Your current subscription does not include banner access.
        </div>
      </div>
    );
  }

  if (isResubmit && loadingDraft) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center items-center py-8">
          <div className="loader" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm space-y-5"
    >
      <h2 className="text-lg font-semibold mb-2">
        {isResubmit ? "Resubmit Banner" : "Create New Banner"}
      </h2>
      <p className="text-sm text-gray-500 -mt-3">
        {isResubmit
          ? "Update your rejected banner and submit it again for admin review."
          : "Banners require admin approval before appearing on mobile home."}
      </p>

      {err && <FormErrorAlert message={err} onClose={() => setErr(null)} />}
      {isResubmit && existingBanner?.rejectionReason && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 break-words whitespace-pre-wrap overflow-hidden max-h-32 overflow-y-auto">
          Previous rejection reason: {existingBanner.rejectionReason}
        </div>
      )}

      <FormInput
        label="Banner Name"
        name="name"
        placeholder="Summer Campaign"
        register={register}
        errors={errors}
        rules={{ required: "Banner name is required" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Start Date"
          name="startDate"
          type="date"
          register={register}
          errors={errors}
          rules={{ required: "Start date is required" }}
        />
        <FormInput
          label="End Date"
          name="endDate"
          type="date"
          register={register}
          errors={errors}
          rules={{ required: "End date is required" }}
        />
      </div>

      <FormSelectInput
        label="On Tap Behavior"
        name="tapActionType"
        options={["profile", "external_link"]}
        register={register}
        errors={errors}
        rules={{ required: "Please select on-tap behavior" }}
      />

      <div className="rounded-md bg-gray-50 border px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
        {tapActionType === "profile" ? (
          <UserCircle2 className="w-4 h-4" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}
        <span>{actionHint}</span>
      </div>

      {tapActionType === "external_link" && (
        <FormInput
          label="External URL"
          name="externalUrl"
          placeholder="https://example.com/promo"
          register={register}
          errors={errors}
          rules={{
            required: "External URL is required",
            pattern: {
              value: /^https?:\/\/.+/i,
              message: "URL must start with http:// or https://",
            },
          }}
        />
      )}

      {!previewUrl ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Banner Image</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => document.getElementById("banner-image-input")?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files?.[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">Click or drag to upload banner image</p>
            <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP</p>
            <input
              id="banner-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preview</label>
          <div className="relative border rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Banner preview"
              className="w-full h-56 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || (isResubmit && !imageFile)}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "Submitting..."
          : isResubmit
            ? "Update & Resubmit"
            : "Submit Banner"}
      </button>
      {isResubmit && !imageFile && (
        <p className="text-xs text-amber-700">
          Upload a new banner image to enable resubmission.
        </p>
      )}
    </form>
  );
}

export default AddBannerForm;
