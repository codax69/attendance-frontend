import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getPublicOrganizations } from "../utils/apiHelper.js";
import { FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { MdPhone, MdLock, MdVerifiedUser } from "react-icons/md";
import { IoMail } from "react-icons/io5";

const Register = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [registerMode, setRegisterMode] = useState("user"); // "user" (Student/Employee) or "admin" (Manager/HR)
  const [userType, setUserType] = useState("student"); // "student" or "employee"

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobileNo: "",
    password: "",
    age: "",
    department: "", // Department Code (verified by backend)
    organizationId: "",
    designation: "Manager", // for Admin/Higher Auth
    rollNo: "", // Roll Number / Employee ID
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await getPublicOrganizations();
        setOrganizations(orgs);
        if (orgs.length > 0) {
          setFormData((prev) => ({ ...prev, organizationId: orgs[0]._id }));
        }
      } catch (err) {
        console.error("Error loading organizations:", err);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.organizationId) {
      toast.error("Please select an organization.");
      return;
    }
    if (!formData.department.trim()) {
      toast.error("Department code is required.");
      return;
    }

    setSubmitting(true);
    try {
      const isHigherAuth = registerMode === "admin";
      
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
        mobileNo: formData.mobileNo,
        password: formData.password,
        organizationId: formData.organizationId,
        department: formData.department.trim().toUpperCase(),
        role: isHigherAuth ? "admin" : "user",
      };

      if (isHigherAuth) {
        payload.designation = formData.designation;
      } else {
        payload.age = formData.age;
        payload.class = userType === "employee" ? "Employee" : "Student Class";
        payload.rollNo = formData.rollNo;
        if (userType === "student") {
          payload.studentId = formData.rollNo;
        } else {
          payload.employeeId = formData.rollNo;
        }
      }

      await axios.post("/api/v1/user/register", payload);
      toast.success("Account registered successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Registration failed. Please check your credentials.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const themeColor = registerMode === "user" ? "#06b6d4" : "#4f46e5";
  const glowColor = registerMode === "user" ? "rgba(6,182,212,0.15)" : "rgba(79,70,229,0.15)";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative overflow-hidden select-none py-12">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${themeColor}, transparent)` }}
        />
        <div className="absolute inset-0 grid-texture opacity-10" />
      </div>

      <div
        className="relative z-10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl p-8 md:p-10"
        style={{
          background: "rgba(8, 8, 16, 0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <h3 className="text-2xl font-black text-center text-white pb-1 tracking-tight">
          Create Account
        </h3>
        <p className="text-slate-400 text-xs text-center pb-6">
          Register your credentials to join your organization
        </p>

        {/* Tab Selector */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            type="button"
            onClick={() => setRegisterMode("user")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              registerMode === "user" ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
            style={
              registerMode === "user"
                ? {
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.1))",
                    border: "1px solid rgba(6,182,212,0.3)",
                    boxShadow: "0 4px 15px rgba(6,182,212,0.15)",
                  }
                : {}
            }
          >
            <FaUserCircle size={14} />
            Student / Employee
          </button>
          <button
            type="button"
            onClick={() => setRegisterMode("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
              registerMode === "admin" ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
            style={
              registerMode === "admin"
                ? {
                    background: "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(79,70,229,0.1))",
                    border: "1px solid rgba(79,70,229,0.3)",
                    boxShadow: "0 4px 15px rgba(79,70,229,0.15)",
                  }
                : {}
            }
          >
            <FaShieldAlt size={14} />
            Manager / HR
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                onChange={handleChange}
                value={formData.fullname}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Mobile Number</label>
              <div className="relative">
                <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="tel"
                  name="mobileNo"
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                  onChange={handleChange}
                  value={formData.mobileNo}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <IoMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                  onChange={handleChange}
                  value={formData.email}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                  onChange={handleChange}
                  value={formData.password}
                  required
                />
              </div>
            </div>
          </div>

          {/* SaaS Linkage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Organization</label>
              <select
                name="organizationId"
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.07] rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
                onChange={handleChange}
                value={formData.organizationId}
                required
              >
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))
                ) : (
                  <option value="">No organizations available</option>
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Department Code</label>
              <input
                type="text"
                name="department"
                placeholder="e.g. CS, HR, ME"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                onChange={handleChange}
                value={formData.department}
                required
              />
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {registerMode === "admin" ? (
            /* Manager / HR Inputs */
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Authority Designation</label>
              <select
                name="designation"
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.07] rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
                onChange={handleChange}
                value={formData.designation}
                required
              >
                <option value="Manager">Manager</option>
                <option value="HR">HR Officer</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Dean">Dean / Principal</option>
              </select>
            </div>
          ) : (
            /* Student / Employee Inputs */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">User Subtype</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.07] rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                    onChange={handleChange}
                    value={formData.age}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {userType === "student" ? "Student Roll Number" : "Employee ID"}
                </label>
                <input
                  type="text"
                  name="rollNo"
                  placeholder={userType === "student" ? "e.g. Roll 24" : "e.g. EMP105"}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all"
                  onChange={handleChange}
                  value={formData.rollNo}
                  required
                />
              </div>
            </div>
          )}

          {/* Department Code note */}
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl border mt-2"
            style={{
              background: `${glowColor}10`,
              borderColor: `${themeColor}20`,
            }}
          >
            <MdVerifiedUser style={{ color: themeColor }} className="text-base flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-400 leading-relaxed">
              <strong>Important:</strong> You must enter a valid <strong>Department Code</strong> (e.g. CS, HR) that has been created by your organization owner in the SaaS dashboard.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer mt-6 shadow-lg active:scale-[0.98] flex items-center justify-center min-h-[44px]"
            style={{
              background: submitting
                ? "rgba(255,255,255,0.05)"
                : `linear-gradient(135deg, ${themeColor}, #5c5cf4)`,
              boxShadow: submitting ? "none" : `0 8px 20px ${glowColor}`,
            }}
          >
            {submitting ? "Processing..." : "Complete Registration"}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?
            <NavLink
              className="text-[#06b6d4] hover:text-[#22d3ee] transition-colors ml-1 font-bold underline"
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
