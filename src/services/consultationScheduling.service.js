import { designerEndpoints } from "./api";
import apiConnector from "./apiConnector";

export const updateConsultationSettingsAPI = async (body, token) => {
  const { data } = await apiConnector(
    "PUT",
    designerEndpoints.CONSULTATION_SETTINGS_API,
    body,
    { Authorization: `Bearer ${token}` }
  );
  return data;
};

export const createConsultationServiceAPI = async (body, token) => {
  const { data } = await apiConnector(
    "POST",
    designerEndpoints.CONSULTATION_SERVICES_API,
    body,
    { Authorization: `Bearer ${token}` }
  );
  return data;
};

export const updateConsultationServiceAPI = async (serviceId, body, token) => {
  const { data } = await apiConnector(
    "PUT",
    designerEndpoints.CONSULTATION_SERVICE_BY_ID_API(serviceId),
    body,
    { Authorization: `Bearer ${token}` }
  );
  return data;
};

export const deleteConsultationServiceAPI = async (serviceId, token) => {
  const { data } = await apiConnector(
    "DELETE",
    designerEndpoints.CONSULTATION_SERVICE_BY_ID_API(serviceId),
    null,
    { Authorization: `Bearer ${token}` }
  );
  return data;
};
