import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import Home from "./components/Home.jsx";
import Qr from "./components/Qr.jsx";

function App() {
  return (
    <>
    <Routes>
      <Route path="/button" element={<Navbar />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p/:mobileNo" element={<Profile/>}/>
      <Route path="/" element={<Home/>} />
      <Route path="/attendance" element={<Qr/>}/>
    </Routes>
    </>
  );
}

export default App;
