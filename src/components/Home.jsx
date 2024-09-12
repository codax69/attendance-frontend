import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { useContext } from "react";
import { ContextApi } from "../context/ContextApi.jsx";
import { InfinitySpin } from "react-loader-spinner";
const Home = () => {
  const { loader, setLoader } = useContext(ContextApi);
  const [UserData, setUserData] = useState({});

  const fetchUserData = async () => {
    try {
      setLoader(true);
      const response = await axios.get("/api/api/v1/user/get-current-user");
      setUserData(response.data.data.user);
      setLoader(false);
    } catch (error) {
      console.log(error.message);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <div className="lg:w-1/2 w-4/5 lg:h-80 h-[22rem] overflow-scroll lg:overflow-hidden mx-auto mt-6 bg-white rounded-xl shadow-sm shadow-black p-4">
        <h1 className="text-lg">
          <b>Dear Users,</b>
          <br /> We would like to inform you that we have scheduled a server
          maintenance . During this period, our website and services will be
          temporarily unavailable. <br /> <b>Reason for Maintenance:</b> This maintenance is
          essential to ensure the continued performance, reliability, and
          security of our systems.
        </h1>
      </div>

      {loader? <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"> <InfinitySpin
    visible={true}
    width="400"
    color="#f97316"
    ariaLabel="infinity-spin-loading"
    /></div>:
      <div className="h-auto">
        <div className="lg:max-w-7xl mx-auto mt-16 lg:mt-0">
          <div className="lg:w-1/2 w-4/5 p-6 h-72 overflow-hidden mx-auto mt-6 bg-white rounded-xl shadow-sm shadow-black text-center">
            <h1 className="text-lg font-semibold ">
              Hello,{UserData.fullname || "User"}
            </h1>
            <div className="flex flex-col my-8">
              <NavLink to={"/attendance"}>
                <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5">
                  Attendance
                </button>
              </NavLink>
              <NavLink>
                <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5">
                  Check Daily Attendance
                </button>
              </NavLink>
              <NavLink>
                <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5">
                  Check Monthly Attendance
                </button>
              </NavLink>
            </div>
          </div>
          <div className="lg:w-1/2 w-4/5 lg:h-80 h-[22rem] overflow-scroll lg:overflow-hidden mx-auto mt-6 bg-white rounded-xl shadow-sm shadow-black p-4">
            <h1 className="text-lg">Dear,{UserData.fullname || "User"}</h1>
            <p className="text-lg">Your important Attendance related Info:</p>
            <div className="flex flex-col">
              <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 flex justify-center items-center">
                <IoInformationCircle size={20} className="pt-[2px] mx-3" />
                Lorem ipsum dolor sit amet consectetur.
              </button>
              <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 flex justify-center items-center">
                <IoInformationCircle size={20} className="pt-[2px] mx-3" />
                Lorem ipsum dolor sit amet consectetur.
              </button>
              <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 flex justify-center items-center">
                <IoInformationCircle size={20} className="pt-[2px] mx-3" />
                Lorem ipsum dolor sit amet consectetur.
              </button>
              <button className="px-6 py-2 mt-4 text-white bg-orange-400 rounded-lg hover:bg-orange-500  shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 flex justify-center items-center">
                <IoInformationCircle size={20} className="pt-[2px] mx-3" />
                Lorem ipsum dolor sit amet consectetur.
              </button>
            </div>
          </div>
        </div>
      </div>}
    </>
  );
};

export default Home;
