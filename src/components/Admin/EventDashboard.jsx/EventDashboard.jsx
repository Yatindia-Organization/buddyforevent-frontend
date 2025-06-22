import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useGlobalInfo } from '../../../contexts/globalContext';


export default function EventDashboard() {
    const location = useLocation();
    const context = useGlobalInfo();

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
        <div className='p-4'>
            {/* Tabs */}
            <div className='text-[24px] font-semibold'>
                {context?.event?.name}
            </div>

            <div className='flex space-x-4 border-b pb-2 my-4'>
                {dashboardTabs.map((tab) => (
                    <NavLink
                        key={tab.route}
                        to={`/event-dashboard/${tab.route}`}
                        className={({ isActive }) =>
                            isActive || location.pathname === `/event-dashboard` && tab.route === `event/${context.event}`
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