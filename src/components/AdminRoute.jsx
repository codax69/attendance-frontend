import { useContext, useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";

const AdminRoute = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get("/api/v1/user/get-current-user");
        setRole(response.data.data.user.role);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      setLoading(true);
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <InfinitySpin visible={true} width="200" color="#8bae66" ariaLabel="infinity-spin-loading" />
          <p className="text-white text-sm font-semibold mt-2 animate-pulse">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/" />;

  return <Outlet />;
};

export default AdminRoute;
