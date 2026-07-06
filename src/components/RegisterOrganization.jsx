import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { registerOrganization } from "../utils/apiHelper";
import { toast } from "react-toastify";
import { ContextApi } from "../context/ContextApi";
import { AttendanceLogo } from "./LandingPage.jsx";
import {
  MdCorporateFare,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdLock,
  MdBusiness,
  MdVerifiedUser,
  MdCheckCircle,
  MdArrowForward,
  MdArrowBack,
} from "react-icons/md";
import {
  FaBuilding,
  FaGlobeAsia,
  FaIdBadge,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from "react-icons/fa";
import { IoMail } from "react-icons/io5";

// ─── Reusable field component ──────────────────────────────────────────────
const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  required = false,
  hint,
  children,
}) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={name}
      className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1"
    >
      {label}
      {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none" />
      )}
      {children ? (
        children
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/20 focus:bg-white/[0.05] transition-all duration-200 font-medium`}
        />
      )}
    </div>
    {hint && <p className="text-[9px] text-slate-600 font-medium pl-1">{hint}</p>}
  </div>
);

// ─── Step indicator ────────────────────────────────────────────────────────
const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-0 w-full mb-8">
    {steps.map((step, i) => (
      <div key={step.id} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 ${
              i < current
                ? "bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white shadow-lg shadow-[#4f46e5]/25"
                : i === current
                ? "bg-gradient-to-br from-[#4f46e5]/80 to-[#06b6d4]/80 text-white ring-2 ring-[#06b6d4]/40 shadow-lg shadow-[#06b6d4]/20"
                : "bg-white/[0.04] border border-white/[0.07] text-slate-600"
            }`}
          >
            {i < current ? <FaCheck size={11} /> : step.id}
          </div>
          <span
            className={`text-[8px] font-bold tracking-wider uppercase whitespace-nowrap ${
              i <= current ? "text-[#06b6d4]" : "text-slate-600"
            }`}
          >
            {step.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className="flex-1 h-px mx-2 mb-5">
            <div
              className="h-full transition-all duration-500"
              style={{
                background:
                  i < current
                    ? "linear-gradient(90deg, #4f46e5, #06b6d4)"
                    : "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────
const ORG_TYPES = [
  { value: "college", label: "College / University", icon: "🎓" },
  { value: "company", label: "Business Company", icon: "🏢" },
  { value: "school", label: "School", icon: "🏫" },
  { value: "ngo", label: "NGO / Non-Profit", icon: "🤝" },
  { value: "government", label: "Government Body", icon: "🏛️" },
  { value: "other", label: "Other", icon: "🌐" },
];

const STEPS = [
  { id: 1, label: "Org Info" },
  { id: 2, label: "Location" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Review" },
];

const RegisterOrganization = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 — Organization identity
    name: "",
    type: "college",
    email: "",
    phone: "",
    website: "",
    registrationNo: "",
    // Step 2 — Location
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    // Step 3 — Admin user
    adminName: "",
    adminEmail: "",
    adminMobileNo: "",
    adminPassword: "",
    adminDesignation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.name.trim()) { toast.error("Organization name is required."); return false; }
      if (!formData.email.trim()) { toast.error("Organization email is required."); return false; }
      if (!formData.type) { toast.error("Please select an organization type."); return false; }
    }
    if (step === 1) {
      if (!formData.address.trim()) { toast.error("Address is required."); return false; }
      if (!formData.city.trim()) { toast.error("City is required."); return false; }
      if (!formData.country.trim()) { toast.error("Country is required."); return false; }
    }
    if (step === 2) {
      if (!formData.adminName.trim()) { toast.error("Admin name is required."); return false; }
      if (!formData.adminEmail.trim()) { toast.error("Admin email is required."); return false; }
      if (!formData.adminMobileNo.trim()) { toast.error("Admin mobile number is required."); return false; }
      if (formData.adminPassword.length < 8) { toast.error("Password must be at least 8 characters."); return false; }
    }
    if (step === 3 && !agreed) {
      toast.error("Please accept the terms to proceed.");
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoader(true);
    try {
      await registerOrganization(formData);
      toast.success("Organization registered successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        "Failed to register organization. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoader(false);
    }
  };

  const selectedType = ORG_TYPES.find((t) => t.value === formData.type);

  return (
    <div className="relative min-h-[calc(100vh-52px)] flex items-start justify-center px-4 py-10 overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />
        <div className="absolute inset-0 grid-texture opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AttendanceLogo className="w-7 h-7 text-[#06b6d4]" />
            <span className="text-xl font-black bg-gradient-to-r from-[#c3c0ff] to-[#4cd7f6] bg-clip-text text-transparent">
              Attenteds
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            Register Your Organization
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Onboard your institution into the Multi-Tenant Attendance SaaS platform. Takes less than 3 minutes.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 md:p-8 shadow-2xl"
          style={{
            background: "rgba(10, 10, 18, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <StepIndicator steps={STEPS} current={step} />

          <form onSubmit={handleSubmit}>

            {/* ── STEP 1: Organization Identity ──────────────────────── */}
            {step === 0 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <MdCorporateFare className="text-[#06b6d4] text-xl" />
                  <h2 className="text-sm font-bold text-white">Organization Identity</h2>
                </div>

                {/* Org Type Cards */}
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2 block">
                    Organization Type <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ORG_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, type: t.value }))}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          formData.type === t.value
                            ? "bg-[#4f46e5]/15 border-[#4f46e5]/40 text-white shadow-lg shadow-[#4f46e5]/10"
                            : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:border-white/[0.10]"
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="text-[10px] font-bold leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Organization Name"
                    name="name"
                    placeholder="e.g. Stanford University"
                    icon={FaBuilding}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    hint="Your institution's official legal name"
                  />
                  <Field
                    label="Registration / Accreditation No."
                    name="registrationNo"
                    placeholder="e.g. REG-2024-00123"
                    icon={FaIdBadge}
                    value={formData.registrationNo}
                    onChange={handleChange}
                    hint="Optional — for compliance records"
                  />
                  <Field
                    label="Official Email"
                    name="email"
                    type="email"
                    placeholder="contact@org.edu"
                    icon={IoMail}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    hint="Used for system communications"
                  />
                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    icon={MdPhone}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Website URL"
                      name="website"
                      type="url"
                      placeholder="https://www.yourorg.edu"
                      icon={FaGlobeAsia}
                      value={formData.website}
                      onChange={handleChange}
                      hint="Optional"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Location & Address ────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <MdLocationOn className="text-[#06b6d4] text-xl" />
                  <h2 className="text-sm font-bold text-white">Location & Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field
                      label="Street Address"
                      name="address"
                      placeholder="e.g. 450 Serra Mall, Building 100"
                      icon={MdLocationOn}
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Field
                    label="City"
                    name="city"
                    placeholder="e.g. Mumbai"
                    icon={MdBusiness}
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="State / Province"
                    name="state"
                    placeholder="e.g. Maharashtra"
                    icon={MdBusiness}
                    value={formData.state}
                    onChange={handleChange}
                  />
                  <Field
                    label="Country"
                    name="country"
                    placeholder="e.g. India"
                    icon={FaGlobeAsia}
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="PIN / ZIP Code"
                    name="pincode"
                    placeholder="e.g. 400001"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>

                {/* Map placeholder */}
                <div className="w-full h-24 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center gap-2 mt-2">
                  <MdLocationOn className="text-[#06b6d4] text-xl" />
                  <span className="text-xs text-slate-500 font-medium">
                    {formData.city && formData.country
                      ? `📍 ${[formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(", ")}`
                      : "Address preview will appear here"}
                  </span>
                </div>
              </div>
            )}

            {/* ── STEP 3: Admin User ────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <MdVerifiedUser className="text-[#06b6d4] text-xl" />
                  <h2 className="text-sm font-bold text-white">Admin Account</h2>
                </div>
                <div className="p-3 rounded-xl bg-[#4f46e5]/5 border border-[#4f46e5]/15 text-[10px] text-slate-400 leading-relaxed">
                  This will be the <span className="text-[#818cf8] font-bold">Super Admin</span> account for your organization — with full access to manage students, attendance, and settings.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Admin Full Name"
                    name="adminName"
                    placeholder="e.g. Dr. Priya Sharma"
                    icon={MdPerson}
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Designation / Title"
                    name="adminDesignation"
                    placeholder="e.g. Principal, HR Manager"
                    icon={FaIdBadge}
                    value={formData.adminDesignation}
                    onChange={handleChange}
                    hint="Optional"
                  />
                  <Field
                    label="Admin Email"
                    name="adminEmail"
                    type="email"
                    placeholder="admin@yourorg.edu"
                    icon={MdEmail}
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    hint="Used for login & notifications"
                  />
                  <Field
                    label="Admin Mobile No."
                    name="adminMobileNo"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    icon={MdPhone}
                    value={formData.adminMobileNo}
                    onChange={handleChange}
                    required
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Password"
                      name="adminPassword"
                      placeholder="Min. 8 characters"
                      icon={MdLock}
                      value={formData.adminPassword}
                      onChange={handleChange}
                      required
                      hint="Use a strong password with uppercase, numbers, and symbols"
                    >
                      <div className="relative">
                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none" />
                        <input
                          id="adminPassword"
                          type={showPassword ? "text" : "password"}
                          name="adminPassword"
                          placeholder="Min. 8 characters"
                          value={formData.adminPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/20 focus:bg-white/[0.05] transition-all duration-200 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                      {/* Password strength */}
                      {formData.adminPassword.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4].map((lvl) => {
                            const len = formData.adminPassword.length;
                            const active =
                              lvl === 1
                                ? len >= 1
                                : lvl === 2
                                ? len >= 6
                                : lvl === 3
                                ? len >= 8 && /[A-Z]/.test(formData.adminPassword)
                                : len >= 10 && /[A-Z]/.test(formData.adminPassword) && /[0-9!@#$%]/.test(formData.adminPassword);
                            return (
                              <div
                                key={lvl}
                                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                  active
                                    ? lvl <= 1
                                      ? "bg-rose-500"
                                      : lvl <= 2
                                      ? "bg-amber-500"
                                      : lvl <= 3
                                      ? "bg-[#06b6d4]"
                                      : "bg-emerald-500"
                                    : "bg-white/[0.07]"
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                      {formData.adminPassword.length > 0 && (
                        <p className="text-[9px] text-slate-600 font-medium mt-1 pl-1">
                          {formData.adminPassword.length < 6
                            ? "Weak — too short"
                            : formData.adminPassword.length < 8
                            ? "Fair — add uppercase & symbols"
                            : /[A-Z]/.test(formData.adminPassword) && /[0-9!@#$%]/.test(formData.adminPassword)
                            ? "Strong ✓"
                            : "Good — add symbols for extra strength"}
                        </p>
                      )}
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Submit ───────────────────────────── */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <MdCheckCircle className="text-[#06b6d4] text-xl" />
                  <h2 className="text-sm font-bold text-white">Review & Confirm</h2>
                </div>

                {/* Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Org Details */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.05]">
                      <MdCorporateFare className="text-[#818cf8] text-base" />
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Organization</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Name", value: formData.name },
                        { label: "Type", value: `${selectedType?.icon} ${selectedType?.label}` },
                        { label: "Email", value: formData.email },
                        { label: "Phone", value: formData.phone || "—" },
                        { label: "Website", value: formData.website || "—" },
                        { label: "Reg. No.", value: formData.registrationNo || "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">{label}</span>
                          <span className="text-[10px] text-white font-bold text-right truncate max-w-[160px]" title={value}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.05]">
                      <MdLocationOn className="text-[#06b6d4] text-base" />
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Location</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Address", value: formData.address || "—" },
                        { label: "City", value: formData.city || "—" },
                        { label: "State", value: formData.state || "—" },
                        { label: "Country", value: formData.country },
                        { label: "PIN Code", value: formData.pincode || "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">{label}</span>
                          <span className="text-[10px] text-white font-bold text-right truncate max-w-[140px]" title={value}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin */}
                  <div className="md:col-span-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.05]">
                      <MdVerifiedUser className="text-emerald-400 text-base" />
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Admin Account</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { label: "Name", value: formData.adminName },
                        { label: "Email", value: formData.adminEmail },
                        { label: "Mobile", value: formData.adminMobileNo },
                        { label: "Designation", value: formData.adminDesignation || "—" },
                        { label: "Password", value: "••••••••" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500 font-semibold">{label}</span>
                          <span className="text-[10px] text-white font-bold truncate" title={value}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div
                  className="p-4 rounded-2xl border cursor-pointer transition-all duration-200"
                  style={{
                    background: agreed ? "rgba(6, 182, 212, 0.05)" : "rgba(255,255,255,0.01)",
                    borderColor: agreed ? "rgba(6, 182, 212, 0.25)" : "rgba(255,255,255,0.07)",
                  }}
                  onClick={() => setAgreed((v) => !v)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                        agreed
                          ? "bg-[#06b6d4] border-[#06b6d4]"
                          : "bg-transparent border-white/[0.2]"
                      }`}
                    >
                      {agreed && <FaCheck className="text-black text-[9px]" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      I confirm that all the information provided is accurate. I agree to the{" "}
                      <span className="text-[#06b6d4] font-bold cursor-pointer hover:underline">Terms of Service</span> and{" "}
                      <NavLink to="/privacy-policy" className="text-[#06b6d4] font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                        Privacy Policy
                      </NavLink>
                      {" "}of Attenteds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ────────────────────────────────── */}
            <div className={`flex items-center gap-3 mt-7 ${step > 0 ? "justify-between" : "justify-end"}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <MdArrowBack size={16} /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl primary-gradient text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-[#4f46e5]/20"
                >
                  Continue <MdArrowForward size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loader || !agreed}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-xl ${
                    loader || !agreed
                      ? "bg-white/[0.05] text-slate-500 border border-white/[0.07] cursor-not-allowed"
                      : "primary-gradient text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-[#4f46e5]/25"
                  }`}
                >
                  {loader ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={18} /> Launch Organization
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-[#06b6d4] hover:text-[#38bdf8] font-bold underline transition-colors"
          >
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterOrganization;
