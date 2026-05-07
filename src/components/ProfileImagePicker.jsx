// ProfileImagePicker.jsx
import { useRef, useState } from "react";
import { Building2, Pencil } from "lucide-react";

function ProfileImagePicker({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file); // send file to parent
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-10 h-10 text-gray-400" />
          )}
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 hover:bg-gray-50 transition"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default ProfileImagePicker;