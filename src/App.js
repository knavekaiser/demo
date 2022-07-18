import { useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { IoLockClosedOutline } from "react-icons/io5";
import { SiteContext } from "./SiteContext";
import Login from "./components/login";
import Dashboard from "./components/dashboard.js";
import "./App.scss";
import { getTenantId } from "./helpers";

Array.prototype.swap = function (oldIndex, newIndex) {
  const a = this[oldIndex],
    b = this[newIndex];
  this[newIndex] = a;
  this[oldIndex] = b;
  return this;
};

Number.prototype.pad = function (l) {
  let zeros = "";
  for (let i = 0; i < l; i++) zeros += "0";
  return zeros.length >= `${this}`.length ? (zeros + this).slice(-l) : this;
};

function App() {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user && location.pathname !== "/login") {
      navigate(`/login${getTenantId() ? `?tenantId=${getTenantId()}` : ""}`, {
        state: { lastLocation: location },
      });
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
