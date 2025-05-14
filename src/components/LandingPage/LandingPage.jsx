import React from 'react';
import { Outlet } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="w-[100dvw] h-[100dvh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex gap-[1vw] p-4 items-center">
                <img src="/images/logo-compony.svg" alt="Company Logo" className="h-10" />
                <h1 className="text-xl font-semibold">Buddy For Events</h1>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 justify-center items-center px-4">
                {/* Left Side Image (hide on small screens) */}
                <div className="hidden md:flex justify-center items-center mr-[12vw]">
                    <img src="/images/login-flow.svg" alt="Login Flow Pic" className="max-h-[70vh]" />
                </div>

                {/* Right Side Content */}
                <div className="w-full max-w-md h-auto rounded-md bg-login">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
