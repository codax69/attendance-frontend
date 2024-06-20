import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

const Qr = () => {
  const [QRData, setQRData] = useState({});
  const scannerRef = useRef(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(""); // Changed from {} to ''
  const { devices } = useDevices();
  const [SentData, setSentData] = useState({})

  const FetchDataFromDb = async () => {
    try {
      const response = await axios.get("server/api/v1/get-current-user");
      const data = await response.data; 
      setSentData(data);
      console.log(data);
      console.log(SentData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
 
  useEffect(() => {
    if (devices && devices.length > 0) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices]);

  const handleScan = async (result) => {
    if (result) {
      setQRData(result[0]);
      console.log(result[0]);
      stopScanner();
      // sentDataToSheet()
      FetchDataFromDb()
      try {
      const data =  await axios.get("server/api/v1/get-current-user");
      console.log(data)
      setSentData(data)
    } catch (error) {
        console.error("Error fetching current user:", error);
    } 
    } else {
      console.log("No result found");
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      const stream = scannerRef.current.stream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

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
          onError={handleError}
          constraints={{
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
          }}
        />
      </div>
      <div>{QRData ? <h1 className="text-center text-white">{QRData.rawValue}</h1> : null}</div>

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
