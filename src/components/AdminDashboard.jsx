import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { 
  IoSearchOutline, 
  IoCalendarOutline, 
  IoPeopleOutline, 
  IoAddOutline, 
  IoTrashOutline,
  IoRefreshOutline
} from "react-icons/io5";
import { MdCheckCircle, MdCancel, MdDashboard } from "react-icons/md";
import { InfinitySpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { 
  getAllClasses, 
  createClass, 
  deleteClass, 
  updateStudentAttendance 
} from "../utils/apiHelper.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form for adding new class
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  const [classFilter, setClassFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const todayStr = (() => {
    const todayObj = new Date();
    const dd = String(todayObj.getDate()).padStart(2, "0");
    const mm = String(todayObj.getMonth() + 1).padStart(2, "0");
    const yyyy = todayObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  // ─── Fetch Classes ──────────────────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classes = await getAllClasses();
        setClassesList(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [refreshTrigger]);

  // Helper to get class full name from code
  const getClassNameFromCode = (code) => {
    const cls = classesList.find(c => c.code === code);
    return cls ? `${cls.name} (${cls.code})` : code;
  };

  // ─── Fetch Dashboard Stats ──────────────────────────────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/admin/dashboard");
        setDashboardData(res.data?.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [refreshTrigger]);

  // ─── Fetch Students (debounced search) ──────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchStudents = async () => {
        try {
          const params = {};
          if (classFilter !== "ALL") params.class = getClassNameFromCode(classFilter);
          if (searchTerm.trim()) params.search = searchTerm.trim();
          const res = await axios.get("/api/v1/admin/students", { params });
          const sorted = (res.data?.data?.students || []).sort((a, b) =>
            (a.fullname || "").localeCompare(b.fullname || "")
          );
          setStudents(sorted);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [classFilter, searchTerm, classesList, refreshTrigger]);

  // ─── Fetch Report ───────────────────────────────────────────────
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const params = { month: selectedMonth, year: selectedYear };
        if (classFilter !== "ALL") params.class = getClassNameFromCode(classFilter);
        const res = await axios.get("/api/v1/admin/report", { params });
        setReport(res.data?.data?.report || []);
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };
    fetchReport();
  }, [classFilter, selectedMonth, selectedYear, classesList, refreshTrigger]);

  // Handle adding class
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) {
      toast.error("Please fill in both name and code");
      return;
    }
    try {
      setIsSubmittingClass(true);
      await createClass(newClassName.trim(), newClassCode.trim().toUpperCase());
      toast.success("Class added successfully!");
      setNewClassName("");
      setNewClassCode("");
      setShowAddClassForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add class");
    } finally {
      setIsSubmittingClass(false);
    }
  };

  // Handle deleting class
  const handleDeleteClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class? Registered students will remain but filters will change.")) return;
    try {
      await deleteClass(id);
      toast.success("Class deleted successfully");
      if (classFilter !== "ALL") setClassFilter("ALL");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  // Quick mark today's attendance for a student
  const handleQuickAttendance = async (userId, status) => {
    try {
      await updateStudentAttendance(userId, todayStr, status);
      toast.success(`Student marked as ${status} successfully`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  // Mark all unmarked students in currently filtered list as ABSENT
  const handleMarkAllAbsent = async () => {
    const unmarkedStudents = students.filter(s => s.todayStatus === "UNMARKED");
    if (unmarkedStudents.length === 0) {
      toast.info("No unmarked students to mark as absent.");
      return;
    }
    if (!window.confirm(`Are you sure you want to mark all ${unmarkedStudents.length} unmarked students as ABSENT for today?`)) return;

    try {
      setLoading(true);
      await Promise.all(
        unmarkedStudents.map(s => updateStudentAttendance(s._id, todayStr, "ABSENT"))
      );
      toast.success(`Successfully marked ${unmarkedStudents.length} students as ABSENT`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error("Some records failed to update");
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const dynamicClassTabs = ["ALL", ...classesList.map(c => c.code)];

  // ─── Helpers ────────────────────────────────────────────────────
  const getPercentageColor = (pct) => {
    if (pct >= 75) return "text-emerald-400";
    if (pct >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getPercentageBg = (pct) => {
    if (pct >= 75) return "bg-emerald-500/10 border-emerald-500/20";
    if (pct >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  const todayFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <InfinitySpin visible={true} width="200" color="#8bae66" ariaLabel="infinity-spin-loading" />
          <p className="text-white text-sm font-semibold mt-2 animate-pulse">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Students",
      value: dashboardData?.totalStudents ?? 0,
      icon: <IoPeopleOutline className="w-6 h-6" />,
      color: "text-brand-secondary",
      glow: "bg-brand-secondary/8",
      border: "border-brand-secondary/20",
    },
    {
      label: "Today Present",
      value: dashboardData?.todayPresent ?? 0,
      icon: <MdCheckCircle className="w-6 h-6" />,
      color: "text-emerald-400",
      glow: "bg-emerald-500/8",
      border: "border-emerald-500/20",
    },
    {
      label: "Today Absent",
      value: dashboardData?.todayAbsent ?? 0,
      icon: <MdCancel className="w-6 h-6" />,
      color: "text-rose-400",
      glow: "bg-rose-500/8",
      border: "border-rose-500/20",
    },
    {
      label: "Total Records",
      value: dashboardData?.totalRecords ?? 0,
      icon: <MdDashboard className="w-6 h-6" />,
      color: "text-brand-secondary",
      glow: "bg-brand-secondary/8",
      border: "border-brand-secondary/20",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* ── Ambient background glows ──────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      {/* ══════════════════════════════════════════════════════════════
          1. HEADER
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-brand-secondary mb-3">
            Admin Panel
          </span>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Teacher <span className="text-brand-secondary">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-medium">{todayFormatted}</p>
        </div>

        <NavLink to="/">
          <button className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-300 hover:text-white transition duration-200 active:scale-95 cursor-pointer flex items-center gap-2">
            <MdDashboard size={14} />
            Back to Dashboard
          </button>
        </NavLink>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. STATS OVERVIEW CARDS
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass-panel ${stat.border} p-5 rounded-2xl hover:border-white/[0.12] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
          >
            {/* Ambient glow */}
            <div className={`absolute -top-4 -right-4 w-20 h-20 ${stat.glow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">{stat.label}</span>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold font-display text-white">{stat.value}</h3>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2.5. CLASS-WISE ATTENDANCE OVERVIEW CARDS (NEW)
      ══════════════════════════════════════════════════════════════ */}
      {dashboardData?.classStats && dashboardData.classStats.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <IoPeopleOutline className="text-brand-secondary" size={18} />
            <h2 className="text-lg font-bold font-display text-white">Class-wise Attendance Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.classStats.map((cStat) => (
              <div
                key={cStat.id || cStat.code}
                onClick={() => setClassFilter(cStat.code)}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  classFilter === cStat.code
                    ? "border-brand-secondary bg-brand-secondary/[0.04] shadow-md shadow-brand-secondary/5"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate" title={cStat.fullName}>{cStat.fullName}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Students: {cStat.totalStudents}</p>
                  </div>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md flex-shrink-0 ${
                    cStat.rate >= 75 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    cStat.rate >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {cStat.rate}% Present
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/[0.03] border border-white/[0.06] h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cStat.rate >= 75 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                      cStat.rate >= 50 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                      "bg-gradient-to-r from-rose-500 to-rose-400"
                    }`}
                    style={{ width: `${cStat.rate}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] text-center text-gray-400">
                  <div className="bg-white/[0.02] p-1 rounded">
                    <span className="block text-emerald-400 font-bold">{cStat.presentToday}</span>
                    <span>Pres</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded">
                    <span className="block text-sky-400 font-bold">{cStat.halfDayToday}</span>
                    <span>Half</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded">
                    <span className="block text-purple-400 font-bold">{cStat.leaveToday}</span>
                    <span>Leave</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded">
                    <span className="block text-rose-400 font-bold">{cStat.absentToday}</span>
                    <span>Abs</span>
                  </div>
                </div>

                {/* Delete button (only for added classes, i.e., classes in classesList that we might want to delete) */}
                {classesList.some(cl => cl._id === cStat.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(cStat.id);
                    }}
                    title="Delete Class"
                    className="absolute bottom-2.5 right-2.5 p-1 text-gray-500 hover:text-rose-400 rounded-md border border-transparent hover:border-rose-500/20 hover:bg-rose-500/5 transition cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <IoTrashOutline size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. CLASS FILTER TABS & MANAGEMENT
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6 border-b border-white/[0.06] pb-4">
        <div className="flex flex-wrap gap-2">
          {dynamicClassTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setClassFilter(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
                classFilter === tab
                  ? "bg-brand-secondary/15 border-brand-secondary/40 text-brand-secondary shadow-sm shadow-brand-secondary/10"
                  : "bg-white/[0.01] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddClassForm(!showAddClassForm)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-secondary/30 bg-brand-secondary/5 hover:bg-brand-secondary/10 text-brand-secondary hover:text-white transition duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={14} />
            Add Class
          </button>
        </div>
      </div>

      {/* Dynamic Add Class Form inline */}
      {showAddClassForm && (
        <form onSubmit={handleAddClass} className="glass-panel border-brand-secondary/20 bg-brand-secondary/[0.01] p-5 rounded-2xl mb-8 relative max-w-xl animate-fadeIn">
          <h3 className="text-sm font-bold font-display text-white mb-4">Add Dynamic Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Class/Trade Name</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-white/[0.08] bg-white/[0.01] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-secondary/50 transition"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Short Code (2-4 characters)</label>
              <input
                type="text"
                placeholder="e.g. AI"
                maxLength={4}
                value={newClassCode}
                onChange={(e) => setNewClassCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-white/[0.08] bg-white/[0.01] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-secondary/50 transition uppercase"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowAddClassForm(false)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.03] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingClass}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-secondary text-[#1b211a] hover:bg-[#cbe5ac] transition flex items-center justify-center min-h-[34px]"
            >
              {isSubmittingClass ? "Saving..." : "Create Class"}
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════
          4. SEARCH BAR & QUICK ACTIONS
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-brand-secondary/40 focus-within:ring-1 focus-within:ring-brand-secondary/20 transition-all duration-300">
            <IoSearchOutline size={18} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, enrollment, mobile, or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full font-medium"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleMarkAllAbsent}
            className="w-full md:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-white transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MdCancel size={14} />
            Mark Unmarked as Absent
          </button>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] text-gray-400 hover:text-white transition cursor-pointer active:scale-95 flex items-center justify-center"
          >
            <IoRefreshOutline size={16} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          5. STUDENT TABLE
      ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel border-white/[0.08] rounded-2xl p-6 mb-10 hover:border-white/[0.12] transition duration-300">
        <h2 className="text-lg font-bold font-display text-white mb-1">Student Directory</h2>
        <p className="text-[10px] text-gray-500 font-medium mb-6">
          {students.length} student{students.length !== 1 ? "s" : ""} found
          {classFilter !== "ALL" ? ` in ${classFilter}` : ""}
        </p>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Roll No</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrollment</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Present</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Late</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Half Day</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Leave</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Absent</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Today's Attendance (Quick Mark)</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Attendance %</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-xs">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-gray-500 font-medium">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student, index) => {
                  const pct = student.attendancePercentage ?? 0;
                  const getStatusButtonClass = (btnStatus, currentStatus) => {
                    const base = "w-6 h-6 rounded-md text-[9px] font-black transition-all flex items-center justify-center cursor-pointer active:scale-90 border ";
                    if (currentStatus === btnStatus) {
                      if (btnStatus === "PRESENT") return base + "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10";
                      if (btnStatus === "LATE") return base + "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10";
                      if (btnStatus === "HALF_DAY") return base + "bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm shadow-sky-500/10";
                      if (btnStatus === "LEAVE") return base + "bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-sm shadow-purple-500/10";
                      if (btnStatus === "ABSENT") return base + "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/10";
                    }
                    return base + "bg-white/[0.02] text-gray-500 border-white/[0.05] hover:text-white hover:bg-white/[0.06]";
                  };
                  return (
                    <tr key={student._id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="py-3.5 text-gray-500 font-medium">{index + 1}</td>
                      <td className="py-3.5 font-semibold text-gray-200 group-hover:text-white transition-colors">{student.fullname}</td>
                      <td className="py-3.5 text-gray-300">{student.rollNo ?? "—"}</td>
                      <td className="py-3.5 text-gray-400 font-mono text-[11px]">{student.enrollmentNo}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide bg-white/[0.03] border border-white/[0.06] text-gray-300">
                          {student.class ?? "—"}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-emerald-400 font-semibold">{student.presentCount ?? 0}</td>
                      <td className="py-3.5 text-center text-amber-400 font-semibold">{student.lateCount ?? 0}</td>
                      <td className="py-3.5 text-center text-sky-400 font-semibold">{student.halfDayCount ?? 0}</td>
                      <td className="py-3.5 text-center text-purple-400 font-semibold">{student.leaveCount ?? 0}</td>
                      <td className="py-3.5 text-center text-rose-400 font-semibold">{student.absentCount ?? 0}</td>
                      <td className="py-3.5 text-center">
                        <div className="flex gap-1 justify-center items-center">
                          <button
                            onClick={() => handleQuickAttendance(student._id, "PRESENT")}
                            className={getStatusButtonClass("PRESENT", student.todayStatus)}
                            title="Present"
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(student._id, "LATE")}
                            className={getStatusButtonClass("LATE", student.todayStatus)}
                            title="Late"
                          >
                            L
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(student._id, "HALF_DAY")}
                            className={getStatusButtonClass("HALF_DAY", student.todayStatus)}
                            title="Half Day"
                          >
                            H
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(student._id, "LEAVE")}
                            className={getStatusButtonClass("LEAVE", student.todayStatus)}
                            title="Leave"
                          >
                            V
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(student._id, "ABSENT")}
                            className={getStatusButtonClass("ABSENT", student.todayStatus)}
                            title="Absent"
                          >
                            A
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPercentageBg(pct)} ${getPercentageColor(pct)}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <NavLink to={`/admin/student/${student._id}`}>
                          <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-brand-secondary/10 border border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary/20 hover:border-brand-secondary/50 transition-all duration-200 active:scale-95 cursor-pointer">
                            View
                          </button>
                        </NavLink>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          6. CLASS ATTENDANCE REPORT
      ══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition duration-300">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <IoCalendarOutline className="text-brand-secondary" size={18} />
              <h2 className="text-lg font-bold font-display text-white">Date-wise Attendance Report</h2>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              {classFilter !== "ALL" ? getClassNameFromCode(classFilter) : "All Classes"} • {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          {/* Month / Year Selectors */}
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-medium outline-none focus:border-brand-secondary/40 focus:ring-1 focus:ring-brand-secondary/20 transition-all duration-300 cursor-pointer appearance-none"
              style={{ backgroundImage: "none" }}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1} className="bg-dark-bg text-white">
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-medium outline-none focus:border-brand-secondary/40 focus:ring-1 focus:ring-brand-secondary/20 transition-all duration-300 cursor-pointer appearance-none"
              style={{ backgroundImage: "none" }}
            >
              <option value={now.getFullYear()} className="bg-dark-bg text-white">{now.getFullYear()}</option>
              <option value={now.getFullYear() - 1} className="bg-dark-bg text-white">{now.getFullYear() - 1}</option>
            </select>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Present</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Late</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Absent</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Total</th>
                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-xs">
              {report.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    No report data available for this period.
                  </td>
                </tr>
              ) : (
                report.map((row, index) => {
                  const rowPct = row.total > 0 ? Math.round(((row.present + row.late) / row.total) * 100) : 0;
                  return (
                    <tr key={index} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3.5 font-semibold text-gray-200">{row.date}</td>
                      <td className="py-3.5 text-center text-emerald-400 font-semibold">{row.present}</td>
                      <td className="py-3.5 text-center text-amber-400 font-semibold">{row.late}</td>
                      <td className="py-3.5 text-center text-rose-400 font-semibold">{row.absent}</td>
                      <td className="py-3.5 text-center text-gray-300 font-medium">{row.total}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPercentageBg(rowPct)} ${getPercentageColor(rowPct)}`}>
                          {rowPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
