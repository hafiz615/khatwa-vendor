"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Users,
  FileSignature,
  Loader2,
  User,
} from "lucide-react";
import Button from "../components/common/Button";
import { fetchProjectDetails } from "../services/project.service";
import ProjectHero from "../components/project/ProjectHero";
import ProjectUserInfo from "../components/project/ProjectUserInfo";

function ProjectDetailPage() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log("Project ID from params:", project);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetchProjectDetails(token, projectId);
        if (res.success) setProject(res.project);
        else setError("Project not found");
      } catch {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const contact = async (projectId) => {};

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader" />
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-gray-700 text-lg mb-3">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium tracking-wide">
              Back to Projects
            </span>
          </button>

        </div>
        {/* Project Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <ProjectHero
            imageUrl={project.aiGeneratedDesignData?.url}
            title={project.projectName}
          />

          <div className="p-6 sm:p-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                  {project.projectName}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Created on{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <div className="text-right sm:text-left">
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="text-gray-900 font-medium text-base">
                  {new Date(project.deliveryTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* User Info */}
            {project.userId && (
              <ProjectUserInfo
                name={project.userId.name}
                profile={project.userId.profile}
                userId={project.userId._id}
              />
            )}

            {/* Description */}
            <div>
              <h2 className="flex items-center gap-2 text-gray-800 text-lg font-medium mb-3">
                <FileText size={18} />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed p-2 rounded-lg">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Info Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <InfoBlock
                icon={<Briefcase size={18} />}
                label="Service Type"
                value={project.designService}
              />
              <InfoBlock label="KWD Budget" value={project.budget} />
              <InfoBlock
                icon={<Users size={18} />}
                label="Invitations"
                value={project.invitationsCount || 0}
              />
              <InfoBlock
                icon={<FileSignature size={18} />}
                label="Proposals"
                value={project.proposalsCount || 0}
              />
            </div>

            {/* Actions */}
            {project.isCurrentUserHired && (
              <div className="flex gap-3">
                <Button
                  onClick={() => onContact(project._id)}
                  // disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Contact Client
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoBlock = ({ icon, label, value, className }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`text-gray-900 font-medium text-base ${className}`}>
      {value}
    </p>
  </div>
);

export default ProjectDetailPage;