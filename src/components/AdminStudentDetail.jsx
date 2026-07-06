import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import {
  IoCalendarOutline,
  IoChevronBack,
  IoChevronForward,
  IoAlertCircleOutline,
} from "react-icons/io5";
import {
  MdCheckCircle,
  MdCancel,
  MdWatchLater,
  MdCloudDone,
  MdArrowBack,
} from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { InfinitySpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { updateStudentAttendance } from "../utils/apiHelper.js";

const AdminStudentDetail = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Log search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Day detail side panel
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [updatedTime, setUpdatedTime] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const handleUpdateStatusLocal = (status) => {
    setUpdatedStatus(status);
    if (status === "ABSENT" || status === "LEAVE") {
      setUpdatedTime("");
    } else if (!updatedTime) {
      const defaultTimes = {
        PRESENT: "09:00 AM",
        LATE: "10:30 AM",
        HALF_DAY: "12:00 PM"
      };
      setUpdatedTime(defaultTimes[status] || "09:00 AM");
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedDayRecord) return;
    if (isSavingStatus) return;
    try {
      setIsSavingStatus(true);
      await updateStudentAttendance(
        userId,
        selectedDayRecord.date,
        updatedStatus,
        updatedTime
      );
      toast.success("Attendance status updated successfully!");
      
      // Refresh student data
      await fetchStudentData();
      
      // Reset sidebar selection with fresh data
      setSelectedDayRecord(null);
    } catch (error) {
      toast.error("Failed to update attendance status.");
      console.error(error);
    } finally {
      setIsSavingStatus(false);
    }
  };

  // ─── Data Fetching ──────────────────────────────────────────────
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `/api/v1/admin/students/${userId}/attendance`
      );
      const { student: s, history } = response.data?.data || {};

      setStudent(s);

      // Map backend fields → frontend fields
      const mapped = (history || []).map((rec) => ({
        id: rec._id,
        date: rec.presentDays,       // DD/MM/YYYY
        time: rec.activeDays,        // time string
        status: rec.monthlyAttendance, // PRESENT / LATE / ABSENT
        qrData: rec.googleSheetLink,
        createdAt: rec.createdAt,
        synced: true,
      }));

      setAttendance(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student attendance:", err);
      setError("Student not found or failed to load data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─── Calendar Helpers ───────────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
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

    const record = attendance.find((r) => r.date === dateStr);
    if (record) return record;

    const dateObj = new Date(year, month, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSunday = dateObj.getDay() === 0;
    const isPast = dateObj < today;

    if (isPast && !isSunday) {
      return {
        date: dateStr,
        status: "ABSENT",
        message: "No attendance recorded for this class day.",
        synced: false,
      };
    }
    return null;
  };

  // Records for the displayed calendar month
  const currentMonthRecords = attendance.filter((r) => {
    if (!r.date) return false;
    const parts = r.date.split("/");
    if (parts.length !== 3) return false;
    const rMonth = parseInt(parts[1], 10) - 1;
    const rYear = parseInt(parts[2], 10);
    return rMonth === month && rYear === year;
  });

  // ─── Stats ──────────────────────────────────────────────────────
  const todayObj = new Date();
  const isCurrentMonth =
    todayObj.getFullYear() === year && todayObj.getMonth() === month;
  const isPastMonth =
    new Date(year, month, 1) <
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);

  const endDayForStats = isCurrentMonth
    ? todayObj.getDate()
    : isPastMonth
    ? daysInMonth
    : 0;

  let totalClassDays = 0;
  for (let d = 1; d <= endDayForStats; d++) {
    const dateObj = new Date(year, month, d);
    if (dateObj.getDay() !== 0) totalClassDays++;
  }

  const presentDays = currentMonthRecords.filter(
    (r) => r.status === "PRESENT"
  ).length;
  const lateDays = currentMonthRecords.filter(
    (r) => r.status === "LATE"
  ).length;
  const halfDays = currentMonthRecords.filter(
    (r) => r.status === "HALF_DAY"
  ).length;
  const leaveDays = currentMonthRecords.filter(
    (r) => r.status === "LEAVE"
  ).length;
  const absentDays = Math.max(0, totalClassDays - (presentDays + lateDays + halfDays + leaveDays));
  
  const evaluatedDays = totalClassDays - leaveDays;
  const overallPercentage =
    evaluatedDays > 0
      ? Math.round(((presentDays + lateDays + (halfDays * 0.5)) / evaluatedDays) * 100)
      : 100;

  // ─── Monthly Logs (with virtual absent records) ─────────────────
  const monthlyLogs = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const isSunday = dateObj.getDay() === 0;
    const isFuture = dateObj > new Date();

    if (isSunday || isFuture) continue;

    const paddedDay = String(d).padStart(2, "0");
    const paddedMo = String(month + 1).padStart(2, "0");
    const dateStr = `${paddedDay}/${paddedMo}/${year}`;

    const record = attendance.find((r) => r.date === dateStr);
    if (record) {
      monthlyLogs.push(record);
    } else {
      monthlyLogs.push({
        id: `virtual-absent-${dateStr}`,
        date: dateStr,
        time: "--",
        status: "ABSENT",
        qrData: null,
        synced: false,
      });
    }
  }

  // Sort descending (latest first)
  monthlyLogs.sort((a, b) => {
    const pA = a.date.split("/");
    const pB = b.date.split("/");
    return (
      new Date(pB[2], pB[1] - 1, pB[0]) - new Date(pA[2], pA[1] - 1, pA[0])
    );
  });

  // Filtered Logs
  const filteredLogs = monthlyLogs.filter((log) => {
    const matchesSearch =
      log.date.includes(searchTerm) ||
      (log.time && log.time.includes(searchTerm));
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && log.status === statusFilter;
  });

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <InfinitySpin
            visible={true}
            width="200"
            color="#2F2FE4"
            ariaLabel="infinity-spin-loading"
          />
          <p className="text-white text-sm font-semibold mt-2 animate-pulse">
            Loading student report...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────
  if (error || !student) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-6">
        <div className="glass-panel border-white/[0.08] p-10 rounded-2xl text-center max-w-md">
          <IoAlertCircleOutline className="text-rose-400 w-14 h-14 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-white mb-2">
            Student Not Found
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {error || "The requested student record could not be loaded."}
          </p>
          <NavLink to="/admin">
            <button className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 hover:text-white transition duration-200 active:scale-95 cursor-pointer">
              <MdArrowBack className="inline mr-1.5 -mt-0.5" size={14} />
              Back to Admin Panel
            </button>
          </NavLink>
        </div>
      </main>
    );
  }

  // ─── Calendar Day Cells ─────────────────────────────────────────
  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-11 sm:h-14 md:h-16 w-full bg-white/[0.01] border border-white/[0.02] rounded-xl opacity-30" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const record = getRecordForDate(day);
    const dateObj = new Date(year, month, day);
    const isSunday = dateObj.getDay() === 0;
    const isFuture = dateObj > new Date();

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
          const rec = record || {
            date: dateStr,
            status: "UNMARKED",
            message: "No attendance recorded for this class day.",
          };
          setSelectedDayRecord(rec);
          setUpdatedStatus(rec.status === "UNMARKED" ? "PRESENT" : rec.status);
          setUpdatedTime(rec.time && rec.time !== "--" ? rec.time : "");
        }}
        className={`h-11 sm:h-14 md:h-16 w-full flex flex-col justify-between p-1 sm:p-1.5 border rounded-xl transition duration-150 relative cursor-pointer active:scale-95 ${cellClass} ${
          isToday ? "ring-1 ring-brand-secondary/40" : ""
        }`}
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

  // ─── Student Info Items ─────────────────────────────────────────
  const infoItems = [
    { label: "Full Name", value: student.fullname || "N/A" },
    { label: "Enrollment No", value: student.enrollmentNo || "N/A" },
    { label: "Mobile", value: student.mobileNo || "N/A" },
    { label: "Email", value: student.email || "N/A" },
    { label: "Class", value: student.class || "N/A" },
    { label: "Roll No", value: student.rollNo || "N/A" },
    { label: "Age", value: student.age || "N/A" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-5 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-brand-secondary mb-2">
            Student Report
          </span>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            <span className="text-brand-secondary">{student.fullname}</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-medium">
            Enrollment: {student.enrollmentNo || "N/A"} | Class: {student.class || "N/A"} | Roll No: {student.rollNo || "N/A"}
          </p>
        </div>

        <NavLink to="/admin">
          <button className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 hover:text-white transition duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 font-sans">
            <MdArrowBack size={14} />
            Back to Admin Panel
          </button>
        </NavLink>
      </div>

      {/* Student Information Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-xl mb-5 neon-border transition duration-300">
        <h3 className="text-[10px] font-bold font-display text-white uppercase tracking-wider border-b border-white/[0.04] pb-1.5 mb-3.5">
          Student Information Profile
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
          {infoItems.map((item) => (
            <div key={item.label}>
              <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">
                {item.label}
              </span>
              <span className="text-xs text-white font-semibold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {/* Present Card */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex flex-col justify-between neon-border-emerald">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Present</span>
            <MdCheckCircle className="text-emerald-400 w-4 h-4" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold font-display text-white">{presentDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Full class days</p>
          </div>
        </div>

        {/* Late Card */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex flex-col justify-between neon-border-amber">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Late</span>
            <MdWatchLater className="text-amber-400 w-4 h-4" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold font-display text-white">{lateDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Arrived tardy</p>
          </div>
        </div>

        {/* Half Day Card */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex flex-col justify-between neon-border-cyan">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Half Day</span>
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold font-display text-white">{halfDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Partial check-in</p>
          </div>
        </div>

        {/* Leave Card */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex flex-col justify-between neon-border-purple">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Leave</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold font-display text-white">{leaveDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Excused days</p>
          </div>
        </div>

        {/* Absent Card */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex flex-col justify-between neon-border-rose">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">Absent</span>
            <MdCancel className="text-rose-400 w-4 h-4" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold font-display text-white">{absentDays}</h3>
            <p className="text-[9px] text-gray-500 font-medium">Unexcused missing</p>
          </div>
        </div>

        {/* Attendance % with SVG ring */}
        <div className="glass-panel p-3 rounded-xl hover:-translate-y-0.5 transition-transform flex items-center justify-around gap-2 neon-border-cyan">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-white/[0.03]"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-brand-secondary transition-all duration-1000 ease-out"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - overallPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-bold font-display text-white">
                {overallPercentage}%
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold font-display text-white truncate">
              Rate
            </h4>
            <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">
              {overallPercentage >= 75 ? "Above 75% limit" : "Below threshold"}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar View & Update status tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Calendar Box */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-5 rounded-xl transition duration-300 neon-border-cyan">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-display text-sm text-white flex items-center gap-2">
              <IoCalendarOutline className="text-brand-secondary" />
              {monthNames[month]} {year}
            </h3>

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

          {/* Days labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, index) => (
              <div
                key={d}
                className={`text-center text-[9px] font-bold uppercase tracking-wider ${
                  index === 0 ? "text-rose-500" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-white/[0.04] text-[8px] text-gray-400 font-bold justify-center">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Half Day
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Leave
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10" />
              Non-work
            </span>
          </div>
        </div>

        {/* Day Detail Side Card (Status updating tools) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-xl transition duration-300 h-fit neon-border-indigo">
          <h3 className="font-bold font-display text-xs text-white border-b border-white/[0.04] pb-2 mb-3">
            Day Verification Detail
          </h3>

          {selectedDayRecord ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-400">Date</span>
                <span className="font-mono font-bold text-white bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.08]">
                  {selectedDayRecord.date}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-400">Status</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    selectedDayRecord.status === "PRESENT"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : selectedDayRecord.status === "LATE"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : selectedDayRecord.status === "HALF_DAY"
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      : selectedDayRecord.status === "LEAVE"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : selectedDayRecord.status === "ABSENT"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-white/5 text-gray-400 border border-white/10"
                  }`}
                >
                  {selectedDayRecord.status === "HALF_DAY" ? "HALF DAY" : selectedDayRecord.status}
                </span>
              </div>

              {/* Status Update Section */}
              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  Update Attendance Status
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {["PRESENT", "LATE", "HALF_DAY", "LEAVE", "ABSENT"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatusLocal(st)}
                      className={`py-1 text-[8px] font-black rounded-lg border transition active:scale-95 cursor-pointer ${
                        updatedStatus === st
                          ? st === "PRESENT" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                            st === "LATE" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                            st === "HALF_DAY" ? "bg-sky-500/20 text-sky-400 border-sky-500/40" :
                            st === "LEAVE" ? "bg-purple-500/20 text-purple-400 border-purple-500/40" :
                            "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-white"
                      }`}
                    >
                      {st === "HALF_DAY" ? "HALF" : st === "PRESENT" ? "PRES" : st === "LATE" ? "LATE" : st === "LEAVE" ? "LEVE" : "ABS"}
                    </button>
                  ))}
                </div>

                {updatedStatus !== "ABSENT" && updatedStatus !== "LEAVE" && (
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Check-in Time (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:15 AM"
                      value={updatedTime}
                      onChange={(e) => setUpdatedTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-white/[0.08] bg-white/[0.01] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-brand-secondary/50 transition font-medium"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSavingStatus}
                  onClick={handleSaveStatus}
                  className="w-full py-2 px-4 text-[#1b211a] font-bold rounded-xl bg-brand-secondary hover:bg-[#cbe5ac] active:scale-98 transition transform text-xs flex items-center justify-center cursor-pointer min-h-[30px]"
                >
                  {isSavingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>

              {selectedDayRecord.status !== "UNMARKED" &&
                selectedDayRecord.status !== "ABSENT" &&
                selectedDayRecord.status !== "LEAVE" && (
                  <>
                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.04] text-xs">
                      <span className="font-semibold text-gray-400">
                        Check-in Time
                      </span>
                      <span className="font-medium text-gray-200">
                        {selectedDayRecord.time}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        QR Scanned Code
                      </span>
                      <code className="text-[10px] bg-black/40 p-2 rounded-lg text-gray-300 font-mono break-all leading-normal border border-white/[0.04]">
                        {selectedDayRecord.qrData || "N/A"}
                      </code>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-4">
                      <MdCloudDone size={14} /> Synchronized with Cloud
                    </div>
                  </>
                )}

              {selectedDayRecord.status === "LEAVE" && (
                <div className="flex gap-2 items-start p-3 bg-purple-500/[0.02] border border-purple-500/10 rounded-xl text-purple-400/90 text-xs">
                  <IoAlertCircleOutline
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <span>
                    Student marked on excused leave for this date.
                  </span>
                </div>
              )}

              {selectedDayRecord.status === "ABSENT" && (
                <div className="flex gap-2 items-start p-3 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl text-rose-400/90 text-xs">
                  <IoAlertCircleOutline
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <span>
                    No attendance recorded for this date. Logged as absent.
                  </span>
                </div>
              )}

              {selectedDayRecord.status === "UNMARKED" && (
                <div className="flex gap-2 items-start p-3 bg-white/[0.01] border border-white/[0.05] rounded-xl text-gray-400 text-xs">
                  <IoAlertCircleOutline
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <span>{selectedDayRecord.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 leading-relaxed font-medium">
              Click on any highlighted calendar day to view scan details and update attendance statuses.
            </div>
          )}
        </div>
      </div>

      {/* ──── Attendance Log Table ──── */}
      <div className="glass-panel border-white/[0.08] p-6 rounded-2xl hover:border-white/[0.12] transition duration-300">
        <h3 className="font-bold font-display text-sm text-white border-b border-white/[0.08] pb-3 mb-5">
          Attendance Log — {monthNames[month]} {year}
        </h3>

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
            {["ALL", "PRESENT", "LATE", "HALF_DAY", "LEAVE", "ABSENT"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer active:scale-95 ${
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
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  QR Reference
                </th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  Sync Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-gray-500 font-medium"
                  >
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.01] transition-all"
                  >
                    <td className="py-3.5 font-semibold text-gray-200">
                      {log.date}
                    </td>
                    <td className="py-3.5 text-gray-300">{log.time}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase ${
                          log.status === "PRESENT"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                            : log.status === "LATE"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                            : log.status === "HALF_DAY"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/10"
                            : log.status === "LEAVE"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/10"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                        }`}
                      >
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
                        <span className="text-[10px] text-gray-500 font-medium">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminStudentDetail;
