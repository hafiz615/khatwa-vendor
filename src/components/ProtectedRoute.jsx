import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    // Get token from Redux store
    const token = useSelector((state) => state.auth.token);
    
    // Also check localStorage as fallback
    const localToken = localStorage.getItem("token");
    
    // If no token found in either store or localStorage, redirect to login
    if (!token && !localToken) {
        return <Navigate to="/" replace />;
    }
    
    // If token exists, render the protected component
    return children;
};

export default ProtectedRoute;