import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { MdHomeFilled } from "react-icons/md";
import { MdCoPresent } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../index.css";
import axios from "axios";
import { IoInformationCircle } from "react-icons/io5";
import Button from "./Button.jsx";

const Navbar = () => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const Navigate = useNavigate()
  const handleChanges = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const searchStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/api/v1/user/p/${inputValue}`);
       Navigate(`/p/${response.data.data.mobileNo}`)
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
 const handleUserClick = async(e) =>{
  e.preventDefault()
        try {
          const response = await axios.get("/api/api/v1/user/get-current-user")
          Navigate(`/p/${response.data.data.user.mobileNo}`)
        } catch (error) {
          console.log(error)
        }
 }
  return (
    <>
      <nav className="relative max-w-[90rem] lg:mx-auto z-10 px-4">
        <div className="flex text-white justify-between mt-2 items-center">
          <div className="flex items-center">
            <GiHamburgerMenu size={35} onClick={handleClick} className="hover:cursor-pointer" />
            {isMenuVisible && (
              <div className="absolute top-10 bg-orange-400/35 backdrop-blur-xl h-auto w-64 rounded-lg">
                <ul className="flex px-10 flex-col py-10">
                  <li className="flex items-center">
                    <MdHomeFilled />
                    <NavLink
                      className="pl-1 font-semibold hover:cursor-pointer"
                      onClick={handleClick}
                      to="/"
                    >
                      Home
                    </NavLink>
                  </li>
                  <hr />
                  <li className="pt-4 flex items-center hover:cursor-pointer">
                    <IoInformationCircle />
                    <NavLink
                      className="pl-1 font-semibold"
                      onClick={handleClick}
                      to="/"
                    >
                      About
                    </NavLink>
                  </li>
                  <hr />
                  <li className="pt-4 flex items-center hover:cursor-pointer">
                    <MdCoPresent />
                    <NavLink
                      className="pl-1 font-semibold"
                      onClick={handleClick}
                      to="/attendance"
                    >
                      Attendance
                    </NavLink>
                  </li>
                  <hr />
                </ul>
              </div>
            )}
            <NavLink to={"/"}><h1 className="mx-4 lg:mx-4 text-lg lg:text-xl font-bold tracking-tighter lg:tracking-tight text-orange-400 select-none">
              Attendance For ITI-Pardi
            </h1></NavLink>
          </div>
          <div className="flex justify-center w-auto ">
            <div className="items-center bg-white rounded-lg lg:px-2 hidden lg:flex">
              <IoIosSearch size={25} fill="black" />
              <form onSubmit={searchStudent} className="">
                <input
                  className="text-black outline-none px-2 w-auto hidden lg:block "
                  type="text"
                  name="mobileNo"
                  placeholder="Enter your mobile No......"
                  id="search"

                  value={inputValue}
                  onChange={handleChanges}
                />
              </form>
            </div>
            <Button className={"hover:bg-orange-500"} BtnName={"SignIn/LogIn"} url={"/login"} />
            <NavLink to={"/p/:mobileNo"} onClick={handleUserClick}> <FaUserCircle size={35} className="fill-orange-400 hover:fill-orange-500 hover:cursor-pointer" /></NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
