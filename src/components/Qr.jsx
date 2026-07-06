import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { addAttendanceRecord, addNotification } from "../utils/apiHelper.js";

const Qr = () => {
  const [QRData, setQRData] = useState(null);
  const scannerRef = useRef(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const { devices } = useDevices();
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (devices && devices.length > 0) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices]);

  const FetchDataFromDb = async () => {
    try {
      const response = await axios.get("/api/v1/user/get-current-user");
      const data = response.data.data.user;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    FetchDataFromDb();
  }, []);

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      setQRData(scannedValue);
      stopScanner();
    } else {
      console.log("No scan result");
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      const stream = scannerRef.current.stream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const date = new Date();
  let formattedDate = format(date, "dd/MM/yyyy");
  let formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "numeric",
  });

  const ProcessAttendanceMark = async () => {
    if (isSubmitting) return;

    let session = "";
    let orgId = "";
    let deptId = "";
    let payload = null;

    if (QRData) {
      try {
        // Try decoding as plain JSON first
        try {
          payload = JSON.parse(QRData);
        } catch (e) {
          // Fallback to base64 decoding (legacy QR format)
          const decoded = decodeURIComponent(escape(atob(QRData)));
          payload = JSON.parse(decoded);
        }

        // Validate SaaS Multi-Tenant boundaries (Phase 6 Department validation)
        if (payload.organizationId && userData?.organizationId && String(payload.organizationId) !== String(userData.organizationId)) {
          toast.error("Access Denied: You do not belong to this organization.");
          setQRData(null);
          return;
        }

        if (payload.departmentId && userData?.departmentId && String(payload.departmentId) !== String(userData.departmentId)) {
          toast.error("Access Denied: You do not belong to this department.");
          setQRData(null);
          return;
        }

        // Legacy Department Code check (if present)
        if (payload.deptCode && userData?.departmentCode) {
          if (payload.deptCode.trim().toUpperCase() !== (userData.departmentCode || "").trim().toUpperCase()) {
            toast.error(`Access Denied: This QR belongs to department "${payload.deptName || payload.deptCode}".`);
            setQRData(null);
            return;
          }
        }

        // Expiry check
        if (payload.expiresAt && Date.now() > payload.expiresAt) {
          toast.error("This QR code has expired.");
          setQRData(null);
          return;
        }

        session = payload.dateCode || payload.session || "";
        orgId = payload.organizationId || userData?.organizationId || "";
        deptId = payload.departmentId || userData?.departmentId || "";

      } catch (err) {
        console.error("QR validation failed:", err);
        toast.error("Invalid QR Code: Please scan a valid department-locked QR Code.");
        setQRData(null);
        return;
      }
    } else {
      toast.error("Invalid QR Code data.");
      setQRData(null);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Optional Google Sheets Sync (backward compatibility)
      try {
        const formData = new FormData();
        formData.append("FULL_NAME", userData.fullname);
        formData.append("ENROLLMENT_NUMBER", userData.enrollmentNo || "N/A");
        formData.append(`${formattedDate}`, "PRESENT");
        formData.append("QR_DATA", QRData);
        formData.append("TIME", formattedTime);
        formData.append("CLASS", userData.class || userData.departmentName || "General");
        formData.append("ROLL_NUMBER", userData.rollNo || "");

        await fetch(
          "/macros/macros/s/AKfycbw5rUxDU8RFUTo2tYQLr-l9iyBPTuS9DAoSx7q8SonmMRyb8tGD9TnuUBuErEBRkRoi/exec",
          {
            method: "POST",
            body: formData,
            mode: "no-cors" // safe fallback
          }
        );
      } catch (sheetErr) {
        console.warn("Google Sheets synchronization bypassed/failed:", sheetErr.message);
      }
      
      // 2. Save Attendance Locally in express database
      const extraParams = payload ? {
        key: payload.key,
        expiresAt: payload.expiresAt,
        dateCode: payload.dateCode,
        departmentCode: payload.departmentCode,
        departmentName: payload.departmentName,
        adminName: payload.adminName
      } : {};

      await addAttendanceRecord(
        formattedDate, 
        formattedTime, 
        QRData, 
        "PRESENT", 
        session, 
        orgId, 
        deptId,
        extraParams
      );
      
      // 3. Post Notification to user feed
      await addNotification(
        "Attendance Marked", 
        `Successfully registered attendance for ${formattedDate} at ${formattedTime}.`, 
        "success"
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
      
      toast.success("Your Attendance has been successfully registered!");
      navigate("/");
    } catch (error) {
      console.error("Error registering attendance:", error);
      const errMsg = error.response?.data?.message || "Failed to register attendance. Please try scanning again.";
      toast.error(errMsg);
      setQRData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userData && QRData) {
      ProcessAttendanceMark();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, QRData]);

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="glass-panel border-white/[0.08] p-6 rounded-2xl relative z-10 hover:border-white/[0.12] transition duration-300 shadow-2xl flex flex-col items-center">
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/[0.08] text-[#06b6d4] mb-4">
          Camera Scan
        </span>
        <h2 className="text-xl font-bold font-display text-white text-center mb-1">
          Scan Attendance QR
        </h2>
        {userData ? (
          <p className="text-gray-400 text-xs text-center mb-6">
            Marking attendance for <strong className="text-brand-secondary">{userData.fullname}</strong>
          </p>
        ) : (
          <p className="text-gray-400 text-xs text-center mb-6">Fetching user details...</p>
        )}

        {devices && devices.length > 0 && (
          <div className="w-full mb-4 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Select Camera Device
            </label>
            <select
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              value={selectedDeviceId}
              className="w-full px-3 py-2 text-xs border border-white/[0.08] bg-dark-bg text-gray-200 rounded-xl focus:outline-none focus:border-brand-secondary/50 transition cursor-pointer"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Visor Box */}
        <div className="w-64 h-64 mx-auto relative rounded-2xl overflow-hidden border-2 border-[#06b6d4]/30 shadow-inner bg-black flex items-center justify-center">
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-brand-secondary rounded-tl-sm pointer-events-none z-20" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-brand-secondary rounded-tr-sm pointer-events-none z-20" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-brand-secondary rounded-bl-sm pointer-events-none z-20" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-brand-secondary rounded-br-sm pointer-events-none z-20" />

          {!QRData && <div className="scanner-laser z-20" />}

          <div className="w-full h-full relative z-10">
            <Scanner
              ref={scannerRef}
              onScan={handleScan}
              onError={(err) => console.error(err)}
              constraints={{
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
              }}
            />
          </div>
        </div>

        {QRData && (
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold animate-bounce">
              ✓
            </div>
            <p className="text-center text-sm font-semibold text-emerald-400">
              QR Code Captured!
            </p>
            <p className="text-center text-xs text-gray-400 animate-pulse">
              Syncing attendance logs, please wait...
            </p>
          </div>
        )}

        <div className="mt-8 w-full border-t border-white/[0.06] pt-6 flex justify-center">
          <NavLink to="/" className="w-full">
            <button className="w-full py-2.5 px-4 text-gray-300 hover:text-white font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] active:scale-98 transition transform hover:-translate-y-0.5 text-sm">
              Back to Dashboard
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Qr;
