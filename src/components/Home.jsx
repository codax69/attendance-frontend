import { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ContextApi } from "../context/ContextApi.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { getNotifications, getAttendanceRecordsForUser, attendanceCheckout } from "../utils/apiHelper.js";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import {
  FaQrcode,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaShieldAlt,
  FaSignOutAlt,
  FaCalendarCheck,
  FaTachometerAlt,
} from "react-icons/fa";
import { MdHistory, MdPendingActions, MdComputer, MdLogout } from "react-icons/md";

const StatCard = ({ label, value, subLabel, subIcon, colorClass, borderClass }) => (
  <div className={`glass-card rounded-2xl p-5 card-lift ${borderClass} flex flex-col gap-2`}>
    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</span>
    <div className={`text-4xl font-black font-stat ${colorClass}`}>{value}</div>
    <div className={`text-[10px] flex items-center gap-1.5 font-semibold ${colorClass} opacity-70`}>
      {subIcon} {subLabel}
    </div>
  </div>
);

const Home = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const { setIsLoggedIn } = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, rate: 100 });
  const navigate = useNavigate();

  const getTodayDateStr = () => {
    const todayObj = new Date();
    const dd = String(todayObj.getDate()).padStart(2, "0");
    const mm = String(todayObj.getMonth() + 1).padStart(2, "0");
    const yyyy = todayObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoader(true);
      const userRes = await axios.get("/api/v1/user/get-current-user");
      const user = userRes.data.data.user;
      setUserData(user);

      const logs = await getAttendanceRecordsForUser(user.mobileNo);
      setAttendanceLogs(logs || []);

      const present = logs.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
      const absent = logs.filter(r => r.status === "ABSENT").length;
      const late = logs.filter(r => r.status === "LATE").length;
      const totalActive = logs.filter(r => r.status !== "LEAVE").length;
      const rate = totalActive > 0 ? Math.round((present / totalActive) * 100) : 100;

      setStats({ present, absent, late, rate });

      const notifs = await getNotifications();
      setNotifications(notifs);

      setLoader(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.get("/api/v1/user/logout");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleCheckOut = async () => {
    const todayStr = getTodayDateStr();
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    try {
      setLoader(true);
      await attendanceCheckout(todayStr, timeStr);
      toast.success("Checked out successfully for today!");
      await fetchDashboardData();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to check out.";
      toast.error(errMsg);
    } finally {
      setLoader(false);
    }
  };

  const todayStr = getTodayDateStr();
  const todayRecord = attendanceLogs.find(r => r.date === todayStr);
  const firstName = userData.fullname ? userData.fullname.split(" ")[0] : "User";
  const rateColor =
    stats.rate >= 75
      ? "text-emerald-400"
      : stats.rate >= 50
      ? "text-amber-400"
      : "text-rose-400";

  return (
    <>
      {loader ? (
        <div className="fixed inset-0 bg-[#030712]/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <InfinitySpin visible={true} width="200" color="#06b6d4" ariaLabel="infinity-spin-loading" />
            <p className="text-white text-sm font-bold animate-pulse tracking-wider">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="relative home-fullscreen text-[#e4e1ee] select-none overflow-hidden">
          {/* Full-screen background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="nebula-glow" style={{ top: "-150px", left: "-100px" }} />
            <div className="nebula-glow opacity-30" style={{ bottom: "-150px", right: "-100px" }} />
            <div className="absolute inset-0 grid-texture opacity-20" />
          </div>

          <div className="relative z-10 w-full h-full">
            {/* Top greeting bar */}
            <div className="w-full px-6 pt-6 pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#06b6d4] uppercase mb-1">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black gradient-text-hero leading-tight">
                    Good{" "}
                    {new Date().getHours() < 12
                      ? "Morning"
                      : new Date().getHours() < 18
                      ? "Afternoon"
                      : "Evening"}
                    , {firstName} 👋
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    {userData.departmentName ? `${userData.departmentName} · ` : ""}
                    {userData.class
                      ? `Class ${userData.class}`
                      : userData.designation || "Attendance Dashboard"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Attendance rate badge */}
                  <div className="glass-card rounded-2xl px-5 py-3 neon-border-cyan flex items-center gap-3">
                    <div className="relative">
                      <div className={`text-3xl font-black font-stat ${rateColor}`}>{stats.rate}%</div>
                      <div className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Attendance</div>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={stats.rate >= 75 ? "#10b981" : stats.rate >= 50 ? "#f59e0b" : "#f43f5e"}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${stats.rate} ${100 - stats.rate}`}
                          strokeDashoffset="0"
                        />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center text-[8px] font-black ${rateColor}`}>
                        {stats.rate >= 75 ? "✓" : "!"}
                      </div>
                    </div>
                  </div>

                  {/* User info badge */}
                  <div className="glass-card rounded-2xl px-4 py-3 neon-border-indigo flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/30 flex items-center justify-center text-base font-black text-[#818cf8]">
                      {userData.fullname?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">
                        {userData.fullname || "User"}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {userData.role === "superuser"
                          ? "Super User"
                          : userData.role === "admin"
                          ? userData.designation || "Admin"
                          : `Student · ${userData.class || "N/A"}`}
                      </div>
                      <div className="text-[9px] text-[#4f46e5] font-mono mt-0.5">
                        {userData.employeeId
                          ? `#${userData.employeeId}`
                          : userData.rollNo
                          ? `Roll: ${userData.rollNo}`
                          : userData.studentId
                          ? `ID: ${userData.studentId}`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main dashboard grid */}
            <div className="w-full px-6 pt-5 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-5">

              {/* LEFT: Stats + Recent Activity */}
              <div className="xl:col-span-8 flex flex-col gap-5">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Present Days"
                    value={stats.present}
                    subLabel="Check-ins logged"
                    subIcon={<FaChartLine size={9} />}
                    colorClass="text-emerald-400"
                    borderClass="neon-border-emerald"
                  />
                  <StatCard
                    label="Absent Days"
                    value={stats.absent}
                    subLabel="Missed marks"
                    subIcon={<FaExclamationTriangle size={9} />}
                    colorClass="text-rose-400"
                    borderClass="neon-border-rose"
                  />
                  <StatCard
                    label="Late Days"
                    value={stats.late}
                    subLabel="Late arrivals"
                    subIcon={<FaClock size={9} />}
                    colorClass="text-amber-400"
                    borderClass="neon-border-amber"
                  />
                  <StatCard
                    label="Total Records"
                    value={attendanceLogs.length}
                    subLabel="All time logs"
                    subIcon={<FaCalendarCheck size={9} />}
                    colorClass="text-[#06b6d4]"
                    borderClass="neon-border-cyan"
                  />
                </div>

                {/* Recent Activity */}
                <div className="glass-card rounded-2xl overflow-hidden neon-border flex-1">
                  <div className="px-5 py-4 border-b border-white/[0.04] flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                        <MdHistory className="text-[#06b6d4] text-sm" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                      {attendanceLogs.length > 0 && (
                        <span className="px-2 py-0.5 bg-[#06b6d4]/10 text-[#06b6d4] text-[9px] font-bold rounded-full">
                          {attendanceLogs.length}
                        </span>
                      )}
                    </div>
                    <NavLink
                      to="/history"
                      className="text-[10px] text-[#06b6d4] font-bold tracking-wider uppercase hover:underline flex items-center gap-1"
                    >
                      View All <span>→</span>
                    </NavLink>
                  </div>

                  <div className="divide-y divide-white/[0.03]">
                    {attendanceLogs.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-3">
                          <FaQrcode className="text-2xl text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-xs font-semibold">No activity logs recorded</p>
                        <p className="text-slate-500 text-[10px] mt-1">Scan a QR code to check in</p>
                      </div>
                    ) : (
                      attendanceLogs.slice(0, 6).map((log, index) => (
                        <div
                          key={log.id || index}
                          className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                                log.status === "PRESENT"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : log.status === "LATE"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : log.status === "ABSENT"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              }`}
                            >
                              {log.status === "PRESENT" && <FaCheckCircle />}
                              {log.status === "LATE" && <FaClock />}
                              {log.status === "ABSENT" && <FaTimesCircle />}
                              {log.status === "LEAVE" && <FaShieldAlt />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {log.status === "PRESENT"
                                  ? "Present"
                                  : log.status === "LATE"
                                  ? "Late Check-In"
                                  : log.status === "ABSENT"
                                  ? "Absent"
                                  : "On Leave"}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                {log.date} &nbsp;·&nbsp; {log.time || "N/A"}
                                {log.checkOut ? ` → ${log.checkOut}` : ""}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              log.status === "PRESENT"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : log.status === "LATE"
                                ? "bg-amber-500/10 text-amber-400"
                                : log.status === "ABSENT"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Today Status + Quick Actions + Health */}
              <div className="xl:col-span-4 flex flex-col gap-5">

                {/* Today's Status */}
                <div className="glass-card rounded-2xl p-5 neon-border flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
                        <MdComputer className="text-[#818cf8] text-sm" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Today's Status</h3>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">{todayStr}</span>
                  </div>

                  <div
                    className={`rounded-xl p-4 border ${
                      todayRecord
                        ? todayRecord.status === "LATE"
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-white/[0.01] border-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-white">Daily Session</div>
                      {todayRecord ? (
                        <div
                          className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            todayRecord.status === "LATE"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {todayRecord.status}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                          <MdPendingActions className="text-xs" /> PENDING
                        </div>
                      )}
                    </div>

                    {todayRecord ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Check-In</span>
                          <span className="text-emerald-400 font-mono font-bold">{todayRecord.time}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Check-Out</span>
                          <span className={`font-mono font-bold ${todayRecord.checkOut ? "text-amber-400" : "text-slate-500"}`}>
                            {todayRecord.checkOut || "Pending"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 text-center py-2">
                        No check-in recorded yet today
                      </div>
                    )}
                  </div>

                  {todayRecord && !todayRecord.checkOut && (
                    <button
                      onClick={handleCheckOut}
                      className="w-full py-3 text-xs font-bold text-black bg-[#06b6d4] hover:bg-[#08d9fc] rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#06b6d4]/20"
                    >
                      <FaSignOutAlt /> Check Out Now
                    </button>
                  )}

                  <div className="text-center font-mono text-[9px] text-slate-600">
                    Tenant: {userData.organizationId || "system"}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-5 neon-border-indigo">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
                      <FaTachometerAlt className="text-[#818cf8] text-xs" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NavLink
                      to="/attendance"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#4f46e5]/10 to-[#06b6d4]/10 border border-[#06b6d4]/15 hover:border-[#06b6d4]/30 hover:scale-[1.02] transition-all group"
                    >
                      <FaQrcode className="text-xl text-[#06b6d4] group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold tracking-wider text-slate-300 uppercase">Scan QR</span>
                    </NavLink>

                    <NavLink
                      to="/history"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                    >
                      <MdHistory className="text-xl text-slate-400 group-hover:text-white transition-colors" />
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-white">History</span>
                    </NavLink>

                    <NavLink
                      to={`/p/${userData.mobileNo}`}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                    >
                      <FaUserCircle className="text-xl text-slate-400 group-hover:text-white transition-colors" />
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-white">Profile</span>
                    </NavLink>

                    <button
                      onClick={handleLogOut}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer group"
                    >
                      <MdLogout className="text-xl text-slate-400 group-hover:text-rose-400 transition-colors" />
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-rose-400">Logout</span>
                    </button>
                  </div>
                </div>

                {/* Attendance Health */}
                <div className="glass-card rounded-2xl p-5 neon-border-cyan">
                  <h3 className="text-sm font-bold text-white mb-4">Attendance Health</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">Present Rate</span>
                        <span className={`font-bold ${rateColor}`}>{stats.rate}%</span>
                      </div>
                      <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${stats.rate}%`,
                            background:
                              stats.rate >= 75
                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                : stats.rate >= 50
                                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                : "linear-gradient(90deg, #f43f5e, #fb7185)",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">On-Time Rate</span>
                        <span className="font-bold text-[#06b6d4]">
                          {stats.present > 0
                            ? Math.round(((stats.present - stats.late) / stats.present) * 100)
                            : 100}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] transition-all duration-700"
                          style={{
                            width: `${
                              stats.present > 0
                                ? Math.round(((stats.present - stats.late) / stats.present) * 100)
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] text-center">
                    <span
                      className={`text-[10px] font-bold ${
                        stats.rate >= 75
                          ? "text-emerald-400"
                          : stats.rate >= 50
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {stats.rate >= 75
                        ? "✓ Good compliance status"
                        : stats.rate >= 50
                        ? "⚠ Needs improvement"
                        : "✗ Action required immediately"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
