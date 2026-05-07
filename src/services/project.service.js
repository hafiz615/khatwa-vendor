import { projectEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const fetchProjects = async (token, filter, page, limit) => {
  try {
    let url;
    if (filter === "all") {
      url = projectEndpoints.GET_ALL_PROJECTS_API;
    } else if (filter === "my") {
      url = projectEndpoints.GET_ASSIGNED_PROJECTS_API;
    } else if (filter === "invited") {
      url = projectEndpoints.GET_INVITED_PROJECTS_API;
    } else {
      throw new Error("Invalid filter type");
    }
    const response = await apiConnector("GET",url, null,
        { Authorization: `Bearer ${token}` },
        {
          page: page,
          limit: limit,
        },
      );
    console.log("API Response:", response);
    return response;
  } catch (error) {
    throw new Error("Failed to fetch projects");
  }
};

export const fetchProjectDetails = async (token, projectId) => {
  try {
    const url = `${projectEndpoints.GET_PROJECT_DETAILS_API}${projectId}`;
    const {data} = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });
    return data;
  } catch (error) {
    throw new Error("Failed to fetch project details");
  }
};

export const fetchInvitationDetails = async (token, projectId) => {
  try {
    const { data } = await apiConnector(
      "GET",
      projectEndpoints.GET_INVITATION_DETAILS_API(projectId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch invitation details"
    );
  }
};

export const respondToInvitation = async (token, projectId, action) => {
  try {
    const { data } = await apiConnector(
      "POST",
      projectEndpoints.RESPOND_TO_INVITATION_API(projectId),
      { action },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to respond to invitation"
    );
  }
};

export const fetchProjectMilestones = async (token, projectId) => {
  try {
    const { data } = await apiConnector(
      "GET",
      projectEndpoints.GET_PROJECT_MILESTONES_API(projectId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch milestones"
    );
  }
};

export const saveProjectMilestonePlan = async (
  token,
  projectId,
  milestones,
  totalPrice
) => {
  try {
    const { data } = await apiConnector(
      "PUT",
      projectEndpoints.SAVE_PROJECT_MILESTONE_PLAN_API(projectId),
      { milestones, totalPrice },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to save milestone plan"
    );
  }
};

export const submitProjectMilestonePlan = async (token, projectId) => {
  try {
    const { data } = await apiConnector(
      "POST",
      projectEndpoints.SUBMIT_PROJECT_MILESTONE_PLAN_API(projectId),
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to submit milestone plan"
    );
  }
};

export const submitProjectMilestone = async (
  token,
  projectId,
  milestoneId,
  formData
) => {
  try {
    const { data } = await apiConnector(
      "POST",
      projectEndpoints.SUBMIT_PROJECT_MILESTONE_API(projectId, milestoneId),
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    return data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to submit milestone"
    );
  }
};

export const submitProposal = async (token, payload) => {
  try {
    const {data} = await apiConnector("POST", projectEndpoints.SUBMIT_PROPOSAL_API, payload, {
      Authorization: `Bearer ${token}`,
    });
    return data;
  } catch (error) {
    throw new Error("Failed to submit proposal");
  }
};

export const fetchProposals = async (token, projectId) => {
  try {
    const {data} = await apiConnector("GET", projectEndpoints.GET_PROJECT_PROPOSALS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    return data;
  } catch (error) {
    throw new Error("Failed to fetch project proposals");
  }
};
