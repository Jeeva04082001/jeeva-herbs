import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;