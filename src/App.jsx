import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile.jsx';
import Home from './components/Home.jsx';
import Qr from './components/Qr.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { useContext, useEffect } from 'react';
import axios from 'axios';


function App() {
  const {isLoggedIn,setIsLoggedIn} = useContext(AuthContext)
  console.log(isLoggedIn)
  const checkLoggedIn = async () => {
    await axios
      .get("api/api/v1/user/get-current-user")
      .then((res) => {
        setIsLoggedIn(res.data.data.user.isLoggedIn);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    checkLoggedIn();
  }, []);
  return (
    
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path='/login' element={<Login/>}/>
        <Route path="/" element={isLoggedIn ? <Home/>:<Navigate to="/login"/>} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/p/:mobileNo" element={<Profile />} />
          <Route path="/attendance" element={<Qr />} />
        </Route>
      </Routes>
  );
}

export default App;
