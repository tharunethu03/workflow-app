import { createContext, useContext, useState } from "react";

type Role = "admin" | "creator" | "editor" | "reviewer" | "downloader";

type UserContextType = {
  role: Role | null;
  userName: string;
  setRole: (role: Role) => void;
  setUserName: (userName: string) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState("");

  return (
    <UserContext.Provider value={{ role, userName, setRole, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
