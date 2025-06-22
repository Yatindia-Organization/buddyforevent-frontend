// src/components/Admin/EventDashboard/EventDashboard.jsx
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { useTheme } from '../../../contexts/ThemeContext';

export default function EventDashboard() {
  const location = useLocation();
  const context = useGlobalInfo();
  const { theme, setTheme } = useTheme();

  const dashboardTabs = [
    { name: "Event Dashboard", route: `event/${context.event}` },
    { name: "Participant Registration", route: "participant-registration" },
    { name: "Bulk Ticket", route: "bulk-ticket" },
    { name: "Single Registration", route: "single-registration" },
    { name: "View Participants", route: "view-participants" },
    { name: "Payment History", route: "payment-history" },
    { name: "Email/Message", route: "email-message" },
    { name: "Reports", route: "reports" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text font-sans p-4">
      {/* Header with optional theme toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-heading">{context.event.name}</h2>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-3 py-1 border rounded hover:bg-card"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-text-secondary pb-2 mb-4 overflow-x-auto">
        {dashboardTabs.map((tab) => {
          const to = `/event-dashboard/${tab.route}`;
          const isActive =
            location.pathname === to ||
            (location.pathname === '/event-dashboard' && tab.route === `event/${context.event}`);

          return (
            <NavLink
              key={tab.route}
              to={to}
              className={`pb-1 ${
                isActive
                  ? 'text-primary border-b-2 border-primary font-semibold'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              {tab.name}
            </NavLink>
          );
        })}
      </div>

      {/* Nested content */}
      <Outlet />
    </div>
  );
}
