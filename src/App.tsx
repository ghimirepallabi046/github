
import { useState } from "react";
import Login from "./assets/components/sections/Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
