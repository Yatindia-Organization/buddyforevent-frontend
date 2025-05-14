import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage/LandingPage.jsx";
import Login from "./components/forms/LoginForm.jsx";
import ForgotPassword from "./components/forms/ForgotPassword.jsx";
import OtpVerification from "./components/forms/OtpVerificationForm.jsx";
import ResetPassword from "./components/forms/ResetPasswordForm.jsx";
import CreateAccountForm from "./components/forms/CreateAccountForm.jsx";

// Other pages 

import Main from "./components/main/Main.jsx";
import Dashboard from "./components/Admin/DashboardPage/Dashboard.jsx";
import CreateEvent from "./components/Admin/CreateEvent/CreateEvent.jsx";
import EventDashboard from "./components/Admin/EventDashboard.jsx/EventDashboard.jsx";
import ParticipantRegistration from "./components/Admin/ParticipantRegistration/ParticipantRegistration.jsx";
import { useGlobalInfo } from "./contexts/globalContext.jsx";
import AddParticipants from "./components/Admin/BulkParticipation/AddParticipants.jsx";
import Event from "./components/Admin/EventScreen/Event.jsx";

function App() {
  const context = useGlobalInfo();

  console.log(context, "this is context")

  const isLoggedIn = context.loginFlow;
  console.log(isLoggedIn, "this is LoggedIn")

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          // Protected Routes (after login)
          <Route path="/" element={<Main />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="event-dashboard" replace />} />
              <Route path="event-dashboard" element={<EventDashboard />} />
              <Route path="participant-registration" element={<ParticipantRegistration />} />
              <Route path="bulk-ticket" element={<div>Bulk Ticket Content</div>} />
              <Route path="single-registration" element={<div>Single Registration Content</div>} />
              <Route path="view-participants" element={<div>View Participants Content</div>} />
              <Route path="payment-history" element={<div>Payment History Content</div>} />
              <Route path="email-message" element={<div>Email/Message Content</div>} />
              <Route path="reports" element={<div>Reports Content</div>} />
            </Route>

            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/add-participants" element={<AddParticipants />} />
            <Route path="/event/:id" element={<Event />} />

          </Route>
        ) : (
          // Public Routes (before login)
          <Route path="/" element={<LandingPage />} >
            <Route index element={<Navigate to="login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccountForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Route>

        )}
      </Routes>
    </Router>
  );
}


export default App;
