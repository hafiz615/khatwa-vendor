import { useEffect, useRef, useState } from "react";
import { CalendarDays, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function InvitedProjectCard({ project}) {
  const navigate = useNavigate();
  const client = project?.userId;
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descRef = useRef(null);

  const toggleExpand = () => setExpanded((prev) => !prev);

  // Detect if text is truncated
  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [project.description]);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {project.projectName}
          </h2>
          <p className="text-sm text-gray-500">
            {project.designService} • Budget: {project.budget}
          </p>
          <p className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <CalendarDays className="w-4 h-4 text-green-500" />
            Delivery: {new Date(project.deliveryTime).toLocaleDateString()}
          </p>
        </div>

        {client && (
          <div className="flex items-center gap-3 mt-3 sm:mt-0 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <img
              src={client.profile}
              alt={client.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <User2 className="w-4 h-4 text-blue-500" />
              {client.name}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p
          ref={descRef}
          className={`text-sm text-gray-700 transition-all duration-300 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {project.description}
        </p>

        {isTruncated && (
          <button
            onClick={toggleExpand}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
          {String(project?.invitationStatus || "pending").replace("_", " ")}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/invitations/${project._id}`)}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          View details
        </button>
      </div>
    </div>
  );
}

export default InvitedProjectCard;