import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { IoCalendarOutline, IoListOutline, IoChevronBack, IoChevronForward, IoSearchOutline, IoAlertCircleOutline } from "react-icons/io5";
import { MdCheckCircle, MdCancel, MdWatchLater, MdCloudDone } from "react-icons/md";
import { ContextApi } from "../context/ContextApi.jsx";
import { InfinitySpin } from "react-loader-spinner";
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
  const todayObj = new Date();
  const isCurrentMonth = todayObj.getFullYear() === year && todayObj.getMonth() === month;
  const isPastMonth = new Date(year, month, 1) < new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
  
  const endDayForStats = isCurrentMonth 
    ? todayObj.getDate() 
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
    const isFuture = dateObj > new Date(); // Compare with current date/time
    
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

  if (loader || !userData) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <InfinitySpin visible={true} width="200" color="#8bae66" ariaLabel="infinity-spin-loading" />
          <p className="text-white text-sm font-semibold mt-2 animate-pulse">Loading attendance history...</p>
        </div>
      </div>
    );
  }

  // Generate calendar days
  const calendarDays = [];
  // Empty blocks for padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 sm:h-12 w-full" />);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const record = getRecordForDate(day);
    const dateObj = new Date(year, month, day);
    const isSunday = dateObj.getDay() === 0;
    const isFuture = dateObj > new Date();

    let cellClass = "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12]";
    let textClass = "text-gray-300";
    let statusDot = null;

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
        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />;
      } else if (record.status === "LATE") {
        cellClass = "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15";
        textClass = "text-amber-400 font-bold";
        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />;
      } else if (record.status === "HALF_DAY") {
        cellClass = "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/15";
        textClass = "text-sky-400 font-bold";
        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />;
      } else if (record.status === "LEAVE") {
        cellClass = "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/15";
        textClass = "text-purple-400 font-bold";
        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />;
      } else if (record.status === "ABSENT") {
        cellClass = "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15";
        textClass = "text-rose-400 font-bold";
        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />;
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
        className={`h-10 sm:h-12 w-full flex flex-col justify-between p-1.5 border rounded-xl transition duration-150 relative cursor-pointer active:scale-95 ${cellClass} ${isToday ? "ring-1 ring-brand-secondary/40" : ""}`}
      >
        <span className={`text-xs ${textClass}`}>{day}</span>
        <div className="flex justify-center w-full pb-0.5">
          {statusDot}
        </div>
        {isToday && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-secondary rounded-full border border-dark-bg" title="Today" />
        )}
      </button>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-brand-secondary mb-2">
            Attendance Log
          </span>
          <h1 className="text-2xl font-bold font-display text-white">
            Hello, <span className="text-brand-secondary">{userData.fullname}</span>
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Enrollment: {userData.enrollmentNo} | Class: {userData.class || "N/A"} | Roll No: {userData.rollNo || "N/A"}</p>
        </div>
        
        <NavLink to="/">
          <button className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 hover:text-white transition duration-200 active:scale-95">
            Back to Dashboard
          </button>
        </NavLink>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Progress Circle card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl flex items-center justify-around gap-2 hover:border-white/[0.12] transition duration-300">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-white/[0.03]"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-brand-secondary transition-all duration-1000 ease-out"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - overallPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold font-display text-white">{overallPercentage}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-semibold font-display text-white truncate">Standing</h4>
            <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">
              {overallPercentage >= 75 
                ? "Above 75%"
                : "Below 75%"}
            </p>
          </div>
        </div>

        {/* Present Card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl hover:border-white/[0.12] transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Present</span>
            <MdCheckCircle className="text-emerald-400 w-4 h-4" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-white">{presentDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Scanned success</p>
          </div>
        </div>

        {/* Late Card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl hover:border-white/[0.12] transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Late</span>
            <MdWatchLater className="text-amber-400 w-4 h-4" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-white">{lateDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Past check-in</p>
          </div>
        </div>

        {/* Half Day Card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl hover:border-white/[0.12] transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Half Day</span>
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-white">{halfDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Partial days</p>
          </div>
        </div>

        {/* Leave Card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl hover:border-white/[0.12] transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Leave</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-white">{leaveDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Excused days</p>
          </div>
        </div>

        {/* Absent Card */}
        <div className="glass-panel border-white/[0.08] p-4 rounded-2xl hover:border-white/[0.12] transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Absent</span>
            <MdCancel className="text-rose-400 w-4 h-4" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-white">{absentDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Unexcused</p>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-white/[0.08] mb-6">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
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
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar Box */}
          <div className="glass-panel border-white/[0.08] p-6 rounded-2xl md:col-span-2 hover:border-white/[0.12] transition duration-300">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold font-display text-md text-white flex items-center gap-2">
                <IoCalendarOutline className="text-brand-secondary" />
                {monthNames[month]} {year}
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 text-gray-400 hover:text-white rounded-xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.05] transition active:scale-95 cursor-pointer"
                >
                  <IoChevronBack size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 text-gray-400 hover:text-white rounded-xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.05] transition active:scale-95 cursor-pointer"
                >
                  <IoChevronForward size={16} />
                </button>
              </div>
            </div>

            {/* Days labels */}
            <div className="grid grid-cols-7 text-center gap-2 mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, index) => (
                <span key={d} className={`text-[10px] font-bold uppercase tracking-wider ${index === 0 ? "text-rose-500" : "text-gray-500"}`}>
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/[0.06] text-[10px] text-gray-400 font-semibold justify-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" /> Late Check-in</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500/20 border border-sky-500/40" /> Half Day</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-500/40" /> Excused Leave</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" /> Absent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" /> Weekend/Holiday</span>
            </div>
          </div>

          {/* Details side card */}
          <div className="glass-panel border-white/[0.08] p-6 rounded-2xl hover:border-white/[0.12] transition duration-300 h-fit">
            <h3 className="font-bold font-display text-sm text-white border-b border-white/[0.08] pb-3 mb-4">
              Day Verification Detail
            </h3>

            {selectedDayRecord ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Date</span>
                  <span className="text-xs font-bold text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08]">{selectedDayRecord.date}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Status</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
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
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400">Check-in Time</span>
                      <span className="text-xs font-medium text-gray-200">{selectedDayRecord.time}</span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Scanned Code</span>
                      <code className="text-[10px] bg-black/40 p-2 rounded-lg text-gray-300 font-mono break-all leading-normal border border-white/[0.04]">
                        {selectedDayRecord.qrData || "N/A"}
                      </code>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-4">
                      <MdCloudDone size={14} /> Synchronized with Google Sheets
                    </div>
                  </>
                )}

                {selectedDayRecord.status === "LEAVE" && (
                  <div className="flex gap-2 items-start p-3 bg-purple-500/[0.02] border border-purple-500/10 rounded-xl text-purple-400/90 text-xs">
                    <IoAlertCircleOutline size={18} className="flex-shrink-0 mt-0.5" />
                    <span>Student marked on excused leave for this date.</span>
                  </div>
                )}

                {selectedDayRecord.status === "ABSENT" && (
                  <div className="flex gap-2 items-start p-3 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl text-rose-400/90 text-xs">
                    <IoAlertCircleOutline size={18} className="flex-shrink-0 mt-0.5" />
                    <span>No attendance recorded for this date. Logged as absent.</span>
                  </div>
                )}

                {selectedDayRecord.status === "UNMARKED" && (
                  <div className="flex gap-2 items-start p-3 bg-white/[0.01] border border-white/[0.05] rounded-xl text-gray-400 text-xs">
                    <IoAlertCircleOutline size={18} className="flex-shrink-0 mt-0.5" />
                    <span>{selectedDayRecord.message}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500 leading-relaxed">
                Click on any highlighted calendar day to view scan time and verification codes.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logs Table View */
        <div className="glass-panel border-white/[0.08] p-6 rounded-2xl hover:border-white/[0.12] transition duration-300">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full md:w-80 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center focus-within:border-brand-secondary/40 focus-within:ring-1 focus-within:ring-brand-secondary/20 transition-all duration-300">
              <IoSearchOutline size={18} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search date or check-in..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full font-medium"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {["ALL", "PRESENT", "LATE", "HALF_DAY", "LEAVE", "ABSENT"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer active:scale-95 ${
                    statusFilter === status
                      ? "bg-brand-secondary/15 border-brand-secondary/40 text-brand-secondary"
                      : "bg-white/[0.01] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04]"
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
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-in Time</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification Reference</th>
                  <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3.5 font-semibold text-gray-200">{log.date}</td>
                      <td className="py-3.5 text-gray-300">{log.time}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase ${
                          log.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                          log.status === "LATE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                          log.status === "HALF_DAY" ? "bg-sky-500/10 text-sky-400 border border-sky-500/10" :
                          log.status === "LEAVE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/10" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                        }`}>
                          {log.status === "HALF_DAY" ? "HALF DAY" : log.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-[10px] text-gray-400 max-w-[160px] truncate">
                        {log.qrData || "--"}
                      </td>
                      <td className="py-3.5 text-right">
                        {log.status !== "ABSENT" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <MdCloudDone size={14} /> Synced
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-medium">N/A</span>
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
