import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ContextApi } from "../context/ContextApi";
import { InfinitySpin } from "react-loader-spinner";

const Login = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobileNo: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    setLoader(true);
    e.preventDefault();
    axios
      .post("/api/v1/user/login", {
        mobileNo: formData.mobileNo,
        password: formData.password,
      })
      .then((response) => {
        const loggedIn = response.data.data.loggedInUser.isLoggedIn;
        if (loggedIn) {
          setLoader(false);
          setIsLoggedIn(loggedIn);
          toast.success("Welcome back! Login successful.");
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
        setLoader(false);
        toast.error("Incorrect mobile number or password. Please try again.");
      });

    setFormData({
      mobileNo: "",
      password: "",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative">
      {/* Backlight Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="glass-panel border-white/[0.08] px-8 py-10 rounded-2xl w-full max-w-md relative z-10 hover:border-white/[0.12] transition duration-300 shadow-2xl">
        <h3 className="text-2xl font-bold font-display text-center text-white pb-1 tracking-tight">
          Welcome Back
        </h3>
        <p className="text-gray-400 text-xs text-center pb-8">
          Sign in to check and register your attendance
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="mobileNo">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobileNo"
              placeholder="Enter mobile number"
              inputMode="tel"
              className="w-full px-4 py-3 mt-2 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
              onChange={handleChange}
              value={formData.mobileNo}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="w-full px-4 py-3 mt-2 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loader}
            className="w-full py-3 mt-8 text-[#1b211a] font-bold rounded-xl bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center min-h-[46px]"
          >
            {loader ? (
              <InfinitySpin
                visible={true}
                width="40"
                color="#fff"
                ariaLabel="infinity-spin-loading"
              />
            ) : (
              "Login"
            )}
          </button>

          <p className="text-center text-sm text-gray-400 pt-3">
            Don&apos;t have an account?
            <NavLink
              className="text-brand-secondary hover:text-[#ebd5ab] transition-colors ml-1.5 font-medium underline"
              to="/register"
            >
              Register
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
