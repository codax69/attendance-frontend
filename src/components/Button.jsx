/* eslint-disable react/prop-types */
import { NavLink } from "react-router-dom";

const Button = ({ BtnName, url, className = "", type = "button", btnClass = "" }) => {
  if (url && typeof url === 'string') {
    return (
      <NavLink
        to={url}
        className={`mx-3 px-4 py-1.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center ${btnClass} ${className}`}
      >
        {BtnName}
      </NavLink>
    );
  }

  return (
    <button
      type={type}
      className={`mx-3 px-4 py-1.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-brand-orange to-brand-rose hover:from-[#516c35] hover:to-[#7ba156] shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98 transition transform hover:-translate-y-0.5 flex items-center justify-center ${btnClass} ${className}`}
    >
      {BtnName}
    </button>
  );
};

export default Button;
