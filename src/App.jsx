import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "./socket/connection";
import { useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Otp from "./components/auth/Otp";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PublicRoute from "./components/PublicRoute";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";
import MyPosts from "./pages/MyPosts";
import AddPost from "./pages/AddPost";
import PostDetails from "./pages/PostDetails";
import MyStories from "./pages/MyStories";
import AddStory from "./pages/AddStory";
import MyBanners from "./pages/MyBanners";
import AddBanner from "./pages/AddBanner";
import Boutique from "./pages/Boutique";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import ShippingFees from "./pages/ShippingFees";
import EditProduct from "./pages/EditProduct";
import BoutiqueTaxonomySettings from "./pages/BoutiqueTaxonomySettings";
import Studio from "./pages/Studio";
import AddDesign from "./pages/AddDesign";
import DesignDetails from "./pages/DesignDetails";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import InvitedProjects from "./pages/InvitedProjects";
import InvitedProjectDetails from "./pages/InvitedProjectDetails";
import ConsultationSettings from "./pages/ConsultationSettings";
import ConsultationMeetings from "./pages/ConsultationMeetings";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import MyProfile from "./pages/MyProfile";
import SubscriptionPage from "./pages/Subscription";
import SubscriptionGuard from "./components/subscription/SubscriptionGuard";
import FeatureGuard from "./components/subscription/FeatureGuard";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import SubscriptionFailed from "./pages/SubscriptionFailed";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import MySubscription from "./pages/MySubscription";
import { setSubscription } from "./slices/subscription";
import { getSubscriptionData } from "./services/subscription.service";
import { setLoading } from "./slices/subscription";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setSubScriptionModalOpen } from "./slices/subscription";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import VendorPayoutsPage from "./pages/VendorPayoutsPage";
import { useState } from "react";
function App() {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.profile.user);
  const [status, setStatus] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("User data changed:",user && user.hasApproved !== undefined && user.status && user.hasApproved === false);
    if (user && user.hasApproved !== undefined && user.status && user.hasApproved === false) {
      setStatus(user.status);
      navigate("/application-status");
    }
  }, [user]);
  
  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  useEffect(() => {
    const handleExpired = (event) => {
      // console.log(event);
      
      const message = event.detail?.message || "Your subscription has expired.";
      // dispatch(setSubScriptionModalOpen(true));
      toast.error(message);
      navigate("/my-subscription");
    };

    window.addEventListener("subscription_expired", handleExpired);

    return () => window.removeEventListener("subscription_expired", handleExpired);
  }, [navigate]);

  useEffect(() => {
    const handleDowngraded = (event) => {
      const message = event.detail?.message || "Your subscription has been downgraded.";
      toast(message);
    };
    window.addEventListener("subscription_downgraded", handleDowngraded);

    return () => window.removeEventListener("subscription_downgraded", handleDowngraded);
  }, [navigate]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!token) {
        dispatch(setSubscription(null));
        dispatch(setLoading(false));
        return;
      }
      dispatch(setLoading(true));
      try {
        const response = await getSubscriptionData(token);
        dispatch(setSubscription(response ?? null));
      } catch (error) {
        dispatch(setSubscription(null));
        dispatch(setLoading(false));
        console.error("Error during initial data fetch:", error);
      }
    };
    fetchSubscriptionData();
  }, [token, dispatch]);

  return (
    <div>
      <Routes>
        {/* ---------- Public Routes ---------- */}
          <Route path="application-status" element={<ApplicationStatusPage status={status} />} />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PublicRoute>
              <Otp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        
        {/* ---------- Subscription Routes (No subscription guard) ---------- */}
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/success"
          element={
            <ProtectedRoute>
              <SubscriptionSuccess />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/subscription/failed"
          element={
            <ProtectedRoute>
              <SubscriptionFailed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-methods"
          element={
            <ProtectedRoute>
              <PaymentMethodsPage />
            </ProtectedRoute>
          }
        />

        {/* ---------- Protected Routes with Subscription Guard ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* <ApplicationStatusPage > */}
              <SubscriptionGuard>
                <Dashboard />
              </SubscriptionGuard>
              {/* </ApplicationStatusPage> */}
            </ProtectedRoute>
          }
        >
          <Route index element={<MyProfile />} />
          <Route path="profile" element={<MyProfile />} />
          
          {/* Post routes */}
          <Route path="posts" element={<FeatureGuard permission="postCreationAccess"><MyPosts /></FeatureGuard>} />
          <Route path="posts/add-post" element={<FeatureGuard permission="postCreationAccess"><AddPost /></FeatureGuard>} />
          <Route path="posts/:postId" element={<FeatureGuard permission="postCreationAccess"><PostDetails /></FeatureGuard>} />

          {/* Story routes */}
          <Route path="stories" element={<FeatureGuard permission="storyAccess"><MyStories /></FeatureGuard>} />
          <Route path="stories/add-story" element={<FeatureGuard permission="storyAccess"><AddStory /></FeatureGuard>} />

          {/* Banner routes */}
          <Route path="banners" element={<FeatureGuard permission="bannerAccess"><MyBanners /></FeatureGuard>} />
          <Route path="banners/add-banner" element={<FeatureGuard permission="bannerAccess"><AddBanner /></FeatureGuard>} />

          {/* Boutique routes */}
          <Route path="boutique" element={<FeatureGuard permission="ecommerceAccess"><Boutique /></FeatureGuard>} />
          <Route path="boutique/add-product" element={<FeatureGuard permission="ecommerceAccess"><AddProduct /></FeatureGuard>} />
          <Route path="boutique/edit/:productId" element={<FeatureGuard permission="ecommerceAccess"><EditProduct /></FeatureGuard>} />
          <Route path="boutique/shipping-fees" element={<FeatureGuard permission="ecommerceAccess"><ShippingFees /></FeatureGuard>} />
          <Route path="boutique/categories" element={<FeatureGuard permission="ecommerceAccess"><BoutiqueTaxonomySettings /></FeatureGuard>} />
          <Route path="boutique/:productId" element={<FeatureGuard permission="ecommerceAccess"><ProductDetails /></FeatureGuard>} />

          {/* Studio routes */}
          <Route path="studio" element={<FeatureGuard permission="studioAccess"><Studio /></FeatureGuard>} />
          <Route path="studio/add-design" element={<FeatureGuard permission="studioAccess"><AddDesign /></FeatureGuard>} />
          <Route path="studio/:designId" element={<FeatureGuard permission="studioAccess"><DesignDetails /></FeatureGuard>} />

          {/* Project routes (design kit) */}
          <Route path="projects" element={<FeatureGuard permission="designKitAccess"><Projects /></FeatureGuard>} />
          <Route path="projects/:projectId" element={<FeatureGuard permission="designKitAccess"><ProjectDetails /></FeatureGuard>} />

          {/* Proposal/Invitation routes */}
          <Route path="invitations" element={<FeatureGuard permission="designKitAccess"><InvitedProjects /></FeatureGuard>} />
          <Route path="invitations/:projectId" element={<FeatureGuard permission="designKitAccess"><InvitedProjectDetails /></FeatureGuard>} />

          {/* Consultations: settings + meetings */}
          <Route
            path="consultation"
            element={<Navigate to="/dashboard/consultations/settings" replace />}
          />
          <Route
            path="consultations/settings"
            element={
              <FeatureGuard permission="consultationAccess">
                <ConsultationSettings />
              </FeatureGuard>
            }
          />
          <Route
            path="consultations/meetings"
            element={
              <FeatureGuard permission="consultationAccess">
                <ConsultationMeetings />
              </FeatureGuard>
            }
          />

          {/* Order routes */}
          <Route path="orders" element={<FeatureGuard permission="ecommerceAccess"><MyOrders /></FeatureGuard>} />
          <Route path="orders/track/:orderId" element={<FeatureGuard permission="ecommerceAccess"><OrderTracking /></FeatureGuard>} />
          <Route
            path="payouts"
            element={
              <FeatureGuard permission="payoutAccess">
                <VendorPayoutsPage />
              </FeatureGuard>
            }
          />
          <Route path="chat" element={<FeatureGuard permission="chatAccess"><div /></FeatureGuard>} />
          <Route path="my-subscription" element={<MySubscription />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;