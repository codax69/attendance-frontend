import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { ContextApi } from "../context/ContextApi";
import { AttendanceLogo } from "./LandingPage.jsx";
import {
  MdPhone,
  MdLock,
  MdAdminPanelSettings,
  MdCorporateFare,
  MdVerifiedUser,
  MdArrowForward,
} from "react-icons/md";
import { FaEye, FaEyeSlash, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";

// ─── Login mode tabs ───────────────────────────────────────────────────────
const MODES = [
  {
    id: "user",
    label: "Student / Employee",
    icon: FaUserCircle,
    subtitle: "End User Portal",
    color: "#06b6d4",
  },
  {
    id: "admin",
    label: "Manager / HR",
    icon: MdAdminPanelSettings,
    subtitle: "Higher Authority",
    color: "#4f46e5",
  },
  {
    id: "superuser",
    label: "Organization Owner",
    icon: FaShieldAlt,
    subtitle: "Superuser Admin",
    color: "#8b5cf6",
  },
];

// ─── Animated background visual ───────────────────────────────────────────
const HeroPanelVisual = ({ mode }) => {
  const getGradient = () => {
    if (mode === "user") return "radial-gradient(circle, #06b6d4, transparent)";
    if (mode === "admin") return "radial-gradient(circle, #4f46e5, transparent)";
    return "radial-gradient(circle, #8b5cf6, transparent)";
  };

  const getBorderColor = () => {
    if (mode === "user") return "rgba(6,182,212,0.25)";
    if (mode === "admin") return "rgba(79,70,229,0.25)";
    return "rgba(139,92,246,0.25)";
  };

  const getIconBg = () => {
    if (mode === "user") return "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))";
    if (mode === "admin") return "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(79,70,229,0.05))";
    return "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))";
  };

  const getThemeColor = () => {
    if (mode === "user") return "#06b6d4";
    if (mode === "admin") return "#818cf8";
    return "#a78bfa";
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
      {/* Glow rings */}
      <div
        className="absolute w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-700"
        style={{ background: getGradient() }}
      />

      {/* Central icon */}
      <div
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transition-all duration-500"
        style={{
          background: getIconBg(),
          border: `1px solid ${getBorderColor()}`,
        }}
      >
        {mode === "user" && <FaUserCircle className="text-5xl text-[#06b6d4]" />}
        {mode === "admin" && <MdAdminPanelSettings className="text-5xl text-[#818cf8]" />}
        {mode === "superuser" && <FaShieldAlt className="text-5xl text-[#c084fc]" />}
      </div>

      <h2 className="text-2xl font-black text-white mb-2 relative z-10">
        {mode === "user" && "Attendance Portal"}
        {mode === "admin" && "Authority Dashboard"}
        {mode === "superuser" && "Superuser Console"}
      </h2>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed relative z-10">
        {mode === "user" && "Scan daily QR codes, track your check-ins, and manage your profile details."}
        {mode === "admin" && "View department records, approve student/employee attendance, and manage QRs."}
        {mode === "superuser" && "Complete control over organization settings, departments creation, and user management."}
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center mt-6 relative z-10">
        {(mode === "user"
          ? ["QR Check-In", "History Logs", "My Profile", "Self Edit"]
          : mode === "admin"
          ? ["Verify Scanner", "Approve Logs", "Department Report", "Staff List"]
          : ["Create Depts", "Invite Authority", "Full Audit Logs", "SaaS Billing"]
        ).map((f) => (
          <span
            key={f}
            className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all duration-200"
            style={{
              background: mode === "user" ? "rgba(6,182,212,0.08)" : mode === "admin" ? "rgba(79,70,229,0.08)" : "rgba(139,92,246,0.08)",
              borderColor: mode === "user" ? "rgba(6,182,212,0.2)" : mode === "admin" ? "rgba(79,70,229,0.2)" : "rgba(139,92,246,0.2)",
              color: getThemeColor(),
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Testimonial strip */}
      <div className="absolute bottom-10 left-0 right-0 px-8">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-left">
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-amber-400 text-[10px]">★</span>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic leading-relaxed">
            {mode === "user" && '"QR check-in takes 2 seconds. Never missed a mark since."'}
            {mode === "admin" && '"Compliance reports save us 4 hours of paperwork every single week."'}
            {mode === "superuser" && '"Scaling attendance mapping for 10+ departments made incredibly fast."'}
          </p>
          <p className="text-[9px] text-slate-600 font-bold mt-1">
            {mode === "user" && "— Aditya R., Engineering Student"}
            {mode === "admin" && "— HOD Computer Science, HR Lead"}
            {mode === "superuser" && "— Director, Obsidian Technologies"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Input field ──────────────────────────────────────────────────────────
const InputField = ({
  label,
  name,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  required,
  suffix,
  themeColor = "#06b6d4",
}) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none" />
      )}
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} ${suffix ? "pr-10" : "pr-4"} py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] transition-all duration-200 font-medium`}
        style={{
          ":focus": {
            borderColor: themeColor,
          }
        }}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  </div>
);

// ─── Main Login Component ─────────────────────────────────────────────────
const Login = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const [userForm, setUserForm] = useState({ mobileNo: "", password: "" });
  const [adminForm, setAdminForm] = useState({ emailOrMobile: "", password: "" });
  const [superuserForm, setSuperuserForm] = useState({ email: "", password: "" });

  const handleUserChange = (e) =>
    setUserForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdminChange = (e) =>
    setAdminForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSuperuserChange = (e) =>
    setSuperuserForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Submit User Login (mobile + password) ──────────────────────────────
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.mobileNo.trim() || !userForm.password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoader(true);
    try {
      const response = await axios.post("/api/v1/user/login", {
        mobileNo: userForm.mobileNo,
        password: userForm.password,
      });
      const loggedIn = response.data.data.loggedInUser.isLoggedIn;
      if (loggedIn) {
        setIsLoggedIn(loggedIn);
        toast.success("Welcome back! Login successful.");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Incorrect mobile number or password. Please try again.";
      toast.error(msg);
    } finally {
      setLoader(false);
      setUserForm({ mobileNo: "", password: "" });
    }
  };

  // ── Submit Manager / HR Login (email/mobile + password) ──────────────────
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.emailOrMobile.trim() || !adminForm.password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoader(true);
    try {
      const isEmail = adminForm.emailOrMobile.includes("@");
      const payload = {
        password: adminForm.password,
        [isEmail ? "email" : "mobileNo"]: adminForm.emailOrMobile,
      };

      const response = await axios.post("/api/v1/user/login", payload);
      const loggedIn = response.data.data.loggedInUser.isLoggedIn;
      const role = response.data.data.loggedInUser.role;
      if (loggedIn) {
        setIsLoggedIn(loggedIn);
        toast.success("Manager/HR authenticated successfully!");
        navigate(role === "admin" || role === "superuser" ? "/admin" : "/");
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Incorrect email/mobile number or password. Please try again.";
      toast.error(msg);
    } finally {
      setLoader(false);
      setAdminForm({ emailOrMobile: "", password: "" });
    }
  };

  // ── Submit Superuser / Owner Login (email + password) ────────────────────
  const handleSuperuserSubmit = async (e) => {
    e.preventDefault();
    if (!superuserForm.email.trim() || !superuserForm.password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoader(true);
    try {
      const response = await axios.post("/api/v1/user/login", {
        email: superuserForm.email,
        password: superuserForm.password,
      });
      const loggedIn = response.data.data.loggedInUser.isLoggedIn;
      const role = response.data.data.loggedInUser.role;
      if (loggedIn) {
        setIsLoggedIn(loggedIn);
        toast.success("Superuser authenticated. Welcome to organization controls!");
        navigate(role === "admin" || role === "superuser" ? "/admin" : "/");
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Invalid Superuser credentials. Please check and try again.";
      toast.error(msg);
    } finally {
      setLoader(false);
      setSuperuserForm({ email: "", password: "" });
    }
  };

  const getThemeColor = () => {
    if (mode === "user") return "#06b6d4";
    if (mode === "admin") return "#4f46e5";
    return "#8b5cf6";
  };

  const getGlowColor = () => {
    if (mode === "user") return "rgba(6,182,212,0.25)";
    if (mode === "admin") return "rgba(79,70,229,0.25)";
    return "rgba(139,92,246,0.25)";
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 right-1/4 w-96 h-80 rounded-full opacity-10 blur-3xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${getThemeColor()}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-80 h-72 rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />
        <div className="absolute inset-0 grid-texture opacity-20" />
      </div>

      {/* Main card — split layout */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
        style={{
          background: "rgba(8, 8, 16, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── LEFT — Hero visual panel ───────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-shrink-0 transition-all duration-700"
          style={{
            background:
              mode === "user"
                ? "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(79,70,229,0.04) 100%)"
                : mode === "admin"
                ? "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(139,92,246,0.04) 100%)"
                : "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.04) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <HeroPanelVisual mode={mode} />
        </div>

        {/* ── RIGHT — Form panel ─────────────────────────────────── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <AttendanceLogo className="w-5 h-5 text-[#06b6d4]" />
            <span className="font-black text-sm bg-gradient-to-r from-[#c3c0ff] to-[#4cd7f6] bg-clip-text text-transparent">
              Attenteds
            </span>
          </div>

          {/* Mode toggle tabs */}
          <div
            className="flex gap-1 p-1 rounded-2xl mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {MODES.map(({ id, label, icon: Icon, subtitle, color }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setShowPassword(false); }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                  mode === id
                    ? "text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                style={
                  mode === id
                    ? {
                        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                        border: `1px solid ${color}33`,
                        boxShadow: `0 4px 15px ${color}15`,
                      }
                    : {}
                }
              >
                <Icon style={{ color: mode === id ? color : undefined }} size={16} className="mb-0.5" />
                <span className="text-[10px] leading-tight text-center">{label}</span>
                <span className="text-[7px] font-medium opacity-60 leading-tight text-center hidden sm:inline">{subtitle}</span>
              </button>
            ))}
          </div>

          {/* ── MODE 1: STUDENT / EMPLOYEE LOGIN ─────────────────────── */}
          {mode === "user" && (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-white mb-1">Student / Employee Login 👋</h1>
                <p className="text-xs text-slate-400">Log in with your registered mobile number.</p>
              </div>

              <InputField
                label="Mobile Number"
                name="mobileNo"
                type="tel"
                placeholder="e.g. 9876543210"
                icon={MdPhone}
                value={userForm.mobileNo}
                onChange={handleUserChange}
                required
                themeColor={getThemeColor()}
              />

              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={MdLock}
                value={userForm.password}
                onChange={handleUserChange}
                required
                themeColor={getThemeColor()}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loader}
                className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-2 shadow-lg active:scale-[0.98]"
                style={{
                  background: loader
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  boxShadow: loader ? "none" : `0 8px 24px ${getGlowColor()}`,
                }}
              >
                {loader ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Don&apos;t have an account?{" "}
                <NavLink to="/register" className="text-[#06b6d4] hover:text-[#38bdf8] font-bold underline transition-colors">
                  Register here
                </NavLink>
              </p>
            </form>
          )}

          {/* ── MODE 2: MANAGER / HR LOGIN ────────────────────────────── */}
          {mode === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-white mb-1">Manager / HR Login 🏢</h1>
                <p className="text-xs text-slate-400">Log in with your registered email address or mobile number.</p>
              </div>

              <InputField
                label="Email or Mobile"
                name="emailOrMobile"
                type="text"
                placeholder="manager@org.com or 9876543210"
                icon={IoMail}
                value={adminForm.emailOrMobile}
                onChange={handleAdminChange}
                required
                themeColor={getThemeColor()}
              />

              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={MdLock}
                value={adminForm.password}
                onChange={handleAdminChange}
                required
                themeColor={getThemeColor()}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loader}
                className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-2 shadow-lg active:scale-[0.98]"
                style={{
                  background: loader
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #4f46e5, #8b5cf6)",
                  boxShadow: loader ? "none" : `0 8px 24px ${getGlowColor()}`,
                }}
              >
                {loader ? "Authenticating..." : "Login to Authority Panel"}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Higher auth not registered?{" "}
                <NavLink to="/register" className="text-[#818cf8] hover:text-[#a78bfa] font-bold underline transition-colors">
                  Sign up here
                </NavLink>
              </p>
            </form>
          )}

          {/* ── MODE 3: SUPERUSER / OWNER LOGIN ────────────────────────── */}
          {mode === "superuser" && (
            <form onSubmit={handleSuperuserSubmit} className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FaShieldAlt className="text-[#a78bfa] text-sm" />
                  <h1 className="text-xl font-black text-white">Superuser Owner Login</h1>
                </div>
                <p className="text-xs text-slate-400">Access full tenancy operations for your organization.</p>
              </div>

              {/* Info badge */}
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl border"
                style={{
                  background: "rgba(139,92,246,0.06)",
                  borderColor: "rgba(139,92,246,0.2)",
                }}
              >
                <MdVerifiedUser className="text-[#a78bfa] text-base flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  This console is restricted to the <span className="text-[#a78bfa] font-bold">Organization Owner</span> who registered the workspace.
                </p>
              </div>

              <InputField
                label="Superuser Email"
                name="email"
                type="email"
                placeholder="owner@yourorg.com"
                icon={IoMail}
                value={superuserForm.email}
                onChange={handleSuperuserChange}
                required
                themeColor={getThemeColor()}
              />

              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                icon={MdLock}
                value={superuserForm.password}
                onChange={handleSuperuserChange}
                required
                themeColor={getThemeColor()}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loader}
                className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-2 shadow-lg active:scale-[0.98]"
                style={{
                  background: loader
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #8b5cf6, #d946ef)",
                  boxShadow: loader ? "none" : `0 8px 24px ${getGlowColor()}`,
                }}
              >
                {loader ? "Authenticating..." : "Access Control Panel"}
              </button>

              <div className="text-center pt-2">
                <NavLink to="/register-organization" className="text-xs text-[#a78bfa] hover:text-[#d8b4fe] font-bold underline transition-colors">
                  Create New Workspace / Org →
                </NavLink>
              </div>
            </form>
          )}

          {/* Footer note */}
          <p className="text-[9px] text-slate-700 text-center mt-6">
            © 2026 Attenteds Obsidian Technologies · By signing in you agree to our{" "}
            <NavLink to="/privacy-policy" className="hover:text-slate-500 underline transition-colors">
              Privacy Policy
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
