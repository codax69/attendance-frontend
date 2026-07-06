import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { FaPlayCircle, FaBolt, FaCloud } from "react-icons/fa";
import {
  MdCorporateFare,
  MdQrCodeScanner,
  MdSync,
  MdHistory,
  MdVerifiedUser,
  MdNotificationsActive,
  MdExpandMore,
  MdSecurity,
} from "react-icons/md";

export const AttendanceLogo = ({ className = "w-6 h-6 text-brand-secondary", hasContainer = false }) => {
  const svgEl = (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 16L11 18L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (!hasContainer) return svgEl;

  return (
    <div className="relative flex items-center justify-center p-3 bg-brand-primary/10 rounded-xl border border-brand-secondary/20 shadow-lg shadow-brand-primary/5 group-hover:scale-105 transition-all duration-300">
      {/* Animated glow ring */}
      <div className="absolute inset-0 bg-brand-secondary/20 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {svgEl}
    </div>
  );
};

// Avatar placeholder for when image fails or is unavailable
const Avatar = ({ initial, color = "#4f46e5", size = 8, textSize = "sm" }) => (
  <div
    className={`inline-flex items-center justify-center w-${size} h-${size} rounded-full font-bold text-${textSize} text-white flex-shrink-0`}
    style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, border: `2px solid ${color}44` }}
  >
    {initial}
  </div>
);

