import { useState } from "react";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import apiConnector from "../../services/apiConnector";
import { projectEndpoints } from "../../services/api";

const PROJECT_SHARE_PREFIX = "I've shared a project with you:";

function extractProjectName(content) {
  if (!content?.startsWith(PROJECT_SHARE_PREFIX)) return null;
  const afterPrefix = content.slice(PROJECT_SHARE_PREFIX.length).trim();
  const dotIdx = afterPrefix.indexOf(".");
  return dotIdx === -1 ? afterPrefix : afterPrefix.slice(0, dotIdx).trim();
}

function extractProjectId(content) {
  const match = String(content || "").match(/\[projectId:([a-fA-F0-9]{24})\]/);
  return match?.[1] || null;
}

function ProjectShareCard({ msg, isMe, isSameSender }) {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [resolving, setResolving] = useState(false);
  const projectName = extractProjectName(msg.content);
  const projectIdFromMessage = extractProjectId(msg.content);

  const handleViewProject = async () => {
    if (resolving) return;
    if (projectIdFromMessage) {
      navigate(`/dashboard/invitations/${projectIdFromMessage}`);
      return;
    }

    if (!token || !projectName) {
      navigate("/dashboard/invitations");
      return;
    }

    try {
      setResolving(true);
      const { data } = await apiConnector(
        "GET",
        projectEndpoints.GET_INVITED_PROJECTS_API,
        null,
        { Authorization: `Bearer ${token}` },
        { page: 1, limit: 100 }
      );

      const normalizedTarget = projectName.trim().toLowerCase();
      const projects = Array.isArray(data?.projects) ? data.projects : [];
      const matched = projects.find(
        (project) =>
          String(project?.projectName || "").trim().toLowerCase() === normalizedTarget
      );

      if (matched?._id) {
        navigate(`/dashboard/invitations/${matched._id}`);
        return;
      }

      navigate("/dashboard/invitations");
      toast("Project details not found. Opened Invitations list instead.");
    } catch (error) {
      navigate("/dashboard/invitations");
      toast.error("Failed to open invitation details.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}
    >
      <div className={`flex flex-col gap-1.5 max-w-[75%] ${!isSameSender ? "mt-3" : "mt-1"}`}>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 shadow-md p-3 flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center gap-2 text-blue-700">
            <FolderOpen className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Project Invitation</span>
          </div>
          {projectName && (
            <p className="text-sm text-slate-700 font-medium break-words">
              {projectName}
            </p>
          )}
          {!isMe && (
            <button
              onClick={handleViewProject}
              disabled={resolving}
              className="self-start text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-lg"
            >
              {resolving ? "Opening..." : "View in Invitations →"}
            </button>
          )}
          <div className={`flex items-center justify-end gap-1.5 text-[10px] font-medium ${isMe ? "text-slate-400" : "text-slate-400"}`}>
            <span>
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isMe && (
              <>
                {msg.status === "sent" && <IoCheckmarkSharp />}
                {msg.status === "delivered" && <IoCheckmarkDoneSharp />}
                {msg.status === "read" && <IoCheckmarkDoneSharp className="text-blue-500" />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Conversation({msg, isSameSender,hasText, isMe, hasImages}) {
  const isProjectShare =
    !isMe && msg.content?.startsWith(PROJECT_SHARE_PREFIX);
  if (isProjectShare) {
    return <ProjectShareCard msg={msg} isMe={isMe} isSameSender={isSameSender} />;
  }
   return (
              <div
                key={msg._id || i}
                className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}
              >
                <div className={`flex flex-col gap-1.5 max-w-[75%] ${!isSameSender ? "mt-3" : "mt-1"}`}>
                  <div
                    className={`flex flex-col overflow-hidden transition-all hover:scale-[1.01] ${
                      hasText
                        ? isMe
                          ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-br-md shadow-md shadow-emerald-200/50"
                          : "bg-white text-slate-800 rounded-2xl rounded-bl-md shadow-md border border-slate-100"
                        : ""
                    }`}
                  >
                    {hasImages && (
                      <div className={`relative ${hasText ? '' : 'rounded-xl overflow-hidden'}`}>
                        <div className={`grid gap-2 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${hasText ? 'px-02' : ''}`}>
                          {msg.images.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`msg-${index}`}
                              className={`w-full h-36 object-cover shadow-lg hover:scale-105 transition-transform cursor-pointer ${hasText ? 'rounded-lg' : index === msg.images.length - 1 && msg.images.length % 2 === 1 ? 'rounded-xl' : 'rounded-lg'}`}
                            />
                          ))}
                        </div>

                        {!hasText && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-medium text-white shadow-lg">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <>
                                {msg.status === "sent" && <IoCheckmarkSharp className="text-white" />}
                                {msg.status === "delivered" && <IoCheckmarkDoneSharp className="text-white" />}
                                {msg.status === "read" && (
                                  <IoCheckmarkDoneSharp className="text-blue-400" />
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {hasText && (
                      <div className="flex flex-col gap-1.5 px-2 pt-1 pb-0.5">
                        <p className="break-words text-sm leading-relaxed">{msg.content}</p>

                        <div className={`flex items-center justify-end gap-1.5 mt-0.5 text-[10px] font-medium ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && (
                            <>
                              {msg.status === "sent" && <IoCheckmarkSharp className="text-emerald-200" />}
                              {msg.status === "delivered" && <IoCheckmarkDoneSharp className="text-emerald-200" />}
                              {msg.status === "read" && (
                                <IoCheckmarkDoneSharp className="text-blue-300" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
}

export default Conversation;
