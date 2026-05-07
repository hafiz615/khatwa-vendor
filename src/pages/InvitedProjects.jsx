import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FolderOpen, Loader2, ClipboardList } from "lucide-react";
import {
  fetchProjects,
  // respondToInvitation,
} from "../services/project.service";
import InvitedProjectCard from "../components/project/InvitedProjectCard";

function InvitedProjects() {
  const token = useSelector((state) => state.auth.token);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch projects when page changes
  useEffect(() => {
    async function getProjects() {
      try {
        setLoading(true);
        const res = await fetchProjects(token, "invited", pagination.page, 10);
        if (res.data.success) {
          setProjects(res.data.projects || []);
          setPagination(
            res.data.pagination || { page: 1, totalPages: 1, total: 0 }
          );
        } else {
          console.error(res.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) getProjects();
  }, [token, pagination.page]);

  // Handle Pagination Navigation
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FolderOpen className="text-blue-600" size={22} />
          Invited Projects
        </h1>

        <div className="grid gap-5">
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="loader" />
            </div>
          ) : projects && !projects.length ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500">
              <ClipboardList size={40} className="mb-2 text-gray-400" />
              <p>No invitations yet.</p>
            </div>
          ) : (
            projects.map((project) => (
              <InvitedProjectCard
                key={project._id}
                project={project}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page <strong>{pagination.page}</strong> of {pagination.totalPages}
            </span>

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvitedProjects;