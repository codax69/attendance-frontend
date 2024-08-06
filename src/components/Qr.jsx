import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { format } from "date-fns";

const Qr = () => {
  const [QRData, setQRData] = useState(null);
  const scannerRef = useRef(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const { devices } = useDevices();
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [SentLocation, setSentLocation] = useState("");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.log(err.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };
  
  const findLocation = async (lat, long) => {
    try {
      const response = await axios.get(
        `/geo/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=0f492d8e7f8e31edf74af91dd4faac3c`
      );
      const resLocation = await response.data[0].name;
      setSentLocation(resLocation);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (location) {
      findLocation(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    if (devices && devices.length > 0) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices]);

  const FetchDataFromDb = async () => {
    try {
      const response = await axios.get("/api/api/v1/user/get-current-user");
      const data = response.data.data.user;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      setQRData(result[0].rawValue);
      await FetchDataFromDb();
      stopScanner();
    } else {
      console.log("No result found");
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

  const FetchDataFormSheet = async () => {
    try {
      const formData = new FormData();
      formData.append("FULL_NAME", userData.fullname);
      formData.append("ENROLLMENT_NUMBER", userData.enrollmentNo);
      formData.append(`${formattedDate}`, "PRESENT");
      formData.append("LOCATION", SentLocation);
      formData.append("QR_DATA", QRData);
      formData.append("TIME", formattedTime);
  
      const response = await fetch(
        "/macros/macros/s/AKfycbw5rUxDU8RFUTo2tYQLr-l9iyBPTuS9DAoSx7q8SonmMRyb8tGD9TnuUBuErEBRkRoi/exec",
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseBody = await response.json();
      console.log("Response from Google Sheets:", responseBody)
    } catch (error) {
      console.error("Error sending data to Google Sheets:", error);
    }
  };
  
  useEffect(() => {
    if (userData && QRData) {
      getLocation();
    }
  }, [userData, QRData]);

  useEffect(() => {
    if (SentLocation) {
      FetchDataFormSheet();
    }
  }, [SentLocation]);

  return (
    <>
      <div className="w-80 h-80 mx-auto my-10">
        {devices && (
          <select
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            value={selectedDeviceId}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        )}
        <Scanner
          ref={scannerRef}
          onScan={handleScan}
          onError={console.error}
          constraints={{
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
          }}
        />
      </div>
      <div>
        {QRData ? <h1 className="text-center text-white">{QRData}</h1> : null}
      </div>
      <div className="flex items-center justify-center mt-10">
        <NavLink to="/daily-attendance">
          <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5">
            Check Daily Attendance
          </button>
        </NavLink>
      </div>
    </>
  );
};

export default Qr;
