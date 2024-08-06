import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";

const Home = () => {
  const [UserData, setUserData] = useState({});

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/api/v1/user/get-current-user");
      setUserData(response.data.data.user);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <div className="h-auto">
        <div className="max-w-7xl mx-auto">
          <div className="w-1/2 p-6 h-72 overflow-hidden mx-auto mt-6 bg-white rounded-xl shadow-sm shadow-black text-center">
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
          <div className="w-1/2 h-80 overflow-hidden mx-auto mt-6 bg-white rounded-xl shadow-sm shadow-black p-4">
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
      </div>
    </>
  );
};

export default Home;
