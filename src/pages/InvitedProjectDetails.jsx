import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ImageIcon,
  Clock3,
  Loader2,
  Plus,
  Trash2,
  User2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchInvitationDetails,
  fetchProjectMilestones,
  respondToInvitation,
  saveProjectMilestonePlan,
  submitProjectMilestone,
  submitProjectMilestonePlan,
} from "../services/project.service";

const emptyMilestone = () => ({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
});

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatStatusLabel = (value, fallback = "Not started") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  return raw
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDisplayValue = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return String(value ?? "").trim();
};

export default function InvitedProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const [project, setProject] = useState(null);
  const [milestoneMeta, setMilestoneMeta] = useState(null);
  const [milestones, setMilestones] = useState([emptyMilestone()]);
  const [totalPrice, setTotalPrice] = useState("");
  const [proofFiles, setProofFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const canManageMilestones = useMemo(
    () => Boolean(project?.isCurrentUserHired || project?.invitationStatus === "accepted"),
    [project?.invitationStatus, project?.isCurrentUserHired]
  );

  const loadData = useCallback(async () => {
    if (!token || !projectId) return;
    setLoading(true);
    setError("");
    try {
      const [detailRes, milestoneRes] = await Promise.all([
        fetchInvitationDetails(token, projectId),
        fetchProjectMilestones(token, projectId),
      ]);
      setProject(detailRes.project || null);
      setMilestoneMeta(milestoneRes || null);
      setTotalPrice(
        milestoneRes?.totalPrice ||
          detailRes?.project?.milestonePlanTotalPrice ||
          ""
      );

      const apiMilestones = milestoneRes?.milestones || detailRes.project?.milestones || [];
      if (Array.isArray(apiMilestones) && apiMilestones.length > 0) {
        setMilestones(
          apiMilestones.map((item) => ({
            _id: item._id,
            title: item.title || "",
            description: item.description || "",
            startDate: formatDateInput(item.startDate),
            endDate: formatDateInput(item.endDate),
            status: item.status || "pending",
            proofImages: item.proofImages || [],
            proofVideos: item.proofVideos || [],
            reviewMessage: item.reviewMessage || "",
            sequenceNumber: item.sequenceNumber,
          }))
        );
      } else {
        setMilestones([emptyMilestone()]);
      }
    } catch (err) {
      const message = err.message || "Failed to load invitation details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canEditPlan = useMemo(() => {
    if (!canManageMilestones) return false;
    const status = milestoneMeta?.milestonePlanStatus || project?.milestonePlanStatus;
    return status === "draft" || status === "in_review" || status === "not_started";
  }, [
    canManageMilestones,
    milestoneMeta?.milestonePlanStatus,
    project?.milestonePlanStatus,
  ]);

  const canSubmitPlan = useMemo(() => {
    const status = milestoneMeta?.milestonePlanStatus || project?.milestonePlanStatus;
    return canEditPlan && status !== "approved";
  }, [canEditPlan, milestoneMeta?.milestonePlanStatus, project?.milestonePlanStatus]);

  const workflowStatus = milestoneMeta?.workflowStatus || project?.workflowStatus;
  const milestonePlanStatus =
    milestoneMeta?.milestonePlanStatus || project?.milestonePlanStatus;
  const stageOneItems = [
    { label: "Design service", value: project?.designService },
    { label: "Project classification", value: project?.projectClassification },
    { label: "Design style", value: project?.designStyle || project?.style },
    { label: "Business category", value: project?.businessCategory },
  ].filter((item) => getDisplayValue(item.value));

  const stageTwoItems = (project?.extraFields || [])
    .map((field) => ({
      label: field.fieldLabel || "Field",
      value: field.value,
    }))
    .filter((item) => getDisplayValue(item.value));

  const updateMilestoneField = (index, field, value) => {
    setMilestones((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addMilestone = () => {
    setMilestones((prev) => [...prev, emptyMilestone()]);
  };

  const removeMilestone = (index) => {
    setMilestones((prev) =>
      prev.length === 1 ? [emptyMilestone()] : prev.filter((_, idx) => idx !== index)
    );
  };

  const handleInvitationAction = async (action) => {
    try {
      setActionLoading(action);
      await respondToInvitation(token, projectId, action);
      toast.success(
        action === "accept" ? "Invitation accepted." : "Invitation declined."
      );
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update invitation.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSavePlan = async () => {
    if (!String(totalPrice || "").trim()) {
      toast.error("Please enter the total price before saving.");
      return;
    }
    try {
      setSavingPlan(true);
      await saveProjectMilestonePlan(
        token,
        projectId,
        milestones.map((item) => ({
          title: item.title,
          description: item.description,
          startDate: item.startDate,
          endDate: item.endDate,
        })),
        totalPrice
      );
      toast.success("Milestone plan saved.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to save milestone plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSubmitPlan = async () => {
    if (!String(totalPrice || "").trim()) {
      toast.error("Please enter the total price before submitting.");
      return;
    }
    try {
      setSubmittingPlan(true);
      await submitProjectMilestonePlan(token, projectId);
      toast.success("Milestone plan submitted for review.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to submit milestone plan.");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleProofSelection = (milestoneId, type, files) => {
    setProofFiles((prev) => ({
      ...prev,
      [milestoneId]: {
        ...(prev[milestoneId] || {}),
        [type]: Array.from(files || []),
      },
    }));
  };

  const handleSubmitProof = async (milestoneId) => {
    const files = proofFiles[milestoneId] || {};
    const images = files.images || [];
    const videos = files.videos || [];

    if (!images.length || !videos.length) {
      toast.error("Please upload at least 1 image and 1 video.");
      return;
    }

    try {
      setActionLoading(`proof-${milestoneId}`);
      const formData = new FormData();
      images.forEach((file) => formData.append("images", file));
      videos.forEach((file) => formData.append("videos", file));
      await submitProjectMilestone(token, projectId, milestoneId, formData);
      toast.success("Milestone submitted for review.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to submit milestone proof.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-gray-700 text-lg mb-3">{error || "Project not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          Back
        </button>
      </div>
    );
  }

  const client = project.userId;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium tracking-wide">Back to Invitations</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {project.aiGeneratedDesignData?.url ? (
            <img
              src={project.aiGeneratedDesignData.url}
              alt={project.projectName}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100" />
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {project.projectName}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {project.designService} • Budget: {project.budget}
                </p>
                <p className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                  <CalendarDays className="w-4 h-4 text-green-500" />
                  Delivery: {new Date(project.deliveryTime).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  Invite: {formatStatusLabel(project.invitationStatus, "Pending")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  Workflow: {formatStatusLabel(workflowStatus, "Open")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  Milestones: {formatStatusLabel(milestonePlanStatus, "Not started")}
                </span>
              </div>
            </div>

            {client && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <img
                  src={client.profile}
                  alt={client.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User2 className="w-4 h-4 text-blue-500" />
                    {client.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Stage 1
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Design Style
                    </h2>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {stageOneItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-800 break-words">
                        {getDisplayValue(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Stage 2
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Project Data
                    </h2>
                  </div>
                </div>
                {stageTwoItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {stageTwoItems.map((item) => (
                      <div
                        key={`${item.label}-${getDisplayValue(item.value)}`}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                          {getDisplayValue(item.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    No stage 2 extra fields were stored on this project.
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Stage 3
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Generate
                    </h2>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                  {project.aiGeneratedDesignData?.url ? (
                    <div className="space-y-4">
                      <img
                        src={project.aiGeneratedDesignData.url}
                        alt="Selected generated design"
                        className="w-full max-h-[360px] rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          Selected generated design
                        </p>
                        <p className="text-sm text-gray-800 leading-7 whitespace-pre-wrap">
                          {project.aiGeneratedDesignData.description ||
                            "No generated description was stored for this project."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ImageIcon className="w-4 h-4" />
                      No generated design is stored on this project.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {project.invitationStatus === "pending" && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleInvitationAction("accept")}
                  disabled={actionLoading === "accept"}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === "accept" ? "Accepting..." : "Accept Invitation"}
                </button>
                <button
                  type="button"
                  onClick={() => handleInvitationAction("reject")}
                  disabled={actionLoading === "reject"}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === "reject" ? "Declining..." : "Decline"}
                </button>
              </div>
            )}

            {project.invitationStatus === "accepted" && !project.isCurrentUserHired && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-3">
                <Clock3 className="w-5 h-5 mt-0.5" />
                <p>
                  Invitation accepted. You can now create and submit milestones for review.
                </p>
              </div>
            )}
          </div>
        </div>

        {canManageMilestones && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Milestones
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create the milestone plan, submit it for approval, then send
                  proof for each completed milestone.
                </p>
              </div>
              {canEditPlan && (
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add milestone
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm">
                <span className="text-gray-700">Total price</span>
                <input
                  type="text"
                  disabled={!canEditPlan}
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="Enter total project price"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                />
              </label>
            </div>

            {milestones.map((milestone, index) => {
              const isSubmitted = Boolean(milestone._id);
              const canSubmitProof =
                workflowStatus === "development" &&
                milestone.status === "in_progress" &&
                isSubmitted;

              return (
                <div
                  key={milestone._id || `draft-${index}`}
                  className="rounded-xl border border-gray-100 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Milestone {index + 1}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {milestone.status
                          ? milestone.status.replaceAll("_", " ")
                          : "draft"}
                      </p>
                    </div>
                    {canEditPlan && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2 text-sm">
                      <span className="text-gray-700">Title</span>
                      <input
                        type="text"
                        disabled={!canEditPlan}
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestoneField(index, "title", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-gray-700">Description</span>
                      <textarea
                        disabled={!canEditPlan}
                        value={milestone.description}
                        onChange={(e) =>
                          updateMilestoneField(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-gray-700">Start date</span>
                      <input
                        type="date"
                        disabled={!canEditPlan}
                        value={milestone.startDate || ""}
                        onChange={(e) =>
                          updateMilestoneField(index, "startDate", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-gray-700">End date</span>
                      <input
                        type="date"
                        disabled={!canEditPlan}
                        value={milestone.endDate || ""}
                        onChange={(e) =>
                          updateMilestoneField(index, "endDate", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                      />
                    </label>
                  </div>

                  {milestone.reviewMessage && (
                    <p className="text-sm text-amber-700">{milestone.reviewMessage}</p>
                  )}

                  {(milestone.proofImages?.length > 0 || milestone.proofVideos?.length > 0) && (
                    <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
                      Proof uploaded: {milestone.proofImages?.length || 0} images,{" "}
                      {milestone.proofVideos?.length || 0} videos
                    </div>
                  )}

                  {canSubmitProof && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                        <CheckCircle2 className="w-4 h-4" />
                        Submit milestone proof
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className="space-y-2 text-sm">
                          <span className="text-gray-700">Images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleProofSelection(
                                milestone._id,
                                "images",
                                e.target.files
                              )
                            }
                            className="block w-full text-sm"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="text-gray-700">Videos</span>
                          <input
                            type="file"
                            accept="video/mp4"
                            multiple
                            onChange={(e) =>
                              handleProofSelection(
                                milestone._id,
                                "videos",
                                e.target.files
                              )
                            }
                            className="block w-full text-sm"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSubmitProof(milestone._id)}
                        disabled={actionLoading === `proof-${milestone._id}`}
                        className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {actionLoading === `proof-${milestone._id}`
                          ? "Submitting..."
                          : "Submit milestone for review"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {canEditPlan && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {savingPlan ? "Saving..." : "Save milestone plan"}
                </button>
                {canSubmitPlan && (
                  <button
                    type="button"
                    onClick={handleSubmitPlan}
                    disabled={submittingPlan}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingPlan ? "Submitting..." : "Submit plan for review"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
