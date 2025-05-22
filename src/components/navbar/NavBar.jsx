import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import navConfig from '../../lib/config/navItems';
import { useGlobalInfo } from '../../contexts/globalContext';

const NavBar = () => {
    const location = useLocation();
    const context = useGlobalInfo();

    const role = context.userType || "admin";

    return (
        <nav className="h-full w-[18vw] bg-navbar text-[14px] text-[#FFFFFF] font-semibold shadow-md p-4">
            <ul className="space-y-2">
                {navConfig[role]?.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.label}>
                            <Link
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-md transition-colors
                                    ${isActive
                                        ? 'bg-blue-500'
                                        : 'hover:bg-gray-600'}
                                `}
                            >
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    className="w-6 h-6 mr-3"
                                />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default NavBar;
