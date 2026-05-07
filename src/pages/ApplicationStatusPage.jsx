import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, updateUser } from "../slices/profile";
import { setToken } from "../slices/auth";
import apiConnector from "../services/apiConnector";
import { authEndpoints } from "../services/api";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";

export default function ApplicationStatusPage({ status }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);

  const [loadedStatus, setLoadedStatus] = useState(false);

  /* 🔐 Redirect if not logged in */
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  /* 🚀 Auto move to dashboard if approved */
  useEffect(() => {
    if (user?.hasApproved === true && user?.status === "approved") {
      navigate("/dashboard/posts");
    }
  }, [user, navigate]);

  /* 🔄 Sync ONLY status + hasApproved */
  const syncUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await apiConnector(
        "GET",
        authEndpoints.STATUS_CHECK_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        const updatedData = {
          status: res.data.status,
          hasApproved: res.data.hasApproved,
        };

        // also update localStorage safely
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = { ...storedUser, ...updatedData };
        console.log("Syncing user data:", updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch(setUser(updatedUser));
      }
    } catch (err) {
      console.error("Sync failed:", err);
    }
  }, [token, dispatch]);

  /* 🔁 Run once + on window focus */
  useEffect(() => {
    syncUser();

    const onFocus = () => syncUser();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [syncUser]);

  /* ⛔ Safe render guard (AFTER hooks) */
  if (!status) return null;

  /* ---------- Actions ---------- */

  const moveToDashboard = async () => {
    if (!token) return;

    setLoadedStatus(true);
    try {
      const res = await apiConnector(
        "PUT",
        authEndpoints.MOVE_TO_DASHBOARD_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      console.log("Move to dashboard response:", res);
      if (res.data?.success) {
        dispatch(setUser(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard/posts");
      }
    } catch (err) {
      console.error("Move to dashboard failed:", err);
      toast.error(err.response.data.message || "Failed to move to dashboard");
    } finally {
      setLoadedStatus(false);
    }
  };

  const reSubmitDesignerApplication = async () => {
    try {
      const res = await apiConnector(
        "PUT",
        authEndpoints.RESUBMIT_DESIGNER_APPLICATION_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        dispatch(setUser(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Application resubmitted");
      }
    } catch {
      toast.error("Resubmission failed");
    }
  };

  /* ---------- UI ---------- */

  let statusIcon, title, message, buttonText, buttonAction, iconBg;

  switch (status) {
    case "pending":
      statusIcon = "⏳";
      iconBg = "bg-yellow-400";
      title = "YOUR APPLICATION IS UNDER REVIEW";
      message = "We are reviewing your information.";
      buttonText = "LOGOUT";
      buttonAction = () => {
        dispatch(setToken(null));
        dispatch(setUser(null));
        localStorage.clear();
        navigate("/");
      };
      break;

    case "approved":
      statusIcon = "✓";
      iconBg = "bg-green-500 text-white";
      title = "APPROVED";
      message = "Your business has been verified.";
      buttonText = loadedStatus ? "PROCESSING..." : "GO TO DASHBOARD";
      buttonAction = moveToDashboard;
      break;

    case "rejected":
      statusIcon = "✕";
      iconBg = "bg-red-500 text-white";
      title = "APPLICATION REJECTED";
      message = "Please resubmit your application.";
      buttonText = "RESUBMIT";
      buttonAction = reSubmitDesignerApplication;
      break;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto rounded-full ${iconBg}`}>
          {statusIcon}
        </div>
        <h1 className="mt-4 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>
        <button
          onClick={buttonAction}
          disabled={loadedStatus}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
