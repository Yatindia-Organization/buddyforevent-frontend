import React, { createContext, useContext, useEffect, useState } from "react";
import { API_ROUTE } from "../lib/config";

const GlobalContext = createContext({});

export function useGlobalInfo() {
  return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
  const [loginFlow, setLoginFlow] = useState(() =>
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [userType, setUserType] = useState(() =>
    localStorage.getItem("userType") || null
  );

  const [userId, setUserId] = useState(() =>
    localStorage.getItem("userId") || null
  );

  const [event, setEvent] = useState(() =>
    localStorage.getItem("currentEvent") || null
  );

  // New plan and credit states
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [ticketCredits, setTicketCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch user data when logged in
  useEffect(() => {
    if (loginFlow && userId) {
      fetchUserData();
    }
  }, [loginFlow, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.data);
        setUserPlan(data.data.plan);
        setTicketCredits(data.data.remainingTickets || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has enough credits
  const hasEnoughCredits = (requiredCredits = 1) => {
    return ticketCredits >= requiredCredits;
  };

  // Check if user has active plan
  const hasActivePlan = () => {
    return userPlan && userPlan._id;
  };

  // Update credits after plan purchase
  const updateCreditsAfterPlanPurchase = (newCredits) => {
    setTicketCredits(newCredits);
    fetchUserData(); // Refresh full user data
  };

  // Deduct credits when tickets are used
  const deductCredits = (usedCredits) => {
    setTicketCredits(prev => Math.max(0, prev - usedCredits));
  };

  const changeLoginFlow = (newState) => {
    localStorage.setItem("isLoggedIn", newState);
    setLoginFlow(newState);
    if (!newState) {
      // Clear user data on logout
      setCurrentUser(null);
      setUserPlan(null);
      setTicketCredits(0);
    }
  };

  const changeUserType = (newState) => {
    localStorage.setItem("userType", newState);
    setUserType(newState);
  };

  const changeUserId = (newState) => {
    localStorage.setItem("userId", newState);
    setUserId(newState);
  };

  const changeEvent = (newEvent) => {
    localStorage.setItem("currentEvent", newEvent);
    setEvent(newEvent);
  };

  return (
    <GlobalContext.Provider
      value={{
        loginFlow,
        changeLoginFlow,
        userType,
        changeUserType,
        userId,
        changeUserId,
        event,
        changeEvent,
        // New plan-related values
        currentUser,
        userPlan,
        ticketCredits,
        loading,
        hasEnoughCredits,
        hasActivePlan,
        updateCreditsAfterPlanPurchase,
        deductCredits,
        fetchUserData
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}