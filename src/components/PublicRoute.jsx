import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token"); // or however you're storing auth

  if (token) {
    // if user is already logged in, redirect to home
    return <Navigate to="/dashboard/posts" replace />;
  }

  // otherwise, show the page (login/signup)
  return children;
}
export default PublicRoute;