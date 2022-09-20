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
import IrPreview from "./irPreview";
import IrDashboard from "./irDashboard";
import CapaDashboard from "./capaDashboard";
import Masters from "./masters/index";
import IrConfig from "./irConfig/index";
import IrQueryDashboard from "./irQueryDashboard";
import { paths } from "../config";
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
            : items[0] || "/"
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
  if (!user) {
    return <p>Please log in</p>;
  }
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
              {user?.name}
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
          {checkPermission({ roleId: [7, 4, 2] }) && (
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
          <li
            className={`${s.sidebarItem} ${
              location.pathname.startsWith(paths.irPreview) ? s.active : ""
            }`}
          >
            <Link to={paths.irPreview}>
              <span className={s.label}>
                <IncidentReportIcon className={s.icon} />{" "}
                <span className={s.text}>IR Inputs/Queries</span>
              </span>
            </Link>
          </li>
          {checkPermission({ roleId: [7, 4, 2] }) && (
            <SidebarItem_IrDashboard />
          )}
          {
            //   checkPermission({ roleId: [7, 4] }) && (
            <li
              className={`${s.sidebarItem} ${
                location.pathname.startsWith(paths.irQueryDashboard)
                  ? s.active
                  : ""
              }`}
            >
              <Link to={paths.irQueryDashboard}>
                <span className={s.label}>
                  <IncidentReportIcon className={s.icon} />{" "}
                  <span className={s.text}>IR Query Dashboard</span>
                </span>
              </Link>
            </li>
            // )
          }
          {checkPermission({ roleId: [7, 4, 2] }) && (
            <SidebarItem_CapaDashboard />
            // <li
            //   className={`${s.sidebarItem} ${
            //     location.pathname.startsWith(paths.capaReport) ? s.active : ""
            //   }`}
            // >
            //   <Link to={paths.capaReport}>
            //     <span className={s.label}>
            //       <CapaIcon className={s.icon} />{" "}
            //       <span className={s.text}>CAPA Reporting</span>
            //     </span>
            //   </Link>
            // </li>
          )}
          {checkPermission({ roleId: [7, 4] }) && (
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
          {checkPermission({ roleId: 1, permission: 46 }) && (
            <Accordion
              label=<span className={s.label}>
                <IrConfigIcon className={s.icon} />{" "}
                <span className={s.text}>IR Configuration</span>
              </span>
              basePath={paths.irConfig.basePath}
              startPath={
                paths.irConfig.basePath + "/" + paths.irConfig.mainConfig
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
          {checkPermission({ roleId: 1, permission: 33 }) && (
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
          <Route path={paths.irPreview + "/*"} element={<IrPreview />} />
          <Route path={paths.irQueryDashboard} element={<IrQueryDashboard />} />
          <Route
            path={paths.incidentDashboard.basePath + "/*"}
            element={<IrDashboard />}
          />
          <Route
            path={paths.capaDashboard.basePath + "/*"}
            element={<CapaDashboard />}
          />
          <Route path={paths.irConfig.basePath + "/*"} element={<IrConfig />} />
          <Route
            path={paths.masters.basePath + "/*"}
            index
            element={<Masters />}
          />
          <Route path="/*" element={<IncidentReport />} />
        </Routes>
      </main>
    </div>
  );
}
const SidebarItem_IrDashboard = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { irDashboardDataElements, count, checkDataElements } = useContext(
    IrDashboardContext
  );
  const [listItems, setListItems] = useState({});
  useEffect(() => {
    const pathname = location.pathname.startsWith(
      paths.incidentDashboard.basePath
    )
      ? location.pathname
      : paths.incidentDashboard.basePath +
        "/" +
        paths.incidentDashboard.myDashboard;
    setListItems({
      "Submitted IRs": {
        label: (
          <>
            Submitted IRs{" "}
            {count["2"] ? <span className={s.count}>{count["2"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=2`,
        },
      },
      "Approved IRs": {
        label: (
          <>
            Approved IRs{" "}
            {
              // count["2"] ? <span className={s.count}>{count["2"]}</span> : null
            }
          </>
        ),
        path: {
          pathname,
          // search: `status=2`,
        },
      },
      "Rejected IRs": {
        label: (
          <>
            Rejected IRs{" "}
            {
              // count["2"] ? <span className={s.count}>{count["2"]}</span> : null
            }
          </>
        ),
        path: {
          pathname,
          // search: `status=2`,
        },
      },
      "Re-approval request": {
        label: (
          <>
            Re-approval request{" "}
            {
              // count["2"] ? <span className={s.count}>{count["2"]}</span> : null
            }
          </>
        ),
        path: {
          pathname,
          // search: `status=2`,
        },
      },
      "Assigned IRs": {
        label: (
          <>
            Assigned IRs{" "}
            {count["3"] ? <span className={s.count}>{count["3"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=3`,
        },
      },
      "Under Investigation": {
        label: (
          <>
            Under Investigation{" "}
            {count["4"] ? <span className={s.count}>{count["4"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=4`,
        },
      },
      "CAPA Planning": {
        label: (
          <>
            CAPA planning{" "}
            {count["5"] ? <span className={s.count}>{count["5"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=5`,
        },
      },
      "Closure confirmation": {
        label: (
          <>
            Closure confirmation{" "}
            {count["6"] ? <span className={s.count}>{count["6"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=6`,
        },
      },
      "Closure confirmed": {
        label: (
          <>
            Closure confirmed{" "}
            {count["7"] ? <span className={s.count}>{count["7"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=7`,
        },
      },
      "IR closure": {
        label: (
          <>
            IR closure{" "}
            {count["8"] ? <span className={s.count}>{count["8"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=8`,
        },
      },
      "CAPA Closed": {
        label: (
          <>
            CAPA Closed{" "}
            {
              // count["8"] ? <span className={s.count}>{count["8"]}</span> : null
            }
          </>
        ),
        path: {
          pathname,
          // search: `status=8`,
        },
      },
      "Current Months IRs": {
        label: (
          <>
            Current Months IRs{" "}
            {count.currentMonth ? (
              <span className={s.count}>{count.currentMonth}</span>
            ) : null}
          </>
        ),
        path: {
          pathname,
          search: `fromIncidentDateTime=${moment({
            time: new Date().setDate(1),
            format: "YYYY-MM-DD",
          })}&toIncidentDateTime=${moment({
            time: new Date(),
            format: "YYYY-MM-DD",
          })}`,
        },
      },
      "Open sentinel event": {
        label: (
          <>
            Open sentinel events{" "}
            {count.sentinel ? (
              <span className={s.count}>{count.sentinel}</span>
            ) : null}
          </>
        ),
        path: {
          pathname,
          search: `typeofInci=8`,
        },
      },
      "Open Reportable event": {
        label: <>Open Reportable event</>,
        path: {
          pathname,
          search: `reportable=yes`,
        },
      },
      "Open Patient complaints": {
        label: (
          <>
            Open Patient complaints{" "}
            {count.patientComplaint ? (
              <span className={s.count}>{count.patientComplaint}</span>
            ) : null}
          </>
        ),
        path: {
          pathname,
          search: `patientYesOrNo=true`,
        },
      },
      "IR beyond acceptable TAT": {
        label: (
          <>
            Open IR beyond Acceptable TAT{" "}
            {count.irBeyondTat ? (
              <span className={s.count}>{count.irBeyondTat}</span>
            ) : null}
          </>
        ),
        path: {
          pathname,
          search: `tat=beyond`,
        },
      },
      "CAPA closure enabled": {
        label: <>CAPA closure enabled</>,
        path: {
          pathname,
          // search: `tat=beyond`,
        },
      },
    });
  }, [count]);
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
          items: irDashboardDataElements
            .filter(
              (dataEl) =>
                dataEl.type === 1 && checkDataElements(dataEl.statusOption)
            )
            .map((dataEl) => listItems[dataEl.statusOption])
            .filter((item) => item),
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
          items: irDashboardDataElements
            .filter(
              (dataEl) =>
                dataEl.type === 2 && checkDataElements(dataEl.statusOption)
            )
            .map((dataEl) => listItems[dataEl.statusOption])
            .filter((item) => item),
          // {
          //   label: <>Active CAPA Closure</>,
          //   path: {
          //     pathname: location.pathname,
          //     search: `capaClosure=active`,
          //   },
          // },
        },
      ]}
    />
  );
};
const SidebarItem_CapaDashboard = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { capaDashboardDataElements, count, checkDataElements } = useContext(
    IrDashboardContext
  );
  const [listItems, setListItems] = useState({});
  useEffect(() => {
    const pathname = location.pathname.startsWith(paths.capaDashboard.basePath)
      ? location.pathname
      : paths.capaDashboard.basePath;
    // +
    //   "/" +
    //   paths.capaDashboard.myDashboard;
    setListItems({
      "CAPA Action": {
        label: (
          <>
            CAPA Action{" "}
            {count["2"] ? <span className={s.count}>{count["2"]}</span> : null}
          </>
        ),
        path: {
          pathname,
          search: `status=2`,
        },
      },
      "CAPA Monitoring": {
        label: (
          <>
            CAPA Monitoring{" "}
            {
              // count["2"] ? <span className={s.count}>{count["2"]}</span> : null
            }
          </>
        ),
        path: {
          pathname,
          // search: `status=2`,
        },
      },
    });
  }, [count]);
  return (
    <Accordion
      label=<span className={s.label}>
        <CapaIcon className={s.icon} />{" "}
        <span className={s.text}>CAPA Dashboard</span>
      </span>
      basePath={paths.capaDashboard.basePath}
      className={`${s.sidebarItem} ${
        location.pathname.startsWith(paths.capaDashboard.basePath)
          ? s.active
          : ""
      }`}
      startPath={
        paths.capaDashboard.basePath
        // "/" +
        // paths.capaDashboard.myDashboard
      }
      items={[
        {
          accordion: true,
          label: <span className={s.label}>Deadline Crossed</span>,
          basePath: paths.capaDashboard.basePath,
          className: `${s.sidebarItem} ${
            location.pathname.startsWith(paths.irConfig.basePath)
              ? s.active
              : ""
          }`,
          items: capaDashboardDataElements
            // .filter((dataEl) =>
            // dataEl.type === 1 &&
            // checkDataElements(dataEl.statusOption)
            // )
            .map((dataEl) => listItems[dataEl.statusOption])
            .filter((item) => item),
        },
      ]}
    />
  );
};

export default Dashboard;