// QR Interface visual placeholder
const QrVisual = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      <div className="grid grid-cols-7 gap-1 p-4 bg-white/5 rounded-xl border border-white/10">
        {Array.from({ length: 49 }).map((_, i) => {
          const isTopLeft = (i < 3 || (i >= 7 && i < 10) || (i >= 14 && i < 17));
          const isTopRight = (i >= 4 && i < 7) || (i >= 11 && i < 14) || (i >= 18 && i < 21);
          const isBottomLeft = (i >= 28 && i < 31) || (i >= 35 && i < 38) || (i >= 42 && i < 45);
          const isCorner = isTopLeft || isTopRight || isBottomLeft;
          const isData = !isCorner && (i * 7 + i * 3) % 5 < 2;
          return (
            <div
              key={i}
              className={`w-4 h-4 rounded-sm ${
                isCorner ? "bg-[#4f46e5]/70" : isData ? "bg-white/20" : "bg-white/5"
              }`}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent shadow-[0_0_8px_#06b6d4]" />
      </div>
    </div>
  </div>
);

// Analytics dashboard visual placeholder
const AnalyticsVisual = () => (
  <div className="w-full h-full bg-[#0a0a14] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-bold text-[#06b6d4] uppercase tracking-wider">Attendance Analytics</div>
      <div className="flex gap-1">
        {[1, 2, 3].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/20" />)}
      </div>
    </div>
    <div className="flex items-end gap-2 flex-1">
      {[65, 80, 75, 92, 88, 70, 85].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm"
            style={{
              height: `${h * 1.4}px`,
              background: i === 3 ? "linear-gradient(180deg, #06b6d4, #4f46e5)" : "rgba(255,255,255,0.08)",
            }}
          />
          <div className="text-[7px] text-slate-500">{["M", "T", "W", "T", "F", "S", "S"][i]}</div>
        </div>
      ))}
    </div>
    <div className="pt-2 border-t border-white/5 flex justify-between">
      <span className="text-[9px] text-slate-400">Avg: <span className="text-emerald-400 font-bold">82%</span></span>
      <span className="text-[9px] text-slate-400">Target: <span className="text-[#4f46e5] font-bold">75%</span></span>
    </div>
  </div>
);

const LandingPage = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      axios.get("/api/v1/user/get-current-user")
        .then(res => {
          setUserData(res.data.data.user);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching user data on landing page:", err);
          setLoading(false);
        });
    }
  }, [isLoggedIn]);

  // Dynamic Mouse-Following Nebula Glow Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const glows = document.querySelectorAll('.nebula-glow');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      glows.forEach((glow, index) => {
        const speed = (index + 1) * 20;
        glow.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-[#e4e1ee] select-none pt-[30px] px-4 overflow-hidden">
      {/* Global Layout Assets */}
      <div className="nebula-glow top-[-200px] left-[-100px]" />
      <div className="nebula-glow bottom-[-200px] right-[-100px] opacity-40" />
      <div className="fixed inset-0 grid-texture opacity-30 pointer-events-none" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center py-12">
          
          <div className="z-10 text-left">
            <span className="font-semibold text-xs tracking-widest text-[#06b6d4] uppercase mb-4 inline-block">
              Enterprise-Grade Attendance
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#38bdf8] tracking-tight mb-4 select-none leading-tight">
              Smart Attendance. <br/>
              <span className="text-[#c3c0ff]">Instantly Verified.</span>
            </h1>
            <p className="text-base text-slate-400 max-w-lg mb-8 leading-relaxed">
              QR-powered attendance tracking designed for high-performance teams. Eliminate manual logs with automated verification, real-time sync, and compliance-ready reporting.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <NavLink to="/login">
                <button className="primary-gradient text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-2xl hover:scale-105 hover:shadow-[#4f46e5]/30 transition-all cursor-pointer">
                  Get Started
                </button>
              </NavLink>
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer">
                <FaPlayCircle className="text-[#06b6d4] w-5 h-5" />
                <span className="font-semibold text-white text-sm">Watch Demo</span>
              </button>
            </div>

            {/* Org registration call-to-action */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <NavLink to="/register-organization">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#4f46e5]/25 bg-[#4f46e5]/5 hover:bg-[#4f46e5]/10 hover:border-[#4f46e5]/40 transition-all duration-200 cursor-pointer group w-fit mb-8">
                <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 border border-[#4f46e5]/30 flex items-center justify-center flex-shrink-0">
                  <MdCorporateFare className="text-[#818cf8] text-base" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white group-hover:text-[#c3c0ff] transition-colors">Register Your Organization</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Set up a college, company or institution workspace</div>
                </div>
                <svg className="w-4 h-4 text-slate-500 group-hover:text-[#818cf8] ml-1 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </NavLink>
            
            <div className="flex items-center gap-4 p-2 pr-4 rounded-full bg-[#1b1b24]/60 border border-white/5 w-fit">
              <div className="flex -space-x-2 overflow-hidden p-1">
                {[
                  { i: "A", c: "#4f46e5" },
                  { i: "M", c: "#06b6d4" },
                  { i: "R", c: "#8b5cf6" },
                ].map(({ i, c }, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs text-white ring-2 ring-[#13121b] flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}88)` }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
                </div>
                <p className="text-xs text-slate-400 font-medium">Trusted by 2,000+ teams</p>
              </div>
            </div>
          </div>

          {/* Portal Card (Bento/Interactive) */}
          <div className="relative group w-full max-w-sm mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4f46e5]/15 to-[#06b6d4]/15 rounded-2xl blur-3xl group-hover:opacity-100 opacity-50 transition duration-1000"></div>
            <div className="glass-card p-5 md:p-6 rounded-2xl shadow-2xl relative animate-float neon-border-indigo">
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#ec4899]/40"></div>
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]/40"></div>
                  <div className="w-2 h-2 rounded-full bg-[#06b6d4]/40"></div>
                </div>
                <span className="font-mono text-[9px] text-slate-500">auth_v2.terminal</span>
              </div>
              
              <div className="space-y-4 text-left">
                {loading ? (
                  <div className="py-6 text-slate-400 text-xs animate-pulse font-normal text-center">Loading portal...</div>
                ) : isLoggedIn && userData ? (
                  <div className="text-center flex flex-col items-center py-3">
                    <div className="w-12 h-12 bg-[#4f46e5]/25 rounded-full flex items-center justify-center border border-[#4f46e5]/30 mb-3 text-[#06b6d4] font-bold text-base">
                      {userData.fullname?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Welcome back, {userData.fullname}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 mb-4">
                      Logged in as {userData.role === "admin" ? "Teacher Admin" : `Student (${userData.class || "N/A"})`}
                    </p>
                    <NavLink to="/" className="w-full">
                      <button className="w-full py-2.5 px-3 text-white font-bold rounded-lg primary-gradient hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer shadow-lg">
                        Go to Dashboard
                      </button>
                    </NavLink>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block">
                        ORGANIZATION DOMAIN
                      </label>
                      <div className="relative">
                        <MdCorporateFare className="absolute left-3 top-1/2 -translate-y-1/2 text-[#818cf8] text-base" />
                        <input 
                          className="w-full bg-[#0a0a0f] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/30 outline-none transition-all font-medium" 
                          placeholder="acme-corp.attenteds.com" 
                          type="text"
                          readOnly
                          value="acme-corp.attenteds.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <NavLink to="/login" className="w-full">
                        <button className="w-full py-2 border border-white/5 rounded-lg text-xs font-semibold hover:bg-white/[0.02] transition-all text-center text-slate-300">
                          Login
                        </button>
                      </NavLink>
                      <NavLink to="/register" className="w-full">
                        <button className="w-full py-2 primary-gradient rounded-lg text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all text-center">
                          Register
                        </button>
                      </NavLink>
                    </div>

                    {/* Register Organization divider */}
                    <div className="pt-3 border-t border-white/[0.04]">
                      <NavLink to="/register-organization">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#4f46e5]/20 bg-[#4f46e5]/5 hover:bg-[#4f46e5]/10 hover:border-[#4f46e5]/35 transition-all cursor-pointer group">
                          <div className="w-7 h-7 rounded-lg bg-[#4f46e5]/20 flex items-center justify-center flex-shrink-0">
                            <MdCorporateFare className="text-[#818cf8] text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-white leading-tight">Register Organization</div>
                            <div className="text-[8px] text-slate-500 mt-0.5">Set up a college or company workspace</div>
                          </div>
                          <svg className="w-3 h-3 text-slate-500 group-hover:text-[#818cf8] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </NavLink>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400">System Status</span>
                        <span className="flex items-center gap-1 text-[8.5px] text-[#06b6d4] font-bold font-mono">
                          <span className="w-1 h-1 rounded-full bg-[#06b6d4] animate-pulse"></span> OPERATIONAL
                        </span>
                      </div>
                      <div className="h-0.5 bg-[#101018] rounded-full overflow-hidden">
                        <div className="h-full bg-[#06b6d4] w-3/4"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

        </section>

        {/* Stats Counter */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 border-l border-white/5 text-left">
              <h3 className="text-4xl font-extrabold text-white">99.9<span className="text-[#4f46e5]">%</span></h3>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-1">UPTIME SLAS</p>
            </div>
            <div className="p-6 border-l border-white/5 text-left">
              <h3 className="text-4xl font-extrabold text-white">15<span className="text-[#06b6d4]">M+</span></h3>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-1">SCANS PROCESSED</p>
            </div>
            <div className="p-6 border-l border-white/5 text-left">
              <h3 className="text-4xl font-extrabold text-white">40<span className="text-[#f59e0b]">%</span></h3>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-1">EFFICIENCY GAIN</p>
            </div>
            <div className="p-6 border-l border-white/5 text-left">
              <h3 className="text-4xl font-extrabold text-white">0.2<span className="text-[#4f46e5]">s</span></h3>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-1">SYNC LATENCY</p>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-left">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Engineered for Precision</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Modern tools for modern workforces. Our core features deliver speed, security, and actionable insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Large Card 1 */}
            <div className="md:col-span-2 lg:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 hover:border-[#4f46e5]/20 transition-all flex flex-col justify-between group">
              <div>
                <MdQrCodeScanner className="text-[#4f46e5] text-4xl mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">QR Attendance</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Dynamic QR generation for instant, contactless check-ins. Geo-fencing support ensures personnel are where they need to be.
                </p>
              </div>
              <div className="mt-8 h-48 bg-[#0a0a14] rounded-2xl relative overflow-hidden border border-white/5">
                <QrVisual />
              </div>
            </div>

            {/* Large Card 2 */}
            <div className="md:col-span-1 lg:col-span-3 glass-card p-6 md:p-8 rounded-3xl border border-white/5 hover:border-[#06b6d4]/20 transition-all group flex flex-col justify-between">
              <div>
                <MdSync className="text-[#06b6d4] text-4xl mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Sync</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Proprietary socket architecture ensures data updates across all dashboards in less than 200ms globally.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
                    <FaBolt className="text-[#06b6d4] text-xs" />
                  </div>
                  <div className="flex-1 h-1 bg-[#1f1f28] rounded-full">
                    <div className="h-full bg-[#06b6d4] w-full rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 flex items-center justify-center">
                    <FaCloud className="text-[#4f46e5] text-xs" />
                  </div>
                  <div className="flex-1 h-1 bg-[#1f1f28] rounded-full">
                    <div className="h-full bg-[#4f46e5] w-[85%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Features */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
              <MdHistory className="text-[#f59e0b] text-3xl mb-4" />
              <h4 className="text-sm font-bold text-white mb-1">History</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immutable logs with detailed timestamps and device metadata for every event.
              </p>
            </div>
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
              <MdVerifiedUser className="text-[#4f46e5] text-3xl mb-4" />
              <h4 className="text-sm font-bold text-white mb-1">Compliance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated audit trails ready for SOX, HIPAA, and GDPR regulatory requirements.
              </p>
            </div>
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
              <MdNotificationsActive className="text-[#06b6d4] text-3xl mb-4" />
              <h4 className="text-sm font-bold text-white mb-1">Notifications</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart alerts for missing check-ins, late arrivals, and unusual pattern detection.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-6xl mx-auto px-4 py-12 bg-[#0e0d16]/40 border-y border-white/5 text-left">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 text-[120px] font-bold text-white/5 pointer-events-none">“</div>
              <p className="text-2xl md:text-3xl leading-snug text-white italic mb-8 relative z-10 font-medium">
                "Attenteds has completely redefined how we manage 400+ remote engineers. The real-time sync and compliance reporting saved us 20 hours of admin work per week."
              </p>
              <div className="flex items-center gap-4">
                <Avatar initial="M" color="#4f46e5" size={14} textSize="lg" />
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Thorne</h4>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                    VP OF OPERATIONS, NEBULA SYNDICATE
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block glass-card p-6 rounded-[40px] border border-white/5 transform rotate-3 overflow-hidden">
              <AnalyticsVisual />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12">Common Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <details className="group glass-card rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-white/5">
                <span className="text-sm font-bold text-white">How does geo-fencing work?</span>
                <MdExpandMore className="transition-transform group-open:rotate-180 text-[#06b6d4] text-xl" />
              </summary>
              <div className="p-6 pt-0 text-slate-400 text-xs leading-relaxed text-left border-t border-white/5 mt-2">
                Our system utilizes high-precision GPS and IP tracking to verify that the scanning device is within a pre-defined virtual boundary (the "fence"). If a scan happens outside this zone, it's flagged as unauthorized.
              </div>
            </details>
            <details className="group glass-card rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-white/5">
                <span className="text-sm font-bold text-white">Is data encrypted during transfer?</span>
                <MdExpandMore className="transition-transform group-open:rotate-180 text-[#06b6d4] text-xl" />
              </summary>
              <div className="p-6 pt-0 text-slate-400 text-xs leading-relaxed text-left border-t border-white/5 mt-2">
                Yes, all data is encrypted using AES-256 at rest and TLS 1.3 in transit. We follow enterprise-level security protocols to ensure your workforce data remains private and protected.
              </div>
            </details>
            <details className="group glass-card rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-white/5">
                <span className="text-sm font-bold text-white">Can we integrate with our existing HRMS?</span>
                <MdExpandMore className="transition-transform group-open:rotate-180 text-[#06b6d4] text-xl" />
              </summary>
              <div className="p-6 pt-0 text-slate-400 text-xs leading-relaxed text-left border-t border-white/5 mt-2">
                Absolutely. We provide a robust REST API and pre-built connectors for Workday, BambooHR, and SAP SuccessFactors to keep your systems in perfect harmony.
              </div>
            </details>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="glass-card p-8 md:p-16 rounded-[48px] border border-[#4f46e5]/20 bg-gradient-to-br from-[#4f46e5]/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 grid-texture opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">14-Day Free Trial · No Credit Card</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5">Ready to upgrade your system?</h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Join the elite organizations using Attenteds to power their daily operations. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink to="/register-organization">
                  <button className="primary-gradient text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl hover:scale-105 hover:shadow-[#4f46e5]/30 transition-all cursor-pointer flex items-center gap-2 justify-center">
                    <MdCorporateFare className="text-lg" />
                    Register Your Organization
                  </button>
                </NavLink>
                <NavLink to="/login">
                  <button className="bg-white/5 px-8 py-3.5 rounded-xl font-bold text-base border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-slate-300">
                    Already have an account? Sign In
                  </button>
                </NavLink>
              </div>
              <p className="text-[10px] text-slate-600 mt-6">
                Individual user? <NavLink to="/register" className="text-[#06b6d4] hover:underline">Register as a student or employee →</NavLink>
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;
