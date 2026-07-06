import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { IoCalendarOutline, IoListOutline, IoChevronBack, IoChevronForward, IoSearchOutline, IoAlertCircleOutline } from "react-icons/io5";
import { MdCheckCircle, MdCancel, MdWatchLater, MdCloudDone } from "react-icons/md";
import { ContextApi } from "../context/ContextApi.jsx";
import { InfinitySpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { getAttendanceRecords, addAttendanceRecord } from "../utils/apiHelper.js";

const AttendanceHistory = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const [userData, setUserData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar"); // "calendar" or "logs"
  
  // Date states for the calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Log search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PRESENT, LATE, HALF_DAY, LEAVE, ABSENT
  
  // Detail Modal/Card state
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);
  const [error, setError] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoader(true);
      const response = await axios.get("/api/v1/user/get-current-user");
      const user = response.data.data.user;
      setUserData(user);
      
      // Load attendance records from backend MongoDB API
      let logs = await getAttendanceRecords();
      
      setAttendance(logs);
      setLoader(false);
    } catch (error) {
      console.error("Error fetching user or attendance data:", error);
      setError(true);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
    // Prevent going past current month
    const nextDate = new Date(year, month + 1, 1);
    if (nextDate <= new Date()) {
      setCurrentDate(nextDate);
      setSelectedDayRecord(null);
    }
  };

  // Get record for a calendar date
  const getRecordForDate = (dayNum) => {
    const paddedDay = String(dayNum).padStart(2, "0");
    const paddedMonth = String(month + 1).padStart(2, "0");
    const dateStr = `${paddedDay}/${paddedMonth}/${year}`;
    
    // Check if we have a database record
    const record = attendance.find(r => r.date === dateStr);
    if (record) return record;

    // Check if it's a past class day (non-Sunday)
    const dateObj = new Date(year, month, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSunday = dateObj.getDay() === 0;
    const isPast = dateObj < today;

    if (isPast && !isSunday) {
      return {
        date: dateStr,
        status: "ABSENT",
        message: "No attendance recorded for this work/class day.",
        synced: false
      };
    }

    return null;
  };

  // Get records for the currently selected month and year
  const currentMonthRecords = attendance.filter(r => {
    if (!r.date) return false;
    const parts = r.date.split("/");
    if (parts.length !== 3) return false;
    const rMonth = parseInt(parts[1], 10) - 1;
    const rYear = parseInt(parts[2], 10);
    return rMonth === month && rYear === year;
  });

  // Calculate total class days (non-Sundays) for the selected month up to today (if current month) or up to end of month (if past)
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const isCurrentMonth = todayMidnight.getFullYear() === year && todayMidnight.getMonth() === month;
  const isPastMonth = new Date(year, month, 1) < new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1);

  const endDayForStats = isCurrentMonth
    ? todayMidnight.getDate()
    : (isPastMonth ? daysInMonth : 0);

  let totalClassDays = 0;
  for (let d = 1; d <= endDayForStats; d++) {
    const dateObj = new Date(year, month, d);
    if (dateObj.getDay() !== 0) { // Excluding Sunday
      totalClassDays++;
    }
  }

  // Stats calculation for the selected month
  const presentDays = currentMonthRecords.filter(r => r.status === "PRESENT").length;
  const lateDays = currentMonthRecords.filter(r => r.status === "LATE").length;
  const halfDays = currentMonthRecords.filter(r => r.status === "HALF_DAY").length;
  const leaveDays = currentMonthRecords.filter(r => r.status === "LEAVE").length;
  const absentDays = Math.max(0, totalClassDays - (presentDays + lateDays + halfDays + leaveDays));
  
  const evaluatedDays = totalClassDays - leaveDays;
  const overallPercentage = evaluatedDays > 0 
    ? Math.round(((presentDays + lateDays + (halfDays * 0.5)) / evaluatedDays) * 100) 
    : 100;

  // Generate logs for the selected month, including virtual ABSENT records
  const monthlyLogs = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const isSunday = dateObj.getDay() === 0;
    const isFuture = dateObj >= todayMidnight; // Compare with midnight-zeroed today
    
    if (isSunday || isFuture) continue;

    const paddedDay = String(d).padStart(2, "0");
    const paddedMonth = String(month + 1).padStart(2, "0");
    const dateStr = `${paddedDay}/${paddedMonth}/${year}`;

    const record = attendance.find(r => r.date === dateStr);
    if (record) {
      monthlyLogs.push(record);
    } else {
      monthlyLogs.push({
        id: `virtual-absent-${dateStr}`,
        date: dateStr,
        time: "--",
        status: "ABSENT",
        qrData: null,
        synced: false
      });
    }
  }

  // Sort logs by date descending (latest first)
  monthlyLogs.sort((a, b) => {
    const partsA = a.date.split("/");
    const partsB = b.date.split("/");
    const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
    const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
    return dateB - dateA;
  });

  // Filtered Logs
  const filteredLogs = monthlyLogs.filter(log => {
    // Apply search filter
    const matchesSearch = log.date.includes(searchTerm) || (log.time && log.time.includes(searchTerm));
    
    // Apply status filter
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && log.status === statusFilter;
  });

  if (error) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <p className="text-rose-400 text-sm font-semibold mb-3">Failed to load attendance data.</p>
          <button
            onClick={() => { setError(false); fetchUserData(); }}
            className="px-4 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.06]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loader || !userData) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <InfinitySpin visible={true} width="200" color="#2F2FE4" ariaLabel="infinity-spin-loading" />
          <p className="text-white text-sm font-semibold mt-2 animate-pulse">Loading attendance history...</p>
        </div>
      </div>
    );
  }

  // Generate calendar days
  const calendarDays = [];
  // Empty blocks for padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-11 sm:h-14 md:h-16 w-full bg-white/[0.01] border border-white/[0.02] rounded-xl opacity-30" />);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const record = getRecordForDate(day);
    const dateObj = new Date(year, month, day);
    const isSunday = dateObj.getDay() === 0;
    const isFuture = dateObj >= todayMidnight;

    let cellClass = "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12]";
    let textClass = "text-gray-300";
    let statusDot = null;
    let statusLabel = "";

    if (isSunday) {
      cellClass = "bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed";
      textClass = "text-gray-500";
    } else if (isFuture) {
      cellClass = "bg-white/[0.01] border-white/[0.02] opacity-25 cursor-not-allowed";
      textClass = "text-gray-600";
    } else if (record) {
      if (record.status === "PRESENT") {
        cellClass = "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15";
        textClass = "text-emerald-400 font-bold";
        statusDot = <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />;
        statusLabel = "Present";
      } else if (record.status === "LATE") {
        cellClass = "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15";
        textClass = "text-amber-400 font-bold";
        statusDot = <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500" />;
        statusLabel = "Late";
      } else if (record.status === "HALF_DAY") {
        cellClass = "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/15";
        textClass = "text-sky-400 font-bold";
        statusDot = <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-sky-500" />;
        statusLabel = "Half Day";
      } else if (record.status === "LEAVE") {
        cellClass = "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/15";
        textClass = "text-purple-400 font-bold";
        statusDot = <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500" />;
        statusLabel = "Leave";
      } else if (record.status === "ABSENT") {
        cellClass = "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15";
        textClass = "text-rose-400 font-bold";
        statusDot = <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500" />;
        statusLabel = "Absent";
      }
    } else {
      // Past day but no record -> Pending or Unmarked
      cellClass = "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.15]";
      textClass = "text-gray-400";
    }

    const isToday = new Date().toDateString() === dateObj.toDateString();

    calendarDays.push(
      <button
        key={`day-${day}`}
        disabled={isSunday || isFuture}
        onClick={() => {
          const paddedDay = String(day).padStart(2, "0");
          const paddedMonth = String(month + 1).padStart(2, "0");
          const dateStr = `${paddedDay}/${paddedMonth}/${year}`;
          
          setSelectedDayRecord(record || {
            date: dateStr,
            status: "UNMARKED",
            message: "No attendance recorded for this work/class day."
          });
        }}
        className={`h-11 sm:h-14 md:h-16 w-full flex flex-col justify-between p-1 sm:p-1.5 border rounded-xl transition duration-150 relative cursor-pointer active:scale-95 ${cellClass} ${isToday ? "ring-1 ring-brand-secondary/40" : ""}`}
      >
        <span className={`text-[10px] sm:text-xs font-mono font-medium ${textClass}`}>{String(day).padStart(2, "0")}</span>
        {statusDot && (
          <div className="flex items-center gap-1 self-start">
            {statusDot}
            {statusLabel && <span className="hidden sm:inline text-[7.5px] sm:text-[9px] font-bold tracking-wider opacity-85 uppercase">{statusLabel}</span>}
          </div>
        )}
        {isToday && (
          <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[7px] bg-brand-secondary/25 border border-brand-secondary/40 text-brand-secondary font-black" title="Today">
            TODAY
          </span>
        )}
      </button>
    );
  }

  const downloadCSVReport = () => {
    if (attendance.length === 0) {
      toast.info("No records to export.");
      return;
    }
    const headers = ["Date", "Time", "Status", "Reference Code"];
    const rows = monthlyLogs.map(log => [
      log.date,
      log.time || "--",
      log.status,
      log.qrData || "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${monthNames[month]}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report downloaded successfully!");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-brand-secondary mb-3">
            Attendance History
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Personal <span className="text-brand-secondary">Attendance Logs</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">
            Enrollment: {userData.enrollmentNo} | Class: {userData.class || "N/A"} | Roll No: {userData.rollNo || "N/A"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={downloadCSVReport}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:text-white transition duration-200 active:scale-95 cursor-pointer"
          >
            Download Report
          </button>
          <NavLink to="/" className="w-full sm:w-auto">
            <button className="w-full text-center px-4 py-2.5 text-xs font-semibold rounded-xl border border-brand-secondary/35 bg-brand-secondary/5 text-brand-secondary hover:text-white transition duration-200 active:scale-95 cursor-pointer">
              Back to Dashboard
            </button>
          </NavLink>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-white/[0.06] mb-8">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "calendar"
              ? "border-brand-secondary text-brand-secondary"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <IoCalendarOutline size={16} />
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "logs"
              ? "border-brand-secondary text-brand-secondary"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <IoListOutline size={16} />
          Detailed History Logs
        </button>
      </div>

      {/* Content views */}
      {activeTab === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Summary Panel (Stats) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Percentage Ring Chart Card */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group neon-border-indigo">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Percentage Ring Chart */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle className="text-white/[0.02]" cx="64" cy="64" fill="none" r="54" stroke="currentColor" strokeWidth="6"></circle>
                  <circle className="text-brand-secondary transition-all duration-1000 ease-out" cx="64" cy="64" fill="none" r="54" stroke="url(#gradient-ring)" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * (1 - overallPercentage / 100)} strokeLinecap="round" strokeWidth="6"></circle>
                  <defs>
                    <linearGradient id="gradient-ring" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5"></stop>
                      <stop offset="100%" stopColor="#06B6D4"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-display text-2xl font-bold text-white">{overallPercentage}%</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">MONTHLY AVG</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <div className="bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-center">
                  <span className="block text-lg font-bold font-display text-emerald-400">{presentDays}</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Present</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-center">
                  <span className="block text-lg font-bold font-display text-rose-400">{absentDays}</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Absent</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-center">
                  <span className="block text-lg font-bold font-display text-amber-400">{lateDays}</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Late</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-center">
                  <span className="block text-lg font-bold font-display text-purple-400">{leaveDays}</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Leave</span>
                </div>
              </div>
            </div>

            {/* Legend Card */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-2.5 neon-border-cyan">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.04] pb-1.5">STATUS LEGEND</h3>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <span className="text-[9px] font-black">✓</span>
                </span>
                <span className="text-xs text-gray-300 font-medium">Present (On Time)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                  <span className="text-[9px] font-black">✗</span>
                </span>
                <span className="text-xs text-gray-300 font-medium">Absent (No Notice)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <span className="text-[9px] font-black">!</span>
                </span>
                <span className="text-xs text-gray-300 font-medium">Late Arrival</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <span className="text-[9px] font-black">L</span>
                </span>
                <span className="text-xs text-gray-300 font-medium">Approved Leave</span>
              </div>
            </div>

            {/* Verification details card */}
            <div className="glass-panel p-4 rounded-xl neon-border-indigo">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 mb-2.5">DAY VERIFICATION DETAIL</h3>
              {selectedDayRecord ? (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-400">Date</span>
                    <span className="font-mono font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">{selectedDayRecord.date}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-400">Status</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedDayRecord.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      selectedDayRecord.status === "LATE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      selectedDayRecord.status === "HALF_DAY" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                      selectedDayRecord.status === "LEAVE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      selectedDayRecord.status === "ABSENT" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      "bg-white/5 text-gray-400 border border-white/10"
                    }`}>
                      {selectedDayRecord.status === "HALF_DAY" ? "HALF DAY" : selectedDayRecord.status}
                    </span>
                  </div>

                  {selectedDayRecord.status !== "UNMARKED" && selectedDayRecord.status !== "ABSENT" && selectedDayRecord.status !== "LEAVE" && (
                    <>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.03]">
                        <span className="font-semibold text-gray-400">Check-in Time</span>
                        <span className="font-medium text-gray-200">{selectedDayRecord.time}</span>
                      </div>
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.03]">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">QR Scanned Reference</span>
                        <code className="text-[9px] bg-black/40 p-1.5 rounded text-gray-300 font-mono break-all leading-normal border border-white/[0.04]">
                          {selectedDayRecord.qrData || "N/A"}
                        </code>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-black mt-1.5">
                        <MdCloudDone size={12} /> SYNCED WITH CLOUD
                      </div>
                    </>
                  )}

                  {selectedDayRecord.status === "LEAVE" && (
                    <div className="flex gap-2 items-start p-2 bg-purple-500/[0.02] border border-purple-500/10 rounded-lg text-purple-400 text-xs">
                      <IoAlertCircleOutline size={14} className="flex-shrink-0 mt-0.5" />
                      <span>Excused leave approved for this date.</span>
                    </div>
                  )}

                  {selectedDayRecord.status === "ABSENT" && (
                    <div className="flex gap-2 items-start p-2 bg-rose-500/[0.02] border border-rose-500/10 rounded-lg text-rose-400/90 text-xs">
                      <IoAlertCircleOutline size={14} className="flex-shrink-0 mt-0.5" />
                      <span>No attendance record found. Logged as absent.</span>
                    </div>
                  )}

                  {selectedDayRecord.status === "UNMARKED" && (
                    <div className="flex gap-2 items-start p-2 bg-white/[0.01] border border-white/[0.05] rounded-lg text-gray-400 text-xs">
                      <IoAlertCircleOutline size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{selectedDayRecord.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-500 font-medium">
                  Click on any highlighted calendar cell to view check-in times and verification tokens.
                </div>
              )}
            </div>

          </div>

          {/* Calendar View Container */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-4 sm:p-5 rounded-xl relative overflow-hidden neon-border-cyan">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <IoCalendarOutline className="text-brand-secondary" />
                  {monthNames[month]} {year}
                </h2>
                <div className="flex gap-1.5">
                  <button
                    onClick={prevMonth}
                    className="p-1 text-gray-400 hover:text-white rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.05] transition active:scale-95 cursor-pointer"
                  >
                    <IoChevronBack size={14} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1 text-gray-400 hover:text-white rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.05] transition active:scale-95 cursor-pointer"
                  >
                    <IoChevronForward size={14} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Weekdays */}
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, index) => (
                  <div key={d} className={`text-center py-1 text-[9px] font-bold uppercase tracking-wider ${index === 0 ? "text-rose-500" : "text-gray-500"}`}>
                    {d}
                  </div>
                ))}
                {/* Days */}
                {calendarDays}
              </div>

              {/* Legend Footer inside Calendar Panel (for small screens) */}
              <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-white/[0.04] text-[8px] text-gray-500 font-bold justify-center">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Late</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Half Day</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Leave</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Absent</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10" /> Non-work</span>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Logs Table View */
        <div className="glass-panel p-4 rounded-xl hover:border-white/[0.08] transition duration-300 neon-border">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative w-full md:w-72 bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-1.5 flex items-center focus-within:border-brand-secondary/40 focus-within:ring-1 focus-within:ring-brand-secondary/20 transition-all duration-300">
              <IoSearchOutline size={16} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search date or check-in..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full font-medium"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {["ALL", "PRESENT", "LATE", "HALF_DAY", "LEAVE", "ABSENT"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border transition cursor-pointer active:scale-95 ${
                    statusFilter === status
                      ? "bg-brand-secondary/15 border-brand-secondary/35 text-brand-secondary"
                      : "bg-white/[0.01] border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {status === "HALF_DAY" ? "HALF DAY" : status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Check-in Time</th>
                  <th className="pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Verification Reference</th>
                  <th className="pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-right">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500 font-medium">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.005] transition-all">
                      <td className="py-2.5 font-semibold text-gray-200">{log.date}</td>
                      <td className="py-2.5 text-gray-300">{log.time}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase ${
                          log.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                          log.status === "LATE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                          log.status === "HALF_DAY" ? "bg-sky-500/10 text-sky-400 border border-sky-500/10" :
                          log.status === "LEAVE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/10" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                        }`}>
                          {log.status === "HALF_DAY" ? "HALF DAY" : log.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[9px] text-gray-400 max-w-[160px] truncate">
                        {log.qrData || "--"}
                      </td>
                      <td className="py-2.5 text-right">
                        {log.status !== "ABSENT" ? (
                           <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                            <MdCloudDone size={12} /> Synced
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-500 font-medium">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
};

export default AttendanceHistory;
