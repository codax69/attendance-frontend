import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/button" element={<Navbar />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p" element={<Profile/>}/>
      <>
      
      </>
    </Routes>
  );
}

export default App;
