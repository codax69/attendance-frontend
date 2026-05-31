import { Routes, Route,Navigate, useNavigate} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import Home from "./components/Home.jsx";
import Qr from "./components/Qr.jsx";
import AttendanceHistory from "./components/AttendanceHistory.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminStudentDetail from "./components/AdminStudentDetail.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import { useContext, useEffect } from "react";
import axios from "axios";


function App() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate()
  const checkLoggedIn = async () => {
    try {
      const res = await axios.get("/api/v1/user/get-current-user");
      console.log(res);
      setIsLoggedIn(res.data.data.user.isLoggedIn);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Home/>}></Route>
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

