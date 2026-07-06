import axios from "axios";

// Helper to map backend attendance record to frontend structure
const mapAttendanceRecord = (rec) => {
  if (!rec) return null;
  return {
    id: rec._id,
    date: rec.presentDays || rec.date, // Maps presentDays/date
    time: rec.activeDays || rec.checkIn,   // Maps activeDays/checkIn
    checkOut: rec.checkOut || "",
    status: rec.monthlyAttendance || rec.status, // Maps status
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

export async function refreshToken() {
  try {
    await axios.post('/api/v1/user/refresh-token');
    return true;
  } catch {
    return false;
  }
}

export const addAttendanceRecord = async (dateStr, timeStr, qrData, status = "PRESENT", session = "", organizationId = "", departmentId = "", extraParams = {}) => {
  try {
    const response = await axios.post("/api/v1/attendance", {
      presentDays: dateStr,
      activeDays: timeStr,
      monthlyAttendance: status,
      googleSheetLink: qrData,
      session,
      organizationId,
      departmentId,
      ...extraParams
    });
    return mapAttendanceRecord(response.data.data.attendance);
  } catch (error) {
    console.error("Error saving attendance record to API:", error);
    throw error;
  }
};

export const attendanceCheckout = async (dateStr, timeStr) => {
  try {
    const response = await axios.post("/api/v1/attendance/checkout", {
      date: dateStr,
      checkOut: timeStr
    });
    return mapAttendanceRecord(response.data.data.attendance);
  } catch (error) {
    console.error("Error checking out user:", error);
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
    if (classFilter && classFilter !== "ALL") params.department = classFilter;
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
    if (classFilter && classFilter !== "ALL") params.department = classFilter;
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

export const getPublicOrganizations = async () => {
  try {
    const response = await axios.get("/api/v1/public/organizations");
    return response.data.data.organizations || [];
  } catch (error) {
    console.error("Error fetching public organizations:", error);
    return [];
  }
};

export const updateAccountDetails = async (details) => {
  try {
    const response = await axios.patch("/api/v1/user/update-account-details", details);
    return response.data.data.user;
  } catch (error) {
    console.error("Error updating account details:", error);
    throw error;
  }
};

// SaaS-Specific Wrappers
export const registerOrganization = async (orgData) => {
  try {
    const response = await axios.post("/api/v1/organizations/register", orgData);
    return response.data.data;
  } catch (error) {
    console.error("Error registering organization:", error);
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await axios.get("/api/v1/departments");
    return response.data.data.departments || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

export const createDepartment = async (name, code, description = "") => {
  try {
    const response = await axios.post("/api/v1/departments", { name, code, description });
    return response.data.data.department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    await axios.delete(`/api/v1/departments/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};

export const inviteUser = async (userData) => {
  try {
    const response = await axios.post("/api/v1/user/users", userData);
    return response.data.data.user;
  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
};

export const getUsers = async (role = "", departmentId = "", search = "") => {
  try {
    const params = {};
    if (role) params.role = role;
    if (departmentId) params.departmentId = departmentId;
    if (search) params.search = search;
    const response = await axios.get("/api/v1/user/users", { params });
    return response.data.data.users || [];
  } catch (error) {
    console.error("Error fetching users list:", error);
    return [];
  }
};

export const downloadReport = async (type, params) => {
  try {
    const response = await axios.get(`/api/v1/reports/${type}`, {
      params: { ...params, format: "csv" },
      responseType: "blob"
    });
    // Create local URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (error) {
    console.error(`Error downloading ${type} report:`, error);
    throw error;
  }
};

export const generateQrCode = async (dateCode, expiresIn, departmentId) => {
  try {
    const response = await axios.post("/api/v1/attendance/generate-qr", { dateCode, expiresIn, departmentId });
    return response.data.data.qrPayload;
  } catch (error) {
    console.error("Error generating QR payload:", error);
    throw error;
  }
};
