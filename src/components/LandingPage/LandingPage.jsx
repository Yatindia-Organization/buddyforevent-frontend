import React from 'react';
import { Outlet } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/images/logo-compony.svg" alt="Company Logo" className="h-10" />
          <h1 className="text-2xl font-heading">Buddy For Events</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-card p-8">
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="/images/login-flow.svg"
              alt="Login Flow Illustration"
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
        </div>

        {/* Form Section */}
        <main className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-card">
          <div className="w-full max-w-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}