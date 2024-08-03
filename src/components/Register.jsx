import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
   await axios.post("/server/api/v1/user/register",{
       email:formData.email,
       password:formData.password,
       fullname:formData.fullname,
       enrollmentNo:formData.enrollmentNo,
       mobileNo:formData.mobileNo
    }).then(()=>{
        Navigate(`/login`)
      })
    .catch((error)=>{
      console.log(error)
    })
    setFormData({
      email: "",
      fullName: "",
      enrollmentNumber: "",
      mobileNumber: "",
      password: "",
    });
  };

  return (
    <div className="flex items-center justify-center z-0">
      <div className="px-8 py-6 mt-24 lg:mt-4 text-left bg-white backdrop-blur-md rounded-lg shadow-lg lg:w-96">
        <h3 className="text-2xl font-bold text-center pb-6">
          Register your account
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block" htmlFor="mobileNumber">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobileNo"
              placeholder="Mobile Number"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.mobileNumber}
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.fullName}
            />
          </div>
          <div>
            <label className="block" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.email}
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="enrollmentNumber">
              Enrollment Number
            </label>
            <input
              type="text"
              name="enrollmentNo"
              placeholder="Enrollment Number"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-600"
              onChange={handleChange}
              value={formData.enrollmentNumber}
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
              Register
            </button>
          </div>
          <p className="text-center pt-2">
            Already Register Account?.
            <NavLink
              className={`text-orange-400 underline  hover:text-orange-500`}
              to={"/login"}
            >
              LogIn
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
