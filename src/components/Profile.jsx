import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { InfinitySpin } from "react-loader-spinner";
import { getAttendanceRecordsForUser } from "../utils/apiHelper.js";

const Profile = () => {
  const { mobileNo } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ active: 0, present: 0, percentage: 100 });
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/user/p/${mobileNo}`);
      setUserData(response.data.data);
      
      // Fetch dynamic user history to compute statistics
      const logs = await getAttendanceRecordsForUser(mobileNo);
      // Scope to current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const parseAttendanceDate = (value) => {
        if (!value || typeof value !== "string") return null;
        const trimmed = value.trim();
        const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) {
          const date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`);
          return Number.isNaN(date.getTime()) ? null : date;
        }

        const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slashMatch) {
          const [, first, second, year] = slashMatch;
          const day = parseInt(first, 10);
          const month = parseInt(second, 10);
          if (day > 12 && month >= 1 && month <= 12) {
            const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`);
            return Number.isNaN(date.getTime()) ? null : date;
          }
          if (month > 12 && day >= 1 && day <= 12) {
            const date = new Date(`${year}-${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}T00:00:00Z`);
            return Number.isNaN(date.getTime()) ? null : date;
          }
          const dmyDate = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`);
          if (!Number.isNaN(dmyDate.getTime())) return dmyDate;
          const mdyDate = new Date(`${year}-${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}T00:00:00Z`);
          return Number.isNaN(mdyDate.getTime()) ? null : mdyDate;
        }

        const fallback = new Date(trimmed);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
      };

      const monthlyLogs = (logs || []).filter((r) => {
        const recordDate = parseAttendanceDate(r?.date);
        if (!recordDate) return false;
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });

      const active = monthlyLogs.filter(l => l.status !== "LEAVE").length;
      const present = monthlyLogs.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
      const percentage = active > 0 ? Math.round((present / active) * 100) : 100;
      
      setStats({ active, present, percentage });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (mobileNo) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileNo]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <InfinitySpin visible={true} width="200" color="#f97316" ariaLabel="infinity-spin-loading" />
        <p className="text-gray-400 text-sm font-medium mt-2">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4 text-center">
        <div className="glass-panel border-rose-500/20 bg-rose-500/[0.01] rounded-2xl p-6 shadow-lg">
          <h2 className="text-rose-500 font-bold font-display text-lg mb-2">Error Loading Profile</h2>
          <p className="text-gray-300 text-sm mb-4">Could not load profile details for this student.</p>
          <NavLink to="/" className="inline-flex px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white hover:bg-white/[0.08] transition">
            Back to Dashboard
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      {/* Ambient Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="glass-panel border-white/[0.08] p-8 md:p-12 rounded-2xl relative z-10 hover:border-white/[0.12] transition duration-300 shadow-2xl mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-3 text-center order-last md:order-first mt-16 md:mt-0 gap-2 border border-white/[0.05] bg-white/[0.01] rounded-2xl p-4">
            <div>
              <p className="font-extrabold text-brand-secondary text-xl md:text-2xl font-display">{stats.active}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Active</p>
            </div>
            <div>
              <p className="font-extrabold text-brand-secondary text-xl md:text-2xl font-display">{stats.present}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Present</p>
            </div>
            <div>
              <p className="font-extrabold text-brand-secondary text-xl md:text-2xl font-display">{stats.percentage}%</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Monthly</p>
            </div>
          </div>

          {/* Profile Avatar Center */}
          <div className="relative flex justify-center">
            <div className="w-36 h-36 bg-dark-bg border-4 border-brand-orange/30 rounded-full shadow-2xl absolute -top-28 md:-top-24 flex items-center justify-center text-brand-orange hover:border-brand-rose/65 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/10 to-brand-rose/10 pointer-events-none" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 fill-brand-orange/80"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Action Buttons Right */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end mt-12 md:mt-0 items-center w-full">
            <NavLink to="/attendance" className="w-full sm:w-auto">
              <button className="w-full text-[#1b211a] py-2 px-5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 font-bold text-sm active:scale-98 transition transform hover:-translate-y-0.5">
                Attendance
              </button>
            </NavLink>
            <NavLink to="/history" className="w-full sm:w-auto">
              <button className="w-full text-gray-300 hover:text-white py-2 px-5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] font-semibold text-sm active:scale-98 transition transform hover:-translate-y-0.5">
                Check History
              </button>
            </NavLink>
          </div>
        </div>

        {/* Student Details Info Block */}
        <div className="mt-16 text-center border-t border-white/[0.06] pt-10">
          <h1 className="text-3xl font-bold text-white font-display">
            {userData.fullname || "Student Name"}
            {userData.age && (
              <span className="font-light text-gray-400 text-xl ml-2">({userData.age} yrs)</span>
            )}
          </h1>
          <p className="font-medium text-brand-orange mt-2 text-sm tracking-wide">{userData.mobileNo || "No Mobile Registered"}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-8 text-sm">
            <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Enrollment:</span>
              <strong className="text-gray-200 ml-1.5 font-semibold">{userData.enrollmentNo || "N/A"}</strong>
            </div>
            <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Class:</span>
              <strong className="text-gray-200 ml-1.5 font-semibold">{userData.class || "N/A"}</strong>
            </div>
            <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center">
              <span className="text-gray-400">Roll No:</span>
              <strong className="text-gray-200 ml-1.5 font-semibold">{userData.rollNo || "N/A"}</strong>
            </div>
            <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-gray-400">Institute:</span>
              <strong className="text-gray-200 ml-1.5 font-semibold">I.C.Desai ITI-Pardi</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
