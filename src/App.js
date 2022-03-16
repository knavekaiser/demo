import { useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { IoLockClosedOutline } from "react-icons/io5";
import { SiteContext } from "./SiteContext";
import Login from "./components/login";
import Dashboard from "./components/dashboard.js";
import "./App.scss";

function App() {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { lastLocation: location } });
    }
  }, []);
  return (
    <div className="App" data-testid="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            user ? (
              <Dashboard />
            ) : (
              <div className="auth-placeholder">
                <IoLockClosedOutline />
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
