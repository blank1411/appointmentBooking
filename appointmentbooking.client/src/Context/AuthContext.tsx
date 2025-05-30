import { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  city: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (newToken: string, userData: User) => void;
  logout: () => void;
  setUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : null
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      localStorage.setItem("authToken", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  }, [user, token]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, setUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
