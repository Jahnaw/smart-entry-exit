import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [deviceToken, setDeviceToken] = useState(
    localStorage.getItem("deviceToken")
  );

  const [student, setStudent] = useState(() => {
    const storedStudent =
      localStorage.getItem("student");

    return storedStudent
      ? JSON.parse(storedStudent)
      : null;
  });

  const login = (loginData) => {
    localStorage.setItem(
      "token",
      loginData.token
    );

    localStorage.setItem(
      "student",
      JSON.stringify(loginData.student)
    );

    setToken(loginData.token);
    setStudent(loginData.student);
  };

  const saveDeviceToken = (newDeviceToken) => {
    localStorage.setItem(
      "deviceToken",
      newDeviceToken
    );

    setDeviceToken(newDeviceToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    localStorage.removeItem("deviceToken");

    setToken(null);
    setStudent(null);
    setDeviceToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        student,
        deviceToken,
        login,
        saveDeviceToken,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};