import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in when the component mounts
    axios.get("/api/api/v1/get-current-user")
      .then(response => {
        setIsLoggedIn(response);
      })
      .catch((error) => {
        console.log(error)
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn,setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
