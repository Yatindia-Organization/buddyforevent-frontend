import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import navConfig from '../../lib/config/navItems';
import { useGlobalInfo } from '../../contexts/globalContext';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useGlobalInfo();

  const role = context.userType || "admin";

  const handleLogout = () => {
    localStorage.clear();
    context.changeLoginFlow(false);
    context.changeUserId(null);
    context.changeUserType(null);
    navigate("/login");
  };

  return (
    <nav className="h-full w-[18vw] bg-navbar text-[14px] text-[#FFFFFF] font-semibold shadow-md p-4 flex flex-col justify-between">
      <ul className="space-y-2">
        {navConfig[role]?.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive ? 'bg-blue-500' : 'hover:bg-gray-600'
                }`}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6 mr-3" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default NavBar;
