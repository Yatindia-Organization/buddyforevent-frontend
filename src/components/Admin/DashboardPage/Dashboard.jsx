import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const dashboardTabs = [
    { name: "Event Dashboard", route: "event-dashboard" },
    { name: "Participant Registration", route: "participant-registration" },
    { name: "Bulk Ticket", route: "bulk-ticket" },
    { name: "Single Registration", route: "single-registration" },
    { name: "View Participants", route: "view-participants" },
    { name: "Payment History", route: "payment-history" },
    { name: "Email/Message", route: "email-message" },
    { name: "Reports", route: "reports" },
];

export default function Dashboard() {
    const location = useLocation();

    return (
        <div className='p-4'>
            {/* Tabs */}
            <div className='flex space-x-4 border-b pb-2 mb-4'>
                {dashboardTabs.map((tab) => (
                    <NavLink
                        key={tab.route}
                        to={`/dashboard/${tab.route}`}
                        className={({ isActive }) =>
                            isActive || location.pathname === `/dashboard` && tab.route === 'event-dashboard'
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



{/* <a href="/create-event" className='text-blue hover:bg-red-50'>+ create event</a> */ }