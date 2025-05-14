import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import navConfig from '../../lib/config/navItems';

const NavBar = ({ role = 'admin' }) => {
    const location = useLocation();

    return (
        <nav className="h-full w-60 bg-gray-100 shadow-md p-4">
            <ul className="space-y-2">
                {navConfig[role]?.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.label}>
                            <Link
                                to={item.path}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors
                                    ${isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-700 hover:bg-gray-200'}
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
