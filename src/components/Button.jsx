/* eslint-disable react/prop-types */
import { NavLink } from "react-router-dom";
const Button = ({ BtnName, url, className, type,btnClass }) => {
  return (
    <button className={`mx-4 px-2 py-1 rounded-lg backdrop-blur-lg bg-orange-400 hover:bg-orange-500 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 ${btnClass}`}>
      <NavLink to={url} type={type} className={` ${className} `}>
        {BtnName}
      </NavLink>
    </button>
  );
};

export default Button;
