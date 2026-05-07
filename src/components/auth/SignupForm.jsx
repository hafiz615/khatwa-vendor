import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../common/FormInput";
import FormSelectInput from "../common/FormSelectInput";
import ProfileImagePicker from "../ProfileImagePicker";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP } from "../../services/auth.service";
import { setSignupData } from "../../slices/auth";
import FilePicker from "../common/FilePicker";
import apiConnector from "../../services/apiConnector";
import { businessTypeEndpoints } from "../../services/api";
const DEFAULT_BUSINESS_TYPE_OPTIONS = ["Designer", "Architect", "Contractor"];

const areaList = [
  "Kuwait City",
  "Hawalli",
  "Salmiya",
  "Farwaniya",
  "Jahra",
  "Mubarak Al-Kabeer",
  "Ahmadi",
];
function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(null); // local state for image
  const [businessTypeOptionGroups, setBusinessTypeOptionGroups] = useState(null);
  const [businessTypeFlatFallback, setBusinessTypeFlatFallback] = useState([]);
  const loading = useSelector((state) => state.auth.loading);
  const [civilIdFile, setCivilIdFile] = useState(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
  const [commercialLicenseFile, setCommercialLicenseFile] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const loadBusinessTypes = async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          businessTypeEndpoints.GET_PUBLIC_BUSINESS_TYPES_API
        );
        if (data?.success) {
          const rows = (data.businessTypes || []).filter((bt) => bt.isActive !== false);
          const byCat = new Map();
          const uncategorized = [];
          for (const bt of rows) {
            const title = (bt.titleEn || bt.titleAr || "").trim();
            if (!title) continue;
            const cat = bt.category;
            const catActive = cat == null || cat.isActive !== false;
            if (cat && catActive) {
              const catLabel = (cat.titleEn || cat.titleAr || "Other").trim();
              if (!byCat.has(catLabel)) byCat.set(catLabel, []);
              byCat.get(catLabel).push(title);
            } else {
              uncategorized.push(title);
            }
          }
          const groups = Array.from(byCat.entries()).map(([label, opts]) => ({
            label,
            options: opts,
          }));
          if (uncategorized.length > 0) {
            groups.push({ label: "Other", options: uncategorized });
          }
          setBusinessTypeOptionGroups(groups.length > 0 ? groups : null);
          setBusinessTypeFlatFallback([]);
        }
      } catch (error) {
        console.error("Failed to load business types:", error);
        setBusinessTypeOptionGroups(null);
        setBusinessTypeFlatFallback(DEFAULT_BUSINESS_TYPE_OPTIONS);
      }
    };

    loadBusinessTypes();
  }, []);

  const onSubmit = (data) => {
    // Create FormData for file uploads
    const formData = new FormData();

    // Append all form fields
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("businessType", data.businessType);
    formData.append("block", data.block);
    formData.append("street", data.street);
    formData.append("house", data.house);
    if (data.floor) formData.append("floor", data.floor);
    if (data.avenue) formData.append("avenue", data.avenue);
    if (data.apartment) formData.append("apartment", data.apartment);
    formData.append("area", data.area);
    formData.append("civilId", data.civilId);
    formData.append("businessLicense", data.businessLicense);
    formData.append("commercialLicense", data.commercialLicense);
    formData.append("password", data.password);
    formData.append("role", "designer");
    formData.append("countryCode", "+965");

    // Append files
    if (profile) formData.append("profile", profile);
    if (civilIdFile) formData.append("civilIdDoc", civilIdFile);
    if (businessLicenseFile) formData.append("businessLicenseDoc", businessLicenseFile);
    if (commercialLicenseFile) formData.append("commercialLicenseDoc", commercialLicenseFile);

    // Dispatch serializable data to Redux (for later use in OTP verification)
    const serializableData = {
      ...data,
      role: "designer",
      countryCode: "+965",
    };
    dispatch(setSignupData(serializableData));

    // Send OTP with all data including files
    dispatch(sendOTP(formData, navigate, { profile, civilIdFile, businessLicenseFile, commercialLicenseFile }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-8">SIGN UP</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Icon */}
          <ProfileImagePicker onFileSelect={setProfile} />

          {/* Signup Form */}
          {/* Business Name */}
          <FormInput
            label="Name"
            id="name"
            name="name"
            placeholder="Enter business name"
            prefix="01"
            register={register}
            rules={{
              required: "Business name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            }}
            errors={errors}
          />

          {/* Business Email */}
          <FormInput
            label="Business Email"
            id="email"
            name="email"
            type="email"
            placeholder="Enter business email"
            prefix="02"
            register={register}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            errors={errors}
          />

          {/* Phone Number with prefix */}
          <FormInput
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            placeholder="97540050"
            prefix="03"
            maxLength={8}
            register={register}
            rules={{
              required: "Phone number is required",
              pattern: {
                value: /^\d{8}$/,
                message: "Phone number must be 8 digits",
              },
            }}
            onInput={(e) =>
              (e.target.value = e.target.value.replace(/\D/g, ""))
            }
            errors={errors}
          />

          {/* Business Type Dropdown */}
          <FormSelectInput
            label="Business Type"
            id="businessType"
            name="businessType"
            placeholder="Select business type"
            prefix="04"
            options={
              businessTypeOptionGroups ? [] : businessTypeFlatFallback
            }
            optionGroups={businessTypeOptionGroups}
            register={register}
            rules={{ required: "Please select a business type" }}
            errors={errors}
          />

          {/* Address Inputs */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Business Address
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <FormInput
                id="block"
                name="block"
                placeholder="Block"
                register={register}
                rules={{ required: "Block is required" }}
                errors={errors}
              />
              <FormInput
                id="street"
                name="street"
                placeholder="Street"
                register={register}
                rules={{ required: "Street is required" }}
                errors={errors}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <FormInput
                id="house"
                name="house"
                placeholder="House"
                register={register}
                rules={{ required: "House is required" }}
                errors={errors}
              />
              <FormInput
                id="floor"
                name="floor"
                placeholder="Floor"
                register={register}
                errors={errors}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <FormInput
                id="avenue"
                name="avenue"
                placeholder="Avenue"
                register={register}
                errors={errors}
              />
              <FormInput
                id="apartment"
                name="apartment"
                placeholder="Apartment"
                register={register}
                errors={errors}
              />
            </div>

            {/* Area Dropdown */}
            <FormSelectInput
              label="Area"
              id="area"
              name="area"
              placeholder="Select area"
              prefix={"05"}
              options={areaList}
              register={register}
              rules={{ required: "Please select area" }}
              errors={errors}
            />
          </div>

          {/* Civil ID */}
          <FormInput label="Civil ID" id="civilId" name="civilId" placeholder="Enter civil ID no" prefix="06" register={register} rules={{ required: "Civil ID is required" }} errors={errors} />
          <FilePicker label="Upload Civil ID (PDF)" onFileSelect={setCivilIdFile} accept=".pdf" required />

          {/* Business License */}
          <FormInput label="Business License" id="businessLicense" name="businessLicense" placeholder="Enter business license no" prefix="06" register={register} rules={{ required: "Business License is required" }} errors={errors} />
          <FilePicker label="Upload Business License (PDF)" onFileSelect={setBusinessLicenseFile} accept=".pdf" required />

          {/* Commercial License */}
          <FormInput label="Commercial License" id="commercialLicense" name="commercialLicense" placeholder="Enter Commercial license no" prefix="06" register={register} rules={{ required: "Commercial License is required" }} errors={errors} />
          <FilePicker label="Upload Commercial License (PDF)" onFileSelect={setCommercialLicenseFile} accept=".pdf" required />

          {/* Password */}
          <FormInput
            label="Password"
            id="password"
            name="password"
            placeholder="Enter password"
            prefix={"06"}
            type={showPassword ? "text" : "password"}
            register={register}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                message:
                  "Password must be 8+ chars, include uppercase, lowercase, number & special character",
              },
            }}
            rightIcon={
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </span>
            }
            errors={errors}
          />

          {/* Sign Up Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {loading ? "Loading..." : "SIGN UP"}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By signing up you agree to our{" "}
            <Link to="/terms" className="text-blue-600">
              Terms
            </Link>
            ,{" "}
            <Link to="/privacy" className="text-blue-600">
              Data Policy
            </Link>{" "}
            and{" "}
            <Link to="/cookies" className="text-blue-600">
              Cookies Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
