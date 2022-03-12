import React, { useState, useContext, useEffect } from "react";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { BiChevronLeft, BiPowerOff } from "react-icons/bi";
import {
  SiteContext,
  IrDashboardContextProvider,
  IrDashboardContext,
} from "../SiteContext";
import { IoKeyOutline } from "react-icons/io5";
import { FaRegBell, FaChevronRight } from "react-icons/fa";
import { Combobox, moment } from "./elements";
import {
  IncidentReportIcon,
  IncidentDashboardIcon,
  CapaIcon,
  ReportsIcon,
  IrConfigIcon,
  MastersIcon,
} from "./svgs";
import IncidentReport from "./incidentReport";
import IrDashboard from "./irDashboard";
import Masters from "./masters/index";
import IrConfig from "./irConfig/index";
import paths from "./path";
import s from "./dashboard.module.scss";

export const Accordion = ({ label, basePath, items, className, startPath }) => {
  const location = useLocation();
  return (
    <li
      className={`${s.accordion} ${
        location.pathname.startsWith(basePath) ? s.open : ""
      } ${className || ""}`}
    >
      <Link
        className={s.accordionLabel}
        to={
          startPath
            ? startPath
            : typeof items[0]?.path === "string"
            ? `${basePath}/${items[0]?.path}`
            : items[0]
        }
      >
        {label} <FaChevronRight className={s.arrow} />
      </Link>
      {location.pathname.startsWith(basePath) && (
        <ul className={s.submenu}>
          {items.map((item, i) => {
            if (item.accordion) {
              return (
                <Accordion
                  key={i}
                  label={item.label}
                  basePath={item.basePath}
                  className={item.className}
                  items={item.items}
                />
              );
            }
            return (
              <li
                key={i}
                className={`${
                  location.pathname.startsWith(basePath + "/" + item.path) ||
                  (item.path?.search &&
                    location.search.startsWith(`?${item.path.search}`))
                    ? s.active
                    : ""
                }`}
              >
                <Link
                  to={
                    typeof item.path === "string"
                      ? `${basePath}/${item.path}`
                      : item.path
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

function Dashboard() {
  const { user, setUser, setRoles, checkPermission, logout } = useContext(
    SiteContext
  );
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
          <span>
            Logged in as:{" "}
            <span style={{ fontWeight: "600", color: "#3450a3" }}>
              {user.name}
            </span>
          </span>
          <div className={s.actions}>
            <button>
              <IoKeyOutline />
            </button>
            <button>
              <FaRegBell />
            </button>
            <button onClick={logout} data-testid="logout">
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
          {checkPermission({
            roleId: ["incidentManager", "irInvestigator", "incidentReporter"],
          }) && (
            <li
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.incidentReport)
                  ? s.active
                  : ""
              }`}
            >
              <Link to={paths.incidentReport}>
                <span className={s.label}>
                  <IncidentReportIcon className={s.icon} />{" "}
                  <span className={s.text}>Incident Reporting</span>
                </span>
              </Link>
            </li>
          )}
          {checkPermission({
            roleId: ["incidentManager", "irInvestigator", "incidentReporter"],
          }) && <SidebarItem_IrDashboard />}
          {checkPermission({
            roleId: ["incidentManager", "irInvestigator", "incidentReporter"],
          }) && (
            <li
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.capaReport) ? s.active : ""
              }`}
            >
              <Link to={paths.capaReport}>
                <span className={s.label}>
                  <CapaIcon className={s.icon} />{" "}
                  <span className={s.text}>CAPA Reporting</span>
                </span>
              </Link>
            </li>
          )}
          {checkPermission({
            roleId: ["incidentManager", "irInvestigator"],
          }) && (
            <li
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.reports) ? s.active : ""
              }`}
            >
              <Link to={paths.reports}>
                <span className={s.label}>
                  <ReportsIcon className={s.icon} />{" "}
                  <span className={s.text}>Reports</span>
                </span>
              </Link>
            </li>
          )}
          {checkPermission({
            roleId: "irAdmin",
            permission: "IR Configuration",
          }) && (
            <Accordion
              label=<span className={s.label}>
                <IrConfigIcon className={s.icon} />{" "}
                <span className={s.text}>IR Configuration</span>
              </span>
              basePath={paths.irConfig.basePath}
              startPath={
                paths.irConfig.basePath +
                paths.irConfig.mainConfig.basePath +
                "/" +
                paths.irConfig.mainConfig.irScreen
              }
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.irConfig.basePath)
                  ? s.active
                  : ""
              }`}
              items={[
                {
                  label: <>Main Configuration</>,
                  path: paths.irConfig.mainConfig,
                },
                {
                  label: <>User Permission</>,
                  path: paths.irConfig.userPermission,
                },
                {
                  label: <>IR Data Analytics</>,
                  path: paths.irConfig.irDataAnalytics,
                },
              ]}
            />
          )}
          {checkPermission({ roleId: "irAdmin", permission: "IR Master" }) && (
            <Accordion
              label=<span className={s.label}>
                <MastersIcon className={s.icon} />{" "}
                <span className={s.text}>Masters</span>
              </span>
              basePath={paths.masters.basePath}
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.masters.basePath)
                  ? s.active
                  : ""
              }`}
              items={[
                { label: <>Location</>, path: paths.masters.location },
                { label: <>Department</>, path: paths.masters.department },
                {
                  label: <>Category & Sub Category</>,
                  path: paths.masters.category,
                },
                { label: <>User Master</>, path: paths.masters.userMaster },
                {
                  label: <>Risk Assessment</>,
                  path: paths.masters.riskAssessment,
                },
                {
                  label: <>Person Affected</>,
                  path: paths.masters.personAffected,
                },
                {
                  label: <>Two Field Master</>,
                  path: paths.masters.twoFieldMaster,
                },
                {
                  label: <>Contributing Factor</>,
                  path: paths.masters.contributingFactor,
                },
                { label: <>RCA Master</>, path: paths.masters.rca },
                {
                  label: <>IR Code Configuration</>,
                  path: paths.masters.irCodeConfig,
                },
              ]}
            />
          )}
        </ul>
      </div>
      <main>
        <Routes>
          <Route path={paths.incidentReport} element={<IncidentReport />} />
          <Route
            path={paths.incidentDashboard.basePath + "/*"}
            element={<IrDashboard />}
          />
          <Route path={paths.irConfig.basePath + "/*"} element={<IrConfig />} />
          <Route
            path={paths.masters.basePath + "/*"}
            index
            element={<Masters />}
          />
          <Route path="/:other" render={({ match }) => <h1>test</h1>} />
          <Route path="/*" element={<IncidentReport />} />
        </Routes>
      </main>
    </div>
  );
}
const SidebarItem_IrDashboard = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { count } = useContext(IrDashboardContext);
  return (
    <Accordion
      label=<span className={s.label}>
        <IncidentDashboardIcon className={s.icon} />{" "}
        <span className={s.text}>Incident Dashboard</span>
      </span>
      basePath={paths.incidentDashboard.basePath}
      className={`${s.sidebarItem} ${
        location.pathname.startsWith(paths.incidentDashboard.basePath)
          ? s.active
          : ""
      }`}
      startPath={
        paths.incidentDashboard.basePath +
        "/" +
        paths.incidentDashboard.myDashboard
      }
      items={[
        {
          accordion: true,
          label: <span className={s.label}>IR Status</span>,
          basePath: paths.incidentDashboard.basePath,
          className: `${s.sidebarItem} ${
            location.pathname.startsWith(paths.irConfig.basePath)
              ? s.active
              : ""
          }`,
          items: [
            {
              label: (
                <>
                  Submitted IRs{" "}
                  {count["2"] ? (
                    <span className={s.count}>{count["2"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=2`,
              },
            },
            {
              label: (
                <>
                  Assigned IRs{" "}
                  {count["3"] ? (
                    <span className={s.count}>{count["3"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=3`,
              },
            },
            {
              label: (
                <>
                  Under Investigation{" "}
                  {count["4"] ? (
                    <span className={s.count}>{count["4"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=4`,
              },
            },
            {
              label: (
                <>
                  CAPA planning{" "}
                  {count["5"] ? (
                    <span className={s.count}>{count["5"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=5`,
              },
            },
            {
              label: (
                <>
                  Closure confirmation{" "}
                  {count["6"] ? (
                    <span className={s.count}>{count["6"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=6`,
              },
            },
            {
              label: (
                <>
                  Closure confirmed{" "}
                  {count["7"] ? (
                    <span className={s.count}>{count["7"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=7`,
              },
            },
            {
              label: (
                <>
                  IR closure{" "}
                  {count["8"] ? (
                    <span className={s.count}>{count["8"]}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `status=8`,
              },
            },
          ],
        },
        {
          accordion: true,
          label: <span className={s.label}>Other Parameters</span>,
          basePath: paths.incidentDashboard.basePath,
          className: `${s.sidebarItem} ${
            location.pathname.startsWith(paths.irConfig.basePath)
              ? s.active
              : ""
          }`,
          items: [
            {
              label: (
                <>
                  Current Months IRs{" "}
                  {count.currentMonth ? (
                    <span className={s.count}>{count.currentMonth}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `fromIncidentDateTime=${moment({
                  time: new Date().setDate(1),
                  format: "YYYY-MM-DD",
                })}&toIncidentDateTime=${moment({
                  time: new Date(),
                  format: "YYYY-MM-DD",
                })}`,
              },
            },
            {
              label: (
                <>
                  Open sentinel events{" "}
                  {count.sentinel ? (
                    <span className={s.count}>{count.sentinel}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `typeofInci=8`,
              },
            },
            {
              label: <>Open Reportable event</>,
              path: {
                pathname: location.pathname,
                search: `reportable=yes`,
              },
            },
            {
              label: <>Active CAPA Closure</>,
              path: {
                pathname: location.pathname,
                search: `capaClosure=active`,
              },
            },
            {
              label: (
                <>
                  Open Patient complaints{" "}
                  {count.patientComplaint ? (
                    <span className={s.count}>{count.patientComplaint}</span>
                  ) : null}
                </>
              ),
              path: {
                pathname: location.pathname,
                search: `patientYesOrNo=true`,
              },
            },
            {
              label: <>Open IR beyond Acceptable TAT</>,
              path: {
                pathname: location.pathname,
                search: `tat=beyond`,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default Dashboard;
