import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../navbar/NavBar';

export default function MainLayout() {
    return (
        <div className="w-screen h-screen flex flex-col overflow-hidden">

            {/* Top Bar */}
            <div className="flex items-center justify-between h-16 bg-white px-4 shadow z-10">
                <div className="flex items-center gap-4">
                    <img src="/images/logo-compony.svg" alt="Company Logo" className="h-8" />
                    <h1 className="text-lg font-semibold">Buddy For Events</h1>
                </div>
                <div className="flex items-center gap-4">
                    <img src="/svg/notification.svg" alt="notification" className="h-5" />
                    <div className="flex items-center gap-2">
                        <span>Welcome User</span>
                        <img src="/svg/profile.svg" alt="profile" className="h-8 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <NavBar />

                {/* Right Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
