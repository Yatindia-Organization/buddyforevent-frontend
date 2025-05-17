import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const dashboardTabs = [
    { name: "Event Dashboard", route: "event/:id" },
    { name: "Participant Registration", route: "participant-registration" },
    { name: "Bulk Ticket", route: "bulk-ticket" },
    { name: "Single Registration", route: "single-registration" },
    { name: "View Participants", route: "view-participants" },
    { name: "Payment History", route: "payment-history" },
    { name: "Email/Message", route: "email-message" },
    { name: "Reports", route: "reports" },
];

export default function EventDashboard() {
    const location = useLocation();

    return (
        <div className='p-4'>
            {/* Tabs */}
            <div className='text-[24px] font-semibold'>
                Event Name
            </div>
            <div className='flex space-x-4 border-b pb-2 my-4'>
                {dashboardTabs.map((tab) => (
                    <NavLink
                        key={tab.route}
                        to={`/event-dashboard/${tab.route}`}
                        className={({ isActive }) =>
                            isActive || location.pathname === `/event-dashboard` && tab.route === 'event/:id'
                                ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                                : "text-gray-600 hover:text-blue-500"
                        }
                        end
                    >
                        {tab.name}
                    </NavLink>
                ))}
            </div>

            {/* Content */}
            <Outlet />
        </div>
    );
}