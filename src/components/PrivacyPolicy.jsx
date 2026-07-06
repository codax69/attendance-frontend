import { NavLink } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] py-10 px-4">
      {/* Background ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="max-w-3xl mx-auto w-full">
        {/* Back Link */}
        <NavLink 
          to="/" 
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-6 font-medium"
        >
          <FaArrowLeft size={10} />
          <span>Back to Landing Page</span>
        </NavLink>

        {/* Content Panel */}
        <div className="glass-panel border-white/[0.08] rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-6 mb-8">
            <span className="p-3 bg-brand-primary/10 text-brand-accent rounded-xl">
              <FaShieldAlt size={24} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Last updated: June 2026 | Attenteds
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            <p>
              At Attenteds, we are committed to protecting the privacy of our users. This Privacy Policy describes how your personal and attendance information is collected, used, and safeguarded when using our Digital Attendance Platform.
            </p>

            <div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                1. Information We Collect
              </h3>
              <p className="mb-2">
                To provide a functional and secure attendance registration system, we collect and process the following information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                <li><strong className="text-gray-300">Identity Details:</strong> Full name, age, enrollment number, class/trade branch, and roll number.</li>
                <li><strong className="text-gray-300">Authentication Data:</strong> Mobile number (used as unique login credential) and a hashed password.</li>
                <li><strong className="text-gray-300">Attendance Records:</strong> Timestamped entries generated when scanning authorized QR codes.</li>
                <li><strong className="text-gray-300">System Logs:</strong> Device connection logs, temporary session parameters, and token sync hashes.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                2. How We Use Your Data
              </h3>
              <p className="mb-2">
                The collected information is used strictly for academic and administrative operations, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                <li>Validating and registering daily presence for lectures and practical sessions.</li>
                <li>Generating monthly reports to track minimum attendance requirements (75% rule).</li>
                <li>Allowing teacher administrators to monitor student progress and notify departments of absentees.</li>
                <li>Sending critical announcements regarding scheduled maintenance or roster shifts.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                3. Data Security and Storage
              </h3>
              <p>
                Your security is our highest priority. All passwords are encrypted with industrial hashing standards before storage. Connection endpoints utilize secure transmission standards, and data access is strictly restricted to authorized administrative staff and designated faculty members.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                4. Data Sharing and Disclosure
              </h3>
              <p>
                We do not sell, trade, or transfer your personal credentials or attendance patterns to outside third parties. Your details are strictly retained inside our internal institute database for compliance, sync, and verification.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                5. Student Access and Rights
              </h3>
              <p>
                Students can log in to their dashboard at any time to review registered presence logs, modify passwords, or check notification logs. For modifying core details (like incorrect roll numbers or enrollment errors), please contact the trade administrator directly.
              </p>
            </div>

            <div className="pt-6 border-t border-white/[0.08] text-center">
              <NavLink to="/">
                <button className="py-2.5 px-6 text-white font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-[#5c5cf4] shadow-md shadow-brand-secondary/15 hover:shadow-brand-secondary/30 active:scale-98 transition transform hover:-translate-y-0.5 text-sm cursor-pointer inline-flex items-center gap-2">
                  <FaArrowLeft size={12} />
                  <span>Return to Home</span>
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
