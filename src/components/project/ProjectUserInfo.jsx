import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProjectUserInfo({ name, profile, userId }) {
  const navigate = useNavigate();

  return (
    <div
    //   onClick={() => navigate(`/user/${userId}`)}
      className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition rounded-lg p-4 cursor-pointer border border-gray-200 w-fit"
    >
      {profile ? (
        <img
          src={profile}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="text-gray-500" />
        </div>
      )}

      <div>
        <p className="text-gray-900 font-medium text-base">{name}</p>
        <p className="text-sm text-gray-500">Project Owner</p>
      </div>
    </div>
  );
}

export default ProjectUserInfo;