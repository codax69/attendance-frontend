import { Routes, Route, useNavigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import RegisterOrganization from "./components/RegisterOrganization.jsx";
import Profile from "./components/Profile.jsx";
import Home from "./components/Home.jsx";
import Qr from "./components/Qr.jsx";
import AttendanceHistory from "./components/AttendanceHistory.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminStudentDetail from "./components/AdminStudentDetail.jsx";
import LandingPage from "./components/LandingPage.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import { useContext, useEffect } from "react";
import axios from "axios";
import { refreshToken } from "./utils/apiHelper";

// Enable credentials for Axios globally
axios.defaults.withCredentials = true;

// Queue management for token refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function App() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const checkLoggedIn = async () => {
    try {
      const refreshed = await refreshToken();
      if (!refreshed) {
        setIsLoggedIn(false);
        return;
      }

      const res = await axios.get("/api/v1/user/get-current-user");
      setIsLoggedIn(res.data.data.user.isLoggedIn);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register-organization" element={<RegisterOrganization />} />
      <Route
        path="/"
        element={isLoggedIn ? <Home /> : <LandingPage />}
      />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route element={<PrivateRoute />}>
        <Route path="/p/:mobileNo" element={<Profile />} />
        <Route path="/attendance" element={<Qr />} />
        <Route path="/history" element={<AttendanceHistory />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/student/:userId" element={<AdminStudentDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
