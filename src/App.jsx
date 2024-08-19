import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile.jsx';
import Home from './components/Home.jsx';
import Qr from './components/Qr.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { useContext } from 'react';

function App() {
  const {isLoggedIn} = useContext(AuthContext)
  console.log(isLoggedIn)
  return (
    
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Home/>:<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/p/:mobileNo" element={<Profile />} />
          <Route path="/attendance" element={<Qr />} />
        </Route>
      </Routes>
  );
}

export default App;
