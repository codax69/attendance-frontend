import React from "react";
import { MdClose, MdCheck, MdDelete, MdNotificationsNone } from "react-icons/md";
import { IoInformationCircle, IoCheckmarkCircle, IoAlertCircle, IoWarning } from "react-icons/io5";

const NotificationDrawer = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onDelete, 
  onClearAll 
}) => {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <IoCheckmarkCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />;
      case "warning":
        return <IoWarning className="text-amber-400 w-5 h-5 flex-shrink-0" />;
      case "alert":
      case "error":
        return <IoAlertCircle className="text-rose-400 w-5 h-5 flex-shrink-0" />;
      case "info":
      default:
        return <IoInformationCircle className="text-cyan-400 w-5 h-5 flex-shrink-0" />;
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 opacity-100"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-dark-bg/95 border-l border-white/[0.08] backdrop-blur-2xl z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform translate-x-0"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold font-display text-lg text-brand-accent">
                Notifications
              </span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-secondary text-dark-bg rounded-full">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
              aria-label="Close drawer"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400 mb-4 px-1">
              <button 
                onClick={onMarkAllRead}
                className="hover:text-brand-secondary transition duration-150 flex items-center gap-1 cursor-pointer"
              >
                <MdCheck size={14} /> Mark all as read
              </button>
              <button 
                onClick={onClearAll}
                className="hover:text-rose-400 transition duration-150 flex items-center gap-1 cursor-pointer"
              >
                <MdDelete size={14} /> Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center text-gray-500 mb-4">
                  <MdNotificationsNone size={28} />
                </div>
                <h4 className="text-gray-300 font-semibold font-display text-sm">All caught up!</h4>
                <p className="text-gray-500 text-xs mt-1 max-w-[240px]">
                  You have no new notifications at the moment.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.read && onMarkRead(notif.id)}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                    notif.read 
                      ? "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.06]" 
                      : "bg-brand-primary/[0.03] border-brand-secondary/20 hover:bg-brand-primary/[0.05] hover:border-brand-secondary/35 shadow-sm shadow-brand-secondary/5"
                  }`}
                >
                  {/* Unread Glow Dot */}
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                  )}

                  {/* Icon */}
                  {getIcon(notif.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className={`text-xs font-semibold ${notif.read ? "text-gray-300" : "text-white"}`}>
                      {notif.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-gray-500 mt-2 block font-medium">
                      {formatTime(notif.time)}
                    </span>
                  </div>

                  {/* Delete Button (hover visible) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent trigger mark read
                      onDelete(notif.id);
                    }}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 transition-all duration-200 outline-none focus:ring-2 focus:ring-brand-secondary/30"
                    title="Delete notification"
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] text-center text-[10px] text-gray-500">
          Scanned notifications sync in real-time.
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
