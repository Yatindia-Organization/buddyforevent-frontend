import React from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";

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
import EditEvent from "./components/Admin/EventScreen/EditEvent.jsx";
import Email from "./components/Admin/Email/Email.jsx";
import Profile from "./components/profile/Profile.jsx";
import Report from "./components/Report/Report.jsx";
import PaymentHistory from "./components/paymentHistory/PaymentHistory.jsx";
import SingleParticipation from "./components/Admin/SingleParticipation/SingleParticipation.jsx";
import Participants from "./components/Admin/Participants/Participants.jsx";
import Settings from "./components/Admin/Settings/Settings.jsx";
import CreatePoll from "./components/Admin/Poll/CreatePoll.jsx";
import QRViewer from "./components/QrcodeViewer/qrcodeviewer.jsx";
import EventLiveCount from "./components/Admin/LiveCount/LiveCount.jsx";
import FeedbackAdmin from "./components/Admin/Feedback/AdminFeedbackView.jsx";
import FeedbackForm from "./components/Admin/Feedback/FeedbackForm.jsx";
import CreatePolls from "./components/Admin/Polls/CreatePoll.jsx";
import PollVote from "./components/Admin/Polls/PollVote.jsx";
import ParticipantLookup from "./components/Admin/ParticipantLookup/ParticipantLookup.jsx";


function App() {
  const context = useGlobalInfo();

  const isLoggedIn = context.loginFlow;

  return (
    <Router>
      <Routes>
        <Route path="/participant-lookup/" element={<ParticipantLookup />} />
        <Route
          path="/qr/:submissionId"
          element={<QRViewer />}  
        />
        <Route path="/event/:eventId/polls" element={<PollVote />} />
         <Route path="/live-count/:id" element={<EventLiveCount />} />
         <Route path="/feedback-entry/:eventId" element={<FeedbackForm />} />
         <Route path="/event" element={<FeedbackForm />} />
        {isLoggedIn ? (
          // Protected Routes (after login)
          <Route path="/" element={<Main />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/event-dashboard" element={<EventDashboard />} >
              <Route index element={<Navigate to="event/:id" replace />} />
              <Route path="event/:id" element={<Event />} />
              <Route path="participant-registration" element={<ParticipantRegistration />} />
              <Route path="bulk-ticket" element={<AddParticipants />} />
              <Route path="single-registration" element={<SingleParticipation />} />
              <Route path="view-participants" element={<Participants />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="email-message" element={<Email />} />
              <Route path="reports" element={<Report />} />
              <Route path="eventedit/:event" element={<EditEvent />} />
              <Route path="polls/createPoll" element={<CreatePolls />} />
              <Route path="feedbackView" element={<FeedbackAdmin />} />
             
              <Route path="create-poll" element={<CreatePoll />} />
            </Route>

            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/add-participants" element={<AddParticipants />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/settings" element={<Settings />} />

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
