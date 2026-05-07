import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FileText, Upload, X } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import FormInput from "../common/FormInput";
import FormSelectInput from "../common/FormSelectInput";
import Button from "../common/Button";
import ThumbnailUpload from "../common/ThumbnailUpload";
import FormErrorAlert from "../common/FormErrorAlert";
import { studioEndpoints } from "../../services/api";
import { createDesign } from "../../services/studio.service";
import apiConnector from "../../services/apiConnector";

function DesignForm({ onSuccess }) {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState(null);
  const [image, setImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [imageError, setImageError] = useState("");
  const [documentError, setDocumentError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiConnector(
          "GET",
          `${studioEndpoints.DESIGN_CAT_API}`,
          null,
          { Authorization: `Bearer ${token}` }
        );
        setCategories(res.data?.categories || res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    if (token) fetchCategories();
  }, [token]);

  const onSubmit = async (data) => {
    let hasError = false;

    // Validate image
    if (!image) {
      setImageError("Image is required.");
      hasError = true;
    }

    // Validate document
    if (!document) {
      setDocumentError("Please upload a PDF file.");
      hasError = true;
    } else if (document.type !== "application/pdf") {
      setDocumentError("Only PDF files are allowed.");
      hasError = true;
    } else if (document.size > 50 * 1024 * 1024) {
      setDocumentError("PDF file size must be under 50MB.");
      hasError = true;
    }

    if (hasError) return;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("area", data.area);
    formData.append(
      "categoryId",
      categories.find((c) => c.name === data.categoryId)?._id || data.categoryId
    );
    formData.append("image", image);
    formData.append("document", document);

    const toastId = toast.loading("Adding design product...");
    try {
      const response = await createDesign(token, formData, setErr);
      toast.dismiss(toastId);
      if (response?.success) {
        // toast.success("Design added successfully!");
        reset();
        setImage(null);
        setDocument(null);
        onSuccess?.();
      } else {
        toast.error(response?.message || "Failed to add design");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error adding design:", error);
      toast.error("Something went wrong while adding the design");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-sm rounded-lg p-6 space-y-5"
      encType="multipart/form-data"
    >
      <FormErrorAlert message={err} onClose={() => setErr(null)} />

      <FormInput
        label="Design Name"
        name="name"
        placeholder="Enter design name"
        register={register}
        rules={{ required: "Design name is required" }}
        errors={errors}
      />

      <FormInput
        label="Description"
        name="description"
        placeholder="Enter design description"
        register={register}
        rules={{ required: "Description is required" }}
        errors={errors}
        as="textarea"
      />

      <FormInput
        label="Price (KWD)"
        name="price"
        type="number"
        min="1"
        placeholder="Enter design price"
        register={register}
        rules={{
          required: "Price is required",
          min: { value: 1, message: "Price must be greater than 0" },
        }}
        errors={errors}
      />

      <FormInput
        label="Area (sq ft)"
        name="area"
        type="number"
        min="1"
        placeholder="Enter design area"
        register={register}
        rules={{
          required: "Area is required",
          min: { value: 1, message: "Area must be greater than 0" },
        }}
        errors={errors}
      />

      <FormSelectInput
        label="Category"
        name="categoryId"
        options={categories?.map((c) => c.name)}
        register={register}
        rules={{ required: "Please select a category" }}
        errors={errors}
      />

      {/* Image Upload */}
      <div>
        <ThumbnailUpload
          label="Design Image"
          onChange={(file) => {
            setImage(file);
            setImageError("");
          }}
        />
        {imageError && (
          <p className="text-sm text-red-500 mt-1">{imageError}</p>
        )}
      </div>

      {/* Document Upload */}
      <label
        htmlFor="pdfUpload"
        className="block border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer"
      >
        <span className="block font-medium text-gray-800 mb-2">
          Design Document (PDF)
        </span>

        {!document ? (
          <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
            <Upload className="w-10 h-10 text-gray-400" />
            <p className="text-sm">Tap here to upload PDF (max 50MB)</p>

            <input
              type="file"
              accept="application/pdf"
              id="pdfUpload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                setDocument(file);
                setDocumentError("");
              }}
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-2"
            onClick={(e) => e.stopPropagation()} // prevent triggering file picker
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-red-500" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {document.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDocument(null)}
              className="text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {documentError && (
          <p className="text-sm text-red-500 mt-2">{documentError}</p>
        )}
      </label>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Adding..." : "Add Design"}
        </button>
      </div>
    </form>
  );
}

export default DesignForm;