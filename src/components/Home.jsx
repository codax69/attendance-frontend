import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { ContextApi } from "../context/ContextApi.jsx";
import { InfinitySpin } from "react-loader-spinner";
import { getNotifications } from "../utils/apiHelper.js";

const Home = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([]);

  const fetchUserData = async () => {
    try {
      setLoader(true);
      const response = await axios.get("/api/v1/user/get-current-user");
      const user = response.data.data.user;
      setUserData(user);
      
      // Fetch notifications asynchronously from backend API
      const notifs = await getNotifications();
      setNotifications(notifs);
      setLoader(false);
    } catch (error) {
      console.log(error.message);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Maintenance Announcement Banner */}
      {/* <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="glass-panel border-brand-accent/20 bg-brand-accent/[0.01] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-brand-accent/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex gap-4 items-start">
            <span className="p-2.5 bg-brand-accent/10 text-brand-accent rounded-xl mt-0.5">
              <IoInformationCircle size={22} />
            </span>
            <div>
              <h2 className="text-brand-accent font-bold font-display text-base mb-1 flex items-center gap-2">
                Scheduled Server Maintenance Notice
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed font-medium">
                Dear Users, please be informed that we have scheduled system maintenance. During this window, attendance services and sheets sync will be momentarily offline. We appreciate your patience as we secure and optimize our network.
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {loader ? (
        <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <InfinitySpin
              visible={true}
              width="200"
              color="#8bae66"
              ariaLabel="infinity-spin-loading"
            />
            <p className="text-white text-sm font-semibold mt-2 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Greeting & Quick Action Panel */}
            <div className="glass-panel border-white/[0.08] p-6 rounded-2xl text-center flex flex-col items-center justify-between relative overflow-hidden group hover:border-white/[0.15] transition-all duration-300 min-h-[300px]">
              <div className="absolute top-0 left-0 w-32 h-32 bg-brand-indigo/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-4">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-brand-secondary mb-3">
                  Student Dashboard
                </span>
                <h2 className="text-xl font-bold font-display tracking-tight text-white">
                  Hello, <span className="text-brand-secondary font-extrabold">{userData.fullname || "User"}</span>
                </h2>
                <p className="text-gray-400 text-xs mt-1 font-medium">
                  {userData.class ? `${userData.class} | Roll No: ${userData.rollNo || "N/A"}` : "Select an option below to manage attendance"}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                {userData.role === "admin" && (
                  <NavLink to="/admin" className="w-full">
                    <button className="w-full py-2.5 px-4 text-[#1b211a] font-bold rounded-xl bg-gradient-to-r from-brand-secondary to-[#cbe5ac] hover:from-[#ebd5ab] hover:to-[#ebd5ab] shadow-md shadow-brand-secondary/10 hover:shadow-brand-secondary/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm cursor-pointer">
                      Teacher Admin Dashboard
                    </button>
                  </NavLink>
                )}
                <NavLink to="/attendance" className="w-full">
                  <button className="w-full py-2.5 px-4 text-[#1b211a] font-bold rounded-xl bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-secondary/10 hover:shadow-brand-secondary/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                    Record Attendance
                  </button>
                </NavLink>
                <NavLink to="/history" className="w-full">
                  <button className="w-full py-2.5 px-4 text-gray-300 hover:text-white font-semibold rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] active:scale-98 transition transform hover:-translate-y-0.5 text-sm">
                    Check Daily Attendance
                  </button>
                </NavLink>
                <NavLink to="/history" className="w-full">
                  <button className="w-full py-2.5 px-4 text-gray-300 hover:text-white font-semibold rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] active:scale-98 transition transform hover:-translate-y-0.5 text-sm">
                    Check Monthly Attendance
                  </button>
                </NavLink>
              </div>
            </div>

            {/* Information & Notices Panel */}
            <div className="glass-panel border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-white/[0.15] transition-all duration-300 flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-4">
                <h2 className="text-lg font-bold font-display text-white">Attendance Information</h2>
                <p className="text-gray-400 text-xs mt-1 font-medium">Important updates regarding ITI-Pardi rules</p>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[190px]">
                {notifications.length === 0 ? (
                  <div className="flex gap-3 items-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <IoInformationCircle size={18} className="text-brand-secondary flex-shrink-0" />
                    <span className="text-gray-300 text-xs leading-relaxed font-medium">
                      No notifications at the moment. Scan QR code to record attendance.
                    </span>
                  </div>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <div key={notif.id} className={`flex gap-3 items-start p-3 rounded-xl border transition duration-200 ${
                      notif.read 
                        ? "bg-white/[0.01] border-white/[0.04]" 
                        : "bg-brand-primary/[0.04] border-brand-secondary/20 shadow-xs"
                    }`}>
                      <IoInformationCircle size={18} className={`flex-shrink-0 mt-0.5 ${
                        notif.type === "success" ? "text-emerald-400" :
                        notif.type === "warning" ? "text-amber-400" :
                        notif.type === "alert" ? "text-rose-400" : "text-brand-secondary"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-semibold ${notif.read ? "text-gray-300" : "text-white"}`}>{notif.title}</h4>
                        <p className="text-gray-400 text-[10px] mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      )}
    </>
  );
};

export default Home;
