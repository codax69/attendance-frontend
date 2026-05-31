import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { MdHomeFilled, MdClose, MdCoPresent, MdDashboard } from "react-icons/md";
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

const Navbar = () => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const Navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
        console.error('Error updating notifications via event:', err);
      }
    };

    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
    };
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

  const handleChanges = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = () => {
    setIsMenuVisible(!isMenuVisible);
  };

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

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-dark-bg/40 backdrop-blur-md border-b border-white/[0.06] transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleClick}
              className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95 mr-2"
              aria-label="Toggle navigation drawer"
            >
              <GiHamburgerMenu size={24} />
            </button>
            <NavLink to="/" className="flex items-center">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight font-display text-brand-accent select-none transition hover:opacity-90">
                Attendance For ITI-Pardi
              </h1>
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            {/* Glassmorphic Search Bar */}
            <div className="items-center bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 hidden md:flex focus-within:border-brand-secondary/40 focus-within:ring-1 focus-within:ring-brand-secondary/20 transition-all duration-300">
              <IoIosSearch size={20} className="text-gray-400 mr-1" />
              <form onSubmit={searchStudent} className="flex">
                <input
                  className="text-white placeholder-gray-500 outline-none bg-transparent text-sm w-44 font-medium"
                  type="text"
                  name="mobileNo"
                  placeholder="Search mobile number..."
                  id="search"
                  value={inputValue}
                  onChange={handleChanges}
                />
              </form>
            </div>

            <Button
              btnClass={isLoggedIn ? "hidden" : ""}
              BtnName="Signin/Login"
              url="/login"
            />

            <button
              className={
                !isLoggedIn
                  ? "hidden"
                  : "px-4 py-1.5 rounded-xl text-sm font-medium border border-white/[0.08] hover:bg-white/[0.04] text-gray-300 hover:text-white transition duration-200 active:scale-95"
              }
              onClick={handleLogOut}
            >
              Logout
            </button>

            {isLoggedIn && (
              <div className="relative flex items-center mr-1">
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="p-2 text-brand-secondary hover:text-[#ebd5ab] rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95 flex items-center justify-center relative cursor-pointer"
                  aria-label="View notifications"
                >
                  <IoNotifications size={22} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-dark-bg animate-pulse" />
                  )}
                </button>
              </div>
            )}

            <NavLink to="/p/:mobileNo" onClick={handleUserClick} className="ml-1 flex items-center">
              <FaUserCircle
                size={32}
                className="text-brand-secondary hover:text-[#ebd5ab] hover:scale-105 hover:cursor-pointer transition-all duration-200"
              />
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Slide-in Navigation Drawer */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isMenuVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClick}
      />
      
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-dark-bg/95 border-r border-white/[0.08] backdrop-blur-2xl z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          isMenuVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
            <span className="font-bold font-display text-lg text-brand-accent">
              Menu Navigation
            </span>
            <button
              onClick={handleClick}
              className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
            >
              <MdClose size={20} />
            </button>
          </div>
          <ul className="flex flex-col space-y-2">
            <li>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 font-medium ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-secondary"
                      : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
                onClick={handleClick}
                to="/"
              >
                <MdHomeFilled size={20} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/[0.04] hover:text-white transition duration-200 font-medium"
                onClick={handleClick}
                to="/"
              >
                <IoInformationCircle size={20} />
                <span>About</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 font-medium ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-secondary"
                      : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
                onClick={handleClick}
                to="/attendance"
              >
                <MdCoPresent size={20} />
                <span>Attendance</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 font-medium ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-secondary"
                      : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
                onClick={handleClick}
                to="/history"
              >
                <IoCalendarOutline size={20} />
                <span>Attendance History</span>
              </NavLink>
            </li>
            {user && user.role === "admin" && (
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 font-medium ${
                      isActive
                        ? "bg-brand-primary/10 text-brand-secondary"
                        : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                    }`
                  }
                  onClick={handleClick}
                  to="/admin"
                >
                  <MdDashboard size={20} />
                  <span>Admin Panel</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>
        <div className="pt-6 border-t border-white/[0.08] text-center text-xs text-gray-500">
          I.C.Desai ITI-Pardi © 2026
        </div>
      </div>

      {/* Notifications Slide Drawer */}
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
