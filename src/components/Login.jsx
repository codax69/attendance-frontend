import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
const Login = () => {
  const [formData, setFormData] = useState({
    enrollmentNo: "",
    mobileNo: "",
    password: "",
  });
  const Navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/server/api/v1/user/login", {
        mobileNo: formData.mobileNo,
        enrollmentNo: formData.enrollmentNo,
        password: formData.password,
      })
      .then((res) => {
        console.log(res)
        Navigate(`/`)
      })
      .catch((error) => console.log(error));
    // console.log(formData.email);
    setFormData({
      enrollmentNumber: "",
      mobileNumber: "",
      password: "",
    });
  };

  return (
    <div className="flex items-center justify-center z-0">
      <div className="px-8 py-6 mt-24 lg:mt-4 text-left bg-white backdrop-blur-md rounded-lg shadow-lg lg:w-96">
        <h3 className="text-2xl font-bold text-center pb-6">
          LogIn your account
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block" htmlFor="enrollmentNumber">
              Enrollment Number & Mobile Number
            </label>
            <input
              type="text"
              name="mobileNo"
              placeholder="Enrollment Number & Mobile Number"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.mobileNo}
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.password}
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            >
              LogIn
            </button>
          </div>
          <p className="text-center pt-2 ">
          If you don’t have an account?.
            <NavLink
              className={`text-orange-400 underline hover:text-orange-500`}
              to={"/register"}
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
