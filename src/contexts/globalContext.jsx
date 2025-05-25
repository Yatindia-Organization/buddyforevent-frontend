import React, { useContext, useState } from "react";

const GlobalContext = React.createContext();

export function useGlobalInfo() {
    return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
    const [loginFlow, setLoginFLow] = useState(true);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [event, setEvent] = useState([]);

    return (<GlobalContext.Provider
        value={{
            loginFlow,
            changeLoginFlow: (new_state) => setLoginFLow(new_state),
            userType,
            changeUserType: (new_state) => setUserType(new_state),
            userId,
            changeUserId: (new_state) => setUserId(new_state),
            event,
            changeEvent: (new_state) => setEvent(new_state)
        }}

    >
        {children}
    </GlobalContext.Provider>)
}