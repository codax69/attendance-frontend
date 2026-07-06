import { NavLink } from "react-router-dom";
import { AttendanceLogo } from "./LandingPage.jsx";
import { 
  FaGithub, 
  FaTwitter, 
  FaLinkedin,
  FaShieldAlt
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", to: "/" },
      { label: "Attendance", to: "/attendance" },
      { label: "History", to: "/history" },
      { label: "Admin Panel", to: "/admin" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "API Docs", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: FaGithub, href: "#", label: "GitHub" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
  { icon: MdEmail, href: "mailto:support@attenteds.com", label: "Email" },
];

const Footer = () => {
  return (
    <footer
      className="w-full relative overflow-hidden border-t border-white/[0.04]"
      style={{
        background: "rgba(2, 2, 5, 0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-0 w-72 h-32 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-28 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />
      </div>

      <div className="relative z-10 w-full px-6 pt-10 pb-6">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* Brand col */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AttendanceLogo className="w-5 h-5 text-[#06b6d4]" />
              <span className="text-lg font-black bg-gradient-to-r from-[#c3c0ff] to-[#4cd7f6] bg-clip-text text-transparent tracking-tight select-none">
                Attenteds
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Enterprise-grade QR attendance tracking built for high-performance teams. Real-time sync, compliance-ready reporting, and zero manual overhead.
            </p>

            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase">All Systems Operational</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading} className="md:col-span-2 flex flex-col gap-3">
              <h4 className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
                {heading}
              </h4>
              <div className="flex flex-col gap-2">
                {links.map(({ label, to, href }) =>
                  to ? (
                    <NavLink
                      key={label}
                      to={to}
                      className="text-xs text-slate-500 hover:text-[#06b6d4] transition-colors duration-200"
                    >
                      {label}
                    </NavLink>
                  ) : (
                    <a
                      key={label}
                      href={href}
                      className="text-xs text-slate-500 hover:text-[#06b6d4] transition-colors duration-200"
                    >
                      {label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Security / trust card */}
          <div className="md:col-span-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#4f46e5]/15 border border-[#4f46e5]/20 flex items-center justify-center">
                  <FaShieldAlt className="text-[#818cf8] text-xs" />
                </div>
                <span className="text-xs font-bold text-white">Enterprise Security</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All data encrypted with AES-256 at rest and TLS 1.3 in transit. SOC 2 Type II compliant.
              </p>
              <div className="flex flex-wrap gap-2">
                {["AES-256", "TLS 1.3", "SOC 2", "GDPR"].map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-0.5 text-[9px] font-bold text-[#818cf8] bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-600 font-mono">
            © 2026 Attenteds Obsidian Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">Cookies</a>
            <a href="#" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">Accessibility</a>
            <span className="text-[10px] font-mono text-slate-700">v1.0.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
