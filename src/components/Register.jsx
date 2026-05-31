import axios from "axios";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllClasses } from "../utils/apiHelper.js";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    enrollmentNo: "",
    mobileNo: "",
    password: "",
    age: "",
    class: "Information Technology (IT)",
    rollNo: "",
    role: "student",
    adminCode: ""
  });
  
  const [classesList, setClassesList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classes = await getAllClasses();
        if (classes && classes.length > 0) {
          setClassesList(classes);
          setFormData(prev => ({
            ...prev,
            class: `${classes[0].name} (${classes[0].code})`
          }));
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === "admin" && formData.adminCode !== "admin123") {
      toast.error("Invalid Teacher Passcode!");
      return;
    }
    try {
      await axios.post("/api/v1/user/register", {
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname,
        enrollmentNo: formData.enrollmentNo,
        mobileNo: formData.mobileNo,
        age: formData.role === "admin" ? "0" : formData.age,
        class: formData.role === "admin" ? "Admin" : formData.class,
        rollNo: formData.role === "admin" ? "0" : formData.rollNo,
        role: formData.role
      });
      toast.success("Account registered successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Registration failed. Please check your credentials.");
    }
    
    setFormData({
      email: "",
      fullname: "",
      enrollmentNo: "",
      mobileNo: "",
      password: "",
      age: "",
      class: "Information Technology (IT)",
      rollNo: "",
      role: "student",
      adminCode: ""
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative">
      {/* Backlight Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="glass-panel border-white/[0.08] px-8 py-8 mt-12 mb-12 rounded-2xl w-full max-w-lg relative z-10 hover:border-white/[0.12] transition duration-300 shadow-2xl">
        <h3 className="text-2xl font-bold font-display text-center text-white pb-1 tracking-tight">
          Create Account
        </h3>
        <p className="text-gray-400 text-xs text-center pb-6">
          Register your details to access attendance records
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="fullname">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                onChange={handleChange}
                value={formData.fullname}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="mobileNo">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNo"
                inputMode="tel"
                placeholder="Mobile Number"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                onChange={handleChange}
                value={formData.mobileNo}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                inputMode="email"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="enrollmentNo">
                {formData.role === "admin" ? "Teacher ID / Enrollment" : "Enrollment Number"}
              </label>
              <input
                type="text"
                name="enrollmentNo"
                placeholder={formData.role === "admin" ? "Teacher ID / Enrollment" : "Enrollment Number"}
                inputMode="numeric"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                onChange={handleChange}
                value={formData.enrollmentNo}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="role">
                Account Type
              </label>
              <select
                name="role"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-dark-bg text-white focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium rounded-xl cursor-pointer"
                onChange={handleChange}
                value={formData.role}
                required
              >
                <option value="student">Student</option>
                <option value="admin">Teacher (Admin)</option>
              </select>
            </div>

            {formData.role === "admin" ? (
              <div>
                <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="adminCode">
                  Teacher Passcode
                </label>
                <input
                  type="password"
                  name="adminCode"
                  placeholder="Enter Passcode (admin123)"
                  className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                  onChange={handleChange}
                  value={formData.adminCode}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="age">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  inputMode="numeric"
                  placeholder="Age"
                  className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                  onChange={handleChange}
                  value={formData.age}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>

            {formData.role === "student" && (
              <div>
                <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="rollNo">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNo"
                  placeholder="Roll Number"
                  className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-white/[0.02] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium"
                  onChange={handleChange}
                  value={formData.rollNo}
                  required
                />
              </div>
            )}
          </div>

          {formData.role === "student" && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase" htmlFor="class">
                  Class / Trade
                </label>
                <select
                  name="class"
                  className="w-full px-4 py-2.5 mt-1.5 border border-white/[0.08] bg-dark-bg text-white focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-200 text-sm font-medium rounded-xl cursor-pointer"
                  onChange={handleChange}
                  value={formData.class}
                  required
                >
                  {classesList.length > 0 ? (
                    classesList.map((cls) => {
                      const val = `${cls.name} (${cls.code})`;
                      return (
                        <option key={cls._id || cls.code} value={val}>
                          {val}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="Information Technology (IT)">Information Technology (IT)</option>
                      <option value="Computer Engineering (CO)">Computer Engineering (CO)</option>
                      <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                      <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
                      <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
                      <option value="Electronics & Communication (EC)">Electronics & Communication (EC)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 mt-6 text-[#1b211a] font-bold rounded-xl bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center min-h-[46px]"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-400 pt-3">
            Already have an account?
            <NavLink
              className="text-brand-secondary hover:text-[#ebd5ab] transition-colors ml-1.5 font-medium underline"
              to="/login"
            >
              Log In
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
