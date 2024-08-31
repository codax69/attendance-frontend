import { createContext, useState,} from "react";
const ContextApi = createContext();

// eslint-disable-next-line react/prop-types
function ContextProvider({ children }) {
 const [loader, setLoader] = useState(false)

  return (
    <ContextApi.Provider value={{ loader,setLoader }}>
      {children}
    </ContextApi.Provider>
  );
}

export { ContextApi, ContextProvider };