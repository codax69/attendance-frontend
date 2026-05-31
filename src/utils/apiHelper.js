import axios from "axios";

// Helper to map backend attendance record to frontend structure
const mapAttendanceRecord = (rec) => {
  if (!rec) return null;
  return {
    id: rec._id,
    date: rec.presentDays, // Maps presentDays to date
    time: rec.activeDays,   // Maps activeDays to time
    status: rec.monthlyAttendance, // Maps monthlyAttendance to status
    qrData: rec.googleSheetLink,   // Maps googleSheetLink to qrData
    synced: true
  };
};

// Helper to map backend notification to frontend structure
const mapNotification = (notif) => {
  if (!notif) return null;
  return {
    id: notif._id,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    read: notif.read,
    time: notif.createdAt
  };
};

// Attendance API Wrappers
export const getAttendanceRecords = async () => {
  try {
    const response = await axios.get("/api/v1/attendance-history");
    const history = response.data.data.history || [];
    return history.map(mapAttendanceRecord);
  } catch (error) {
    console.error("Error fetching attendance history from API:", error);
    return [];
  }
};

export const getAttendanceRecordsForUser = async (mobileNo) => {
  if (!mobileNo) throw new Error('Invalid mobileNo passed to getAttendanceRecordsForUser');
  try {
    const response = await axios.get(`/api/v1/attendance-history/${mobileNo}`);
    const history = response.data.data.history || [];
    return history.map(mapAttendanceRecord);
  } catch (error) {
    console.error(`Error fetching attendance history for mobile ${mobileNo} from API:`, error);
    return [];
  }
};

export const addAttendanceRecord = async (dateStr, timeStr, qrData, status = "PRESENT") => {
  try {
    const response = await axios.post("/api/v1/attendance", {
      presentDays: dateStr,
      activeDays: timeStr,
      monthlyAttendance: status,
      googleSheetLink: qrData
    });
    return mapAttendanceRecord(response.data.data.attendance);
  } catch (error) {
    console.error("Error saving attendance record to API:", error);
    throw error;
  }
};

// Notifications API Wrappers
export const getNotifications = async () => {
  try {
    const response = await axios.get("/api/v1/notifications");
    const notifications = response.data.data.notifications || [];
    return notifications.map(mapNotification);
  } catch (error) {
    console.error("Error fetching notifications from API:", error);
    return [];
  }
};

export const addNotification = async (title, message, type = "info") => {
  try {
    const response = await axios.post("/api/v1/notifications", {
      title,
      message,
      type
    });
    return mapNotification(response.data.data.notification);
  } catch (error) {
    console.error("Error creating notification via API:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  if (!id) throw new Error('Invalid notification id');
  try {
    const response = await axios.patch(`/api/v1/notifications/${id}/read`);
    return mapNotification(response.data.data.notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch("/api/v1/notifications/read-all");
    const notifications = response.data.data.notifications || [];
    return notifications.map(mapNotification);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  if (!id) throw new Error('Invalid notification id');
  try {
    await axios.delete(`/api/v1/notifications/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const clearAllNotifications = async () => {
  try {
    await axios.delete("/api/v1/notifications");
    return [];
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    throw error;
  }
};

// Admin API Wrappers
export const getAdminDashboard = async () => {
  try {
    const response = await axios.get("/api/v1/admin/dashboard");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

export const getAdminStudents = async (classFilter = "ALL", search = "") => {
  try {
    const params = {};
    if (classFilter && classFilter !== "ALL") params.class = classFilter;
    if (search) params.search = search;
    const response = await axios.get("/api/v1/admin/students", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin students:", error);
    throw error;
  }
};

export const getStudentAttendanceById = async (userId) => {
  if (!userId) throw new Error('Invalid userId passed to getStudentAttendanceById');
  try {
    const response = await axios.get(`/api/v1/admin/students/${userId}/attendance`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    throw error;
  }
};

export const getAdminClassReport = async (classFilter = "ALL", month, year) => {
  try {
    const params = {};
    if (classFilter && classFilter !== "ALL") params.class = classFilter;
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await axios.get("/api/v1/admin/report", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin class report:", error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const response = await axios.get("/api/v1/user/classes");
    return response.data.data.classes || [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

export const createClass = async (name, code) => {
  try {
    const response = await axios.post("/api/v1/admin/class", { name, code });
    return response.data.data.class;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

export const deleteClass = async (id) => {
  if (!id && id !== 0) throw new Error('Invalid id parameter for deleteClass');
  try {
    await axios.delete(`/api/v1/admin/class/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

export const updateStudentAttendance = async (userId, date, status, time) => {
  if (!userId) throw new Error('Missing required parameter: userId');
  if (!date) throw new Error('Missing required parameter: date');
  if (!status) throw new Error('Missing required parameter: status');
  try {
    const response = await axios.post("/api/v1/admin/attendance/update", {
      userId,
      date,
      status,
      time
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating student attendance:", error);
    throw error;
  }
};
