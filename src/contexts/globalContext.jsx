import React, { useContext, useState } from "react";

const GlobalContext = React.createContext();

export function useGlobalInfo() {
    return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
    const [loginFlow, setLoginFLow] = useState(true);

    return (<GlobalContext.Provider
        value={{
            loginFlow,
            changeLoginFlow: (new_state) => setLoginFLow(new_state),

        }}

    >
        {children}
    </GlobalContext.Provider>)
}