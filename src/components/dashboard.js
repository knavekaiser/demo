import React, { useState, useContext } from "react";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { BiChevronLeft, BiPowerOff } from "react-icons/bi";
import { SiteContext } from "../SiteContext";
import { BsChevronRight, BsHexagonHalf } from "react-icons/bs";
import { IoKeyOutline } from "react-icons/io5";
import { FaRegBell } from "react-icons/fa";
import { Combobox } from "./elements";
import IncidentReport from "./incidentReport";
import IncidentReportingDashboard from "./incidentReportingDashboard";
import OtherPages from "./otherPages";
import Masters from "./masters/index";
import IrConfig from "./irConfig/index";
import s from "./dashboard.module.scss";

export const Accordion = ({ label, basePath, items, className }) => {
  const location = useLocation();
  return (
    <li
      className={`${s.accordion} ${
        location.pathname.startsWith(basePath) ? s.open : ""
      } ${className || ""}`}
    >
      <Link className={s.accordionLabel} to={`${basePath}/${items[0]?.path}`}>
        {label} <BsChevronRight className={s.arrow} />
      </Link>
      {location.pathname.startsWith(basePath) && (
        <ul className={s.submenu}>
          {items.map((item) => (
            <li
              key={item.path}
              className={`${
                location.pathname.startsWith(basePath + "/" + item.path)
                  ? s.active
                  : ""
              }`}
            >
              <Link to={`${basePath}/${item.path}`}>{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

function Dashboard() {
  const { setUser } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [collaped, setCollapsed] = useState(false);
  return (
    <div className={s.container} data-testid="dashboard">
      <div className={s.navbar}>
        <Link className={s.logo} to="/">
          <img src="/asset/logo.jpg" />
        </Link>
        <div className={s.content}>
          <Combobox
            label="Service location"
            className={s.locationSelector}
            options={[
              { value: 1, label: "Front Desk" },
              { value: 1, label: "Front Desk 2" },
              { value: 1, label: "Front Desk 3" },
            ]}
          />
          <div className={s.actions}>
            <button>
              <IoKeyOutline />
            </button>
            <button>
              <FaRegBell />
            </button>
            <button
              onClick={() => {
                setUser(null);
                navigate("/login");
              }}
            >
              <BiPowerOff />
            </button>
          </div>
        </div>
      </div>
      <div className={`${s.sidebar} ${collaped ? s.collaped : ""}`}>
        <button
          className={`clear ${s.collapseBtn}`}
          onClick={() => setCollapsed(!collaped)}
        >
          <BiChevronLeft />
        </button>
        <ul className={s.links}>
          <li
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/incident-report") ? s.active : ""
            }`}
          >
            <Link to="/incident-report">
              <span className={s.label}>
                <BsHexagonHalf className={s.icon} />{" "}
                <span className={s.text}>Incident Reporting</span>
              </span>
            </Link>
          </li>
          <li
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/incident-dashboard")
                ? s.active
                : ""
            }`}
          >
            <Link to="/incident-dashboard/my-dashboard">
              <span className={s.label}>
                <BsHexagonHalf className={s.icon} />{" "}
                <span className={s.text}>Incident Dashboard</span>
              </span>
            </Link>
          </li>
          <li
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/capa-dashboard") ? s.active : ""
            }`}
          >
            <Link to="/capa-dashboard">
              <span className={s.label}>
                <BsHexagonHalf className={s.icon} />{" "}
                <span className={s.text}>CAPA Reporting</span>
              </span>
            </Link>
          </li>
          <li
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/reports") ? s.active : ""
            }`}
          >
            <Link to="/reports">
              <span className={s.label}>
                <BsHexagonHalf className={s.icon} />{" "}
                <span className={s.text}>Reports</span>
              </span>
            </Link>
          </li>
          <Accordion
            label=<span className={s.label}>
              <BsHexagonHalf className={s.icon} />{" "}
              <span className={s.text}>IR Configuration</span>
            </span>
            basePath="/irConfiguration"
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/irConfiguration") ? s.active : ""
            }`}
            items={[
              { label: <>Main Configuration</>, path: "mainConfig" },
              { label: <>User Permission</>, path: "userPermission" },
              { label: <>IR Data Analytics</>, path: "irDataAnalytics" },
            ]}
          />
          <Accordion
            label=<span className={s.label}>
              <BsHexagonHalf className={s.icon} />{" "}
              <span className={s.text}>Masters</span>
            </span>
            basePath="/masters"
            className={`${s.sidebarItem} ${
              location.pathname.startsWith("/masters") ? s.active : ""
            }`}
            items={[
              { label: <>Location</>, path: "location" },
              { label: <>Department</>, path: "department" },
              {
                label: <>Category & Sub Category</>,
                path: "categoryAndSubCategory",
              },
              { label: <>User Master</>, path: "userMaster" },
              { label: <>Risk Assessment</>, path: "riskAssessment" },
              { label: <>Person Affected</>, path: "personAffected" },
              { label: <>Two Field Master</>, path: "twoFieldMaster" },
              { label: <>Contributing Factor</>, path: "contributingFactor" },
              { label: <>RCA Master</>, path: "rca" },
            ]}
          />
        </ul>
      </div>
      <main>
        <Routes>
          <Route path="/incident-report" element={<IncidentReport />} />
          <Route
            path="/incident-dashboard/*"
            element={<IncidentReportingDashboard />}
          />
          <Route path="/irConfiguration/*" element={<IrConfig />} />
          <Route path="/masters/*" index element={<Masters />} />
          <Route path="/:other" element={<OtherPages />} />
          <Route path="/*" element={<IncidentReport />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;
