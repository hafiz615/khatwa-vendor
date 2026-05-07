import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import FormInput from "../common/FormInput";
import FormSelectInput from "../common/FormSelectInput";
import ImageUpload from "../common/ImageUplaod";
import ThumbnailUpload from "../common/ThumbnailUpload";
import FormErrorAlert from "../common/FormErrorAlert";
import { createProduct, updateProduct } from "../../services/product.service";
import { fetchStoreTaxonomy } from "../../services/ecommerceDesigner.service";
// import { addProduct } from "../../services/product.service";

function ProductForm({
  onSuccess,
  mode = "create",
  productId = null,
  initialProduct = null,
}) {
  const isEdit = mode === "edit" && productId;
  const { token } = useSelector((state) => state.auth);
  const [thumbnail, setThumbnail] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [err, setErr] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [thumbnailError, setThumbnailError] = useState("");
  const [mediaError, setMediaError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    },
  });

  useEffect(() => {
    if (!initialProduct || !isEdit) return;
    reset({
      title: initialProduct.title ?? "",
      description: initialProduct.description ?? "",
      price: initialProduct.price ?? "",
      stock: initialProduct.stock ?? "",
      category: initialProduct.category?._id ?? initialProduct.category ?? "",
    });
  }, [initialProduct, isEdit, reset]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesError("");
        const res = await fetchStoreTaxonomy(token);
        if (!res?.success) {
          throw new Error(res?.message || "Failed to load categories");
        }
        setCategoryTree(res.data?.categories || []);
      } catch (e) {
        console.error("Error fetching categories:", e);
        setCategoriesError(
          e.response?.data?.message ||
            e.message ||
            "Could not load categories. You may not have e-commerce access."
        );
        setCategoryTree([]);
      }
    }

    if (token) {
      loadCategories();
    }
  }, [token]);

  /// Flat list of `{value,label}` options. Subcategories are prefixed with
  /// their parent name so vendors can clearly see hierarchy and ownership.
  const categoryOptions = useMemo(() => {
    const opts = [];
    for (const cat of categoryTree) {
      const ownLabel =
        cat.scope === "vendor" ? `${cat.name} (Yours)` : cat.name;
      opts.push({ value: String(cat._id), label: ownLabel });
      for (const sub of cat.subcategories || []) {
        const suffix = sub.scope === "vendor" ? " (Yours)" : "";
        opts.push({
          value: String(sub._id),
          label: `${cat.name} › ${sub.name}${suffix}`,
        });
      }
    }
    return opts;
  }, [categoryTree]);

  /// Validate that a chosen category id still exists in the tree before submit.
  const flatCategoryIds = useMemo(() => {
    const ids = new Set();
    for (const cat of categoryTree) {
      ids.add(String(cat._id));
      for (const sub of cat.subcategories || []) {
        ids.add(String(sub._id));
      }
    }
    return ids;
  }, [categoryTree]);

  const onSubmit = async (data) => {
    let hasError = false;

    if (!isEdit) {
      if (!thumbnail) {
        setThumbnailError("Thumbnail is required.");
        hasError = true;
      }
      if (mediaFiles.length === 0) {
        setMediaError("Please select at least one product image.");
        hasError = true;
      }
    }

    if (hasError) return;

    const categoryId = String(data.category || "").trim();
    if (!categoryId || !flatCategoryIds.has(categoryId)) {
      toast.error("Please select a valid category.");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("stock", data.stock);
    formData.append("category", categoryId);
    if (thumbnail) formData.append("image", thumbnail);
    mediaFiles.forEach((file) => formData.append("media", file));

    const toastId = toast.loading(isEdit ? "Saving changes…" : "Adding product...");
    try {
      const response = isEdit
        ? await updateProduct(token, productId, formData, setErr)
        : await createProduct(token, formData, setErr);

      toast.dismiss(toastId);

      if (isEdit) {
        if (response?.success) {
          setThumbnail(null);
          setMediaFiles([]);
          setThumbnailError("");
          setMediaError("");
          onSuccess?.();
        } else {
          toast.error("Failed to update product");
        }
      } else if (response) {
        reset();
        setThumbnail(null);
        setMediaFiles([]);
        onSuccess?.();
      } else {
        toast.error("Failed to add product");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error saving product:", error);
      toast.error(
        isEdit
          ? "Something went wrong while updating the product"
          : "Something went wrong while adding product"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-sm rounded-lg p-6 space-y-5"
      encType="multipart/form-data"
    >
      <FormErrorAlert
        message={err}
        onClose={() => setErr(null)} // optional close button
      />

      <FormInput
        label="Product Title"
        name="title"
        placeholder="Enter product title"
        register={register}
        rules={{ required: "Title is required" }}
        errors={errors}
      />

      <FormInput
        label="Description"
        name="description"
        placeholder="Enter product description"
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
        placeholder="Enter price"
        register={register}
        rules={{
          required: "Price is required",
          min: { value: 1, message: "Price must be greater than 0" },
        }}
        errors={errors}
      />

      <FormInput
        label="Stock"
        name="stock"
        type="number"
        min="0"
        placeholder="Enter stock quantity"
        register={register}
        rules={{
          required: "Stock is required",
          min: { value: 0, message: "Stock cannot be negative" },
        }}
        errors={errors}
      />

      <FormSelectInput
        label="Category"
        name="category"
        options={categoryOptions}
        register={register}
        rules={{ required: "Please select a category" }}
        errors={errors}
      />
      {categoriesError && (
        <p className="-mt-3 mb-2 text-xs text-red-500">{categoriesError}</p>
      )}
      {!categoriesError && categoryOptions.length === 0 && (
        <p className="-mt-3 mb-2 text-xs text-gray-500">
          No categories yet. Add categories from Boutique → Categories.
        </p>
      )}

      {isEdit &&
        initialProduct &&
        (initialProduct.thumbnail ||
          (initialProduct.images && initialProduct.images.length > 0)) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Current images (live on your boutique)
            </h3>
            {initialProduct.thumbnail && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Thumbnail</p>
                <div className="relative w-44 h-44 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <img
                    src={initialProduct.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {thumbnail && (
                  <p className="text-xs text-amber-800 mt-2">
                    You selected a new thumbnail below — it will replace this one when
                    you save.
                  </p>
                )}
              </div>
            )}
            {initialProduct.images && initialProduct.images.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Gallery ({initialProduct.images.length}{" "}
                  {initialProduct.images.length === 1 ? "image" : "images"})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {initialProduct.images.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {mediaFiles.length > 0 && (
                  <p className="text-xs text-amber-800 mt-2">
                    You selected new gallery files below — saving will replace all of
                    the images above.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      {/* Thumbnail Upload */}
      <div>
        <ThumbnailUpload
          label={isEdit ? "Replace thumbnail (optional)" : "Thumbnail (Main Image)"}
          onChange={(file) => {
            setThumbnail(file);
            setThumbnailError("");
          }}
        />
        {isEdit && initialProduct?.thumbnail && !thumbnail && (
          <p className="text-xs text-gray-500 mt-2">
            Leave empty to keep the current thumbnail shown above.
          </p>
        )}
        {thumbnailError && (
          <p className="text-sm text-red-500 mt-1">{thumbnailError}</p>
        )}
      </div>

      {/* Media Upload */}
      <div>
        <ImageUpload
          label={isEdit ? "Replace gallery (optional — replaces all when saved)" : "Media"}
          onChange={(files) => {
            setMediaFiles(files);
            setMediaError("");
          }}
        />
        {isEdit &&
          initialProduct?.images?.length > 0 &&
          mediaFiles.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to keep the current gallery shown above.
            </p>
          )}
        {mediaError && (
          <p className="text-sm text-red-500 mt-1">{mediaError}</p>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting
            ? isEdit
              ? "Saving…"
              : "Adding..."
            : isEdit
              ? "Save changes"
              : "Add Product"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;