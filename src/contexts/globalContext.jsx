import React, { useContext, useState } from "react";

const GlobalContext = React.createContext();

export function useGlobalInfo() {
    return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
    const [loginFlow, setLoginFLow] = useState(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });

    const [userType, setUserType] = useState(() => {
        return localStorage.getItem("userType") || null;
    });

    const [userId, setUserId] = useState(() => {
        return localStorage.getItem("userId") || null;
    });

    const [event, setEvent] = useState([]);

    const changeLoginFlow = (new_state) => {
        localStorage.setItem("isLoggedIn", new_state);
        setLoginFLow(new_state);
    };

    const changeUserType = (new_state) => {
        localStorage.setItem("userType", new_state);
        setUserType(new_state);
    };

    const changeUserId = (new_state) => {
        localStorage.setItem("userId", new_state);
        setUserId(new_state);
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
                changeEvent: setEvent
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

