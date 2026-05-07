import apiConnector from "./apiConnector";
import { consultationEndpoints, designerEndpoints } from "./api";

export const fetchAvailabilitySlots = async (token) => {
  try {
    const { data } = await apiConnector(
      "GET",
      designerEndpoints.GET_AVAILABILITY_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return data;
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    throw error;
  }
};

export const fetchConsultations = async (token,status) => {
    try {
        const { data } = await apiConnector(
            "GET",
            `${consultationEndpoints.GET_CONSULTATIONS_API}?status=${status}`,
            null,
            { Authorization: `Bearer ${token}` }
        );
        return data;
    } catch (error) {
        console.error("Error fetching consultations:", error);
        throw error;
    }
};

export const addAvailability = async (token, payload) => {
    try {
        const { data } = await apiConnector(
            "POST",
            designerEndpoints.SET_AVAILABILITY_API,
            {availability: payload},
            { Authorization: `Bearer ${token}` }
        );
        console.log("Set Availability Response:", data);
        return data;
    } catch (error) {
        console.error("Error setting availability:", error);
        throw error;
    }
}

export const editAvailability = async (token, payload) => {
    try {
        const { data } = await apiConnector(
            "PUT",
            designerEndpoints.UPDATE_AVAILABILITY_API,
            {availability: payload},
            { Authorization: `Bearer ${token}` }
        );
        console.log("Set Availability Response:", data);
        return data;
    } catch (error) {
        console.error("Error setting availability:", error);
        throw error;
    }
}

export const fetchConsultationPrice = async (token) => {
    try {
        const { data } = await apiConnector(
            "GET",
            designerEndpoints.GET_CONSULTATION_PRICE_API,
            null,
            { Authorization: `Bearer ${token}` }
        ); 
        return data;
    } catch (error) {
        console.error("Error fetching consultation price:", error);
        throw error;
    }
}

export const updateConsultationPrice = async (token, payload) => {
    try {
        const { data } = await apiConnector(
            "PUT",
            designerEndpoints.SET_CONSULTATION_PRICE_API,
            payload,
            { Authorization: `Bearer ${token}` }
        );
        return data;
    } catch (error) {
        console.error("Error updating consultation price:", error);
        throw error;
    }
}