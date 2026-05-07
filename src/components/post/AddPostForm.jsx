import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import FormInput from "../common/FormInput";
import FormSelectInput from "../common/FormSelectInput";
import FormErrorAlert from "../common/FormErrorAlert";
import MediaUpload from "../common/MediaUpload";
import VideoUpload from "../common/VideoUpload";
import { postCategoriesEndpoints } from "../../services/api";
import { createPost } from "../../services/post.service";
import { useNavigate } from "react-router-dom";

const POST_TYPES = ["Post", "Reel"];
const LAYOUTS = ["standard", "triple"];

const LAYOUT_LABELS = {
  standard: "Single Carousel",
  triple: "3-Container Mosaic",
};

function AddPostForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [postType, setPostType] = useState("Post");
  const [layout, setLayout] = useState("standard");
  const [err, setErr] = useState(null);

  // Standard layout media
  const [standardMedia, setStandardMedia] = useState([]);

  // Triple layout – one array per container
  const [container1, setContainer1] = useState([]);
  const [container2, setContainer2] = useState([]);
  const [container3, setContainer3] = useState([]);

  // Reel
  const [video, setVideo] = useState(null);

  const [resetKey, setResetKey] = useState(0);

  const token = useSelector((state) => state.auth.token);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get(postCategoriesEndpoints.GET_POST_CAT_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    if (token) fetchCategories();
  }, [token]);

  const resetAllMedia = () => {
    setStandardMedia([]);
    setContainer1([]);
    setContainer2([]);
    setContainer3([]);
    setVideo(null);
    setResetKey((k) => k + 1);
  };

  const onSubmit = async (data) => {
    setErr(null);

    if (postType === "Reel" && !video) {
      return setErr("Please upload a video for the reel.");
    }
    if (postType === "Post" && layout === "standard" && standardMedia.length === 0) {
      return setErr("Please upload at least one image or video.");
    }
    if (postType === "Post" && layout === "triple") {
      if (container1.length === 0) return setErr("Container 1 needs at least one file.");
      if (container2.length === 0) return setErr("Container 2 needs at least one file.");
      if (container3.length === 0) return setErr("Container 3 needs at least one file.");
    }

    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("category", categories.find((c) => c.name === data.category)?._id || "");
    formData.append("postType", postType);
    data.hashtags
      ?.split(/[,\s]+/)
      .filter(Boolean)
      .forEach((tag) => formData.append("hashtags[]", tag.startsWith("#") ? tag : `#${tag}`));

    if (postType === "Reel") {
      formData.append("media", video);
    } else if (layout === "standard") {
      formData.append("layout", "standard");
      standardMedia.forEach((file) => formData.append("media", file));
    } else if (layout === "triple") {
      formData.append("layout", "triple");
      container1.forEach((file) => formData.append("container1", file));
      container2.forEach((file) => formData.append("container2", file));
      container3.forEach((file) => formData.append("container3", file));
    }

    try {
      const result = await createPost(token, formData, setErr);
      if (result) {
        toast.success(`${postType} created successfully!`);
        navigate("/dashboard/posts");
        reset();
        resetAllMedia();
      }
    } catch (error) {
      console.error("Error creating post", error);
      toast.error(`Failed to create ${postType.toLowerCase()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm space-y-5"
    >
      <h2 className="text-lg font-semibold mb-4">Create New Post</h2>

      {/* Post type toggle (Post / Reel) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Post Type</p>
        <div className="flex items-center gap-3">
          {POST_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setPostType(type); setErr(null); }}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
                postType === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Layout selector – only for Post type */}
      {postType === "Post" && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Layout</p>
          <div className="flex items-center gap-3">
            {LAYOUTS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setLayout(l); setErr(null); }}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
                  layout === l
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {LAYOUT_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Visual hint */}
          {layout === "triple" && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 flex items-start gap-2">
              <span className="text-lg leading-none">⬛</span>
              <div>
                <strong>3-Container Mosaic:</strong> Container 1 is displayed as a tall panel on the
                left; Containers 2 & 3 are stacked on the right. Each container supports multiple
                images or videos displayed as a swipeable carousel.
              </div>
            </div>
          )}
        </div>
      )}

      {err && <FormErrorAlert message={err} onClose={() => setErr(null)} />}

      <FormInput
        label="Description"
        name="description"
        placeholder="Write something..."
        register={register}
        errors={errors}
        rules={{ required: "Description is required" }}
      />

      <FormSelectInput
        label="Category"
        name="category"
        register={register}
        errors={errors}
        rules={{ required: "Please select a category" }}
        options={categories.map((c) => c.name)}
        placeholder="Select category"
      />

      <FormInput
        label="Hashtags"
        name="hashtags"
        placeholder="#modern #design"
        register={register}
        errors={errors}
      />

      {/* Media upload section */}
      {postType === "Reel" && (
        <VideoUpload
          key={`reel-${resetKey}`}
          label="Reel Video"
          onChange={setVideo}
          reset={resetKey > 0 && !video}
        />
      )}

      {postType === "Post" && layout === "standard" && (
        <MediaUpload
          key={`standard-${resetKey}`}
          label="Media (images and/or videos)"
          text="Click or drag images/videos to upload"
          onChange={setStandardMedia}
          reset={resetKey > 0 && standardMedia.length === 0}
        />
      )}

      {postType === "Post" && layout === "triple" && (
        <div className="space-y-4">
          {[
            { label: "Container 1 – Left panel", setter: setContainer1, key: `c1-${resetKey}`, files: container1 },
            { label: "Container 2 – Top right", setter: setContainer2, key: `c2-${resetKey}`, files: container2 },
            { label: "Container 3 – Bottom right", setter: setContainer3, key: `c3-${resetKey}`, files: container3 },
          ].map(({ label, setter, key, files }) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <MediaUpload
                label={label}
                text="Click or drag images/videos to upload"
                onChange={setter}
                reset={resetKey > 0 && files.length === 0}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
      >
        {isSubmitting ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}

export default AddPostForm;
