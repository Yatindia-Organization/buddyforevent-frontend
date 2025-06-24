import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import NavBar from '../navbar/NavBar';
import { useTheme } from '../../contexts/ThemeContext';

export default function MainLayout() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleProfileIconClick = () => {
    navigate('/profile');
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-bg text-text font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-16 bg-card px-4 shadow z-10">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo-compony.svg"
            alt="Company Logo"
            className="h-12"
          />
          <h1 className="text-2xl font-heading">Buddy For Events</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={() =>
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }
            className="px-3 py-1 border rounded hover:bg-card"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <img
            src="/svg/notification.svg"
            alt="Notifications"
            className="h-6"
          />

          <div className="flex items-center gap-3">
            <span>Welcome User</span>
            <img
              src="/svg/profile.svg"
              alt="Profile"
              className="h-10 rounded-full cursor-pointer"
              onClick={handleProfileIconClick}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <NavBar />

        <main className="flex-1 overflow-y-auto bg-bg p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
