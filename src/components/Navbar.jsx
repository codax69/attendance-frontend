import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle, FaQrcode, FaShieldAlt } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { MdHomeFilled, MdClose, MdCoPresent, MdDashboard, MdHistory, MdLogout } from "react-icons/md";
import { IoNotifications, IoInformationCircle, IoCalendarOutline } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import "../index.css";
import axios from "axios";
import Button from "./Button.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import NotificationDrawer from "./NotificationDrawer.jsx";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "../utils/apiHelper.js";
import { AttendanceLogo } from "./LandingPage.jsx";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: MdHomeFilled, exact: true },
  { to: "/attendance", label: "Attendance", icon: MdCoPresent },
  { to: "/history", label: "History", icon: IoCalendarOutline },
];

const NavItem = ({ to, label, icon: Icon, onClick, exact }) => (
  <NavLink
    to={to}
    end={exact}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold group ${
        isActive
          ? "bg-gradient-to-r from-[#4f46e5]/15 to-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] shadow-sm shadow-[#06b6d4]/5"
          : "text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
      }`
    }
  >
    <Icon size={17} className="flex-shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const Navbar = () => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const Navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Track scroll for navbar glass intensity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchUserAndNotifications = async () => {
    try {
      const response = await axios.get("/api/v1/user/get-current-user");
      const loggedInUser = response.data.data.user;
      setUser(loggedInUser);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.log("Error loading user in navbar:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserAndNotifications();
    } else {
      setUser(null);
      setNotifications([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleUpdate = async () => {
      if (!user) return;
      try {
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error("Error updating notifications via event:", err);
      }
    };
    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => window.removeEventListener("notificationsUpdated", handleUpdate);
  }, [user]);

  const handleMarkRead = async (id) => {
    if (!user) return;
    try {
      await markNotificationAsRead(id);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead();
      const notifs = await getNotifications();
      setNotifications(notifs);
      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleDeleteNotif = async (id) => {
    if (!user) return;
    try {
      await deleteNotification(id);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAllNotifs = async () => {
    if (!user) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.info("Cleared all notifications.");
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleClick = () => setIsMenuVisible((v) => !v);

  const searchStudent = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      const response = await axios.get(`/api/v1/user/p/${inputValue}`);
      Navigate(`/p/${response.data.data.mobileNo}`);
      setInputValue("");
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast.error("Student not found.");
    }
  };

  const handleUserClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("/api/v1/user/get-current-user");
      Navigate(`/p/${response.data.data.user.mobileNo}`);
    } catch (error) {
      console.log(error);
      Navigate("/login");
    }
  };

  const handleLogOut = async () => {
    try {
      await axios.get("/api/v1/user/logout");
      setIsLoggedIn(false);
      toast.success("Logged out successfully.");
      Navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <header
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#020205]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/30"
            : "bg-[#020205]/50 backdrop-blur-md border-b border-white/[0.03]"
        }`}
      >
        <nav className="w-full px-4 py-2.5 flex justify-between items-center gap-4">
          {/* LEFT — hamburger + logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleClick}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <GiHamburgerMenu size={18} />
            </button>

            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <AttendanceLogo className="w-5 h-5 text-[#06b6d4]" />
                <div className="absolute inset-0 bg-[#06b6d4]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-[#c3c0ff] via-white to-[#4cd7f6] bg-clip-text text-transparent select-none transition-opacity group-hover:opacity-90">
                Attenteds
              </span>
            </NavLink>
          </div>

          {/* CENTER — search */}
          {/* <div className="flex-1 max-w-sm hidden md:flex">
            <div className="w-full flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 focus-within:border-[#06b6d4]/40 focus-within:ring-1 focus-within:ring-[#06b6d4]/20 focus-within:bg-white/[0.05] transition-all duration-300">
              <IoIosSearch size={16} className="text-slate-500 mr-2 flex-shrink-0" />
              <form onSubmit={searchStudent} className="flex flex-1">
                <input
                  className="text-white placeholder-slate-500 outline-none bg-transparent text-xs w-full font-medium"
                  type="text"
                  name="mobileNo"
                  placeholder="Search by mobile number..."
                  id="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </form>
            </div>
          </div> */}

          {/* RIGHT — actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Sign in button (logged out) */}
            {!isLoggedIn && (
              <NavLink to="/login">
                <button className="px-4 py-1.5 rounded-xl text-xs font-bold primary-gradient text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#4f46e5]/20">
                  Sign In
                </button>
              </NavLink>
            )}

            {/* Notification bell (logged in) */}
            {isLoggedIn && (
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-400 hover:text-[#06b6d4] rounded-xl hover:bg-white/[0.04] transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="View notifications"
              >
                <IoNotifications size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </button>
            )}

            {/* User avatar / profile */}
            <button
              onClick={handleUserClick}
              className="relative p-1 rounded-xl hover:bg-white/[0.04] transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="View profile"
            >
              {isLoggedIn && user ? (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#4f46e5]/25">
                  {user.fullname?.charAt(0).toUpperCase() || "U"}
                </div>
              ) : (
                <FaUserCircle size={26} className="text-slate-400 hover:text-[#06b6d4] transition-colors duration-200" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Sidebar Backdrop ── */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          isMenuVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClick}
      />

      {/* ── Sidebar Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ease-out ${
          isMenuVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(4, 4, 10, 0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Sidebar glow decoration */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#4f46e5]/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#06b6d4]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-4 overflow-y-auto no-scrollbar">
          {/* Sidebar header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <AttendanceLogo className="w-5 h-5 text-[#06b6d4]" />
              <span className="font-black text-sm bg-gradient-to-r from-[#c3c0ff] to-[#4cd7f6] bg-clip-text text-transparent select-none">
                Attenteds
              </span>
            </div>
            <button
              onClick={handleClick}
              className="p-1.5 text-slate-500 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* User card */}
          <div className="mb-5 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] flex items-center justify-center text-white font-black text-base shadow-lg shadow-[#4f46e5]/25 flex-shrink-0">
                  {user.fullname?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{user.fullname}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {user.role === "admin" ? "Teacher Admin" : user.role === "superuser" ? "Super User" : `Class ${user.class || "Student"}`}
                  </p>
                  {(user.rollNo || user.employeeId) && (
                    <span className="mt-1 inline-flex px-2 py-0.5 text-[9px] font-bold bg-[#4f46e5]/10 border border-[#4f46e5]/20 text-[#818cf8] rounded-full">
                      {user.rollNo ? `Roll: ${user.rollNo}` : `ID: ${user.employeeId}`}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 text-lg flex-shrink-0">
                  ?
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Not Signed In</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-2">Access your attendance records</p>
                  <NavLink to="/login" onClick={handleClick}>
                    <button className="py-1 px-3 text-white font-bold rounded-lg primary-gradient text-[10px] hover:brightness-110 transition-all active:scale-95 cursor-pointer">
                      Sign In
                    </button>
                  </NavLink>
                </div>
              </>
            )}
          </div>

          {/* Nav links */}
          <div className="mb-2">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavItem key={link.to} {...link} onClick={handleClick} />
              ))}
              {user && (user.role === "admin" || user.role === "teacher" || user.role === "superuser") && (
                <NavItem
                  to="/admin"
                  label="Admin Panel"
                  icon={MdDashboard}
                  onClick={handleClick}
                />
              )}
            </div>
          </div>

          {/* Notification quick-access */}
          {isLoggedIn && (
            <div className="mt-2 mb-2">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Account</p>
              <button
                onClick={() => { setIsMenuVisible(false); setIsNotifOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent transition-all duration-200 relative cursor-pointer"
              >
                <IoNotifications size={17} className="flex-shrink-0" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setIsMenuVisible(false); handleLogOut(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/15 transition-all duration-200 cursor-pointer mt-1"
              >
                <MdLogout size={17} className="flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sidebar footer */}
          <div className="pt-4 border-t border-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
                <span className="text-[9px] font-bold text-[#06b6d4] uppercase tracking-wider">Operational</span>
              </div>
              <span className="text-[9px] text-slate-600 font-mono">v1.0.2</span>
            </div>
            <p className="text-[9px] text-slate-700 mt-2">© 2026 Attenteds Obsidian Technologies</p>
          </div>
        </div>
      </aside>

      {/* ── Notifications Slide Drawer ── */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDeleteNotif}
        onClearAll={handleClearAllNotifs}
      />
    </>
  );
};

export default Navbar;
