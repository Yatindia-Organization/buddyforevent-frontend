import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Log whenever `event` changes
  useEffect(() => {
    console.log("[GlobalContext] event state updated:", event);
  }, [event]);

  const changeLoginFlow = (newState) => {
    localStorage.setItem("isLoggedIn", newState);
    setLoginFlow(newState);
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
    console.group("[GlobalContext] changeEvent called");
  console.trace("payload:", newEvent);
  console.groupEnd();
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
