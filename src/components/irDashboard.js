import React, {
  useState,
  useEffect,
  useContext,
  Component,
  useRef,
  Fragment,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  SiteContext,
  IrDashboardContext,
  IrDashboardContextProvider,
} from "../SiteContext";
import {
  FaInfoCircle,
  FaRegTrashAlt,
  FaPlus,
  FaEye,
  FaExternalLinkAlt,
  FaRegStickyNote,
  FaRegCheckSquare,
  FaAdjust,
  FaCrosshairs,
  FaRegUser,
  FaUser,
  FaRegStar,
  FaRegTimesCircle,
  FaRegFileAlt,
  FaFlag,
  FaUpload,
  FaPrint,
  FaRegCheckCircle,
  FaCircle,
} from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { WiTime9 } from "react-icons/wi";
import { BsPencilFill, BsFillExclamationTriangleFill } from "react-icons/bs";
import { FiCheckSquare } from "react-icons/fi";
import {
  Radio,
  Select,
  Tabs,
  Input,
  Combobox,
  Table,
  VirtualTable,
  TableActions,
  Moment,
  moment,
} from "./elements";
import {
  useNavigate,
  useLocation,
  createSearchParams,
  Routes,
  Route,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
import { irStatus, endpoints as defaultEndpoints, paths } from "../config";
import { CSVLink } from "react-csv";
import s from "./irDashboard.module.scss";
import { useFetch } from "../hooks";
import { useReactToPrint } from "react-to-print";
import { countDays } from "../helpers";

import IrInvestigation from "./irInvestigation";

const calculateDays = (ir, exclude = []) => {
  let status = {};
  ir.irStatusDetails.forEach((detail) => {
    if (detail.status === 10) {
      return;
    }
    if (Array.isArray(status[detail.status])) {
      status[detail.status].push(detail);
    } else {
      status[detail.status] = [detail];
    }
  });
  if (ir.irStatusDetails.length === 0) {
    return 0;
  }
  Object.entries(status).forEach(([sts, detail]) => {
    status[sts] = detail.sort((a, b) =>
      new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1
    );
  });

  const startDate = new Date(Object.values(status)[0][0].dateTime);
  const endDate = new Date(
    Object.values(status)[Object.values(status).length - 1][
      Object.values(status)[Object.values(status).length - 1].length - 1
    ].dateTime
  );

  return countDays(startDate, endDate, exclude);
};

function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

class Print extends Component {
  render() {
    const incidents = this.props.incidents;
    const parameters = this.props.parameters;
    const irTypes = this.props.irTypes;
    const tatConfig = this.props.tatConfig;
    return (
      <div className={s.paper}>
        <table cellPadding={0} cellSpacing={0}>
          <thead>
            <tr>
              {[
                { label: "IR Code" },
                { label: "Reporting Date & Time" },
                { label: "Incident Date & Time" },
                { label: "Incident Location" },
                { label: "Category" },
                { label: "Subcategory" },
                { label: "Incident Type" },
                { label: "Reported / Captured by" },
                { label: "IR Investigator" },
                { label: "Status" },
                { label: "TAT" },
              ].map((col) => (
                <th key={col.label}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents
              .sort((a, b) =>
                new Date(a.reportingDate) > new Date(b.reportingDate) ? -1 : 1
              )
              .map((ir, i) => {
                // return <SingleIr key={ir.id} ir={ir} parameters={parameters} />;

                const tat = calculateDays(ir, tatConfig.excludeWeek);

                return (
                  <tr key={i}>
                    <td>{ir.sequence}</td>
                    <td>
                      <Moment format="DD/MM/YYYY hh:mm">
                        {ir.reportingDate}
                      </Moment>
                    </td>
                    <td>
                      <Moment format="DD/MM/YYYY hh:mm">
                        {ir.incident_Date_Time}
                      </Moment>
                    </td>
                    <td>
                      {parameters?.locations?.find(
                        (item) => item.id === ir.location
                      )?.name || ir.location}
                    </td>
                    <td>
                      {parameters?.categories?.find(
                        (item) => item.id === ir.inciCateg
                      )?.name || ir.inciCateg}
                    </td>
                    <td>
                      {parameters?.categories
                        ?.find((item) => item.id === ir.inciCateg)
                        ?.subCategorys?.find(
                          (item) => item.id === ir.inciSubCat
                        )?.name || ir.inciSubCat}
                    </td>
                    <td>
                      {irTypes.find(({ value }) => value === ir.typeofInci)
                        ?.label || [ir.typeofInci]}
                    </td>
                    <td>
                      {parameters?.users?.find(
                        ({ value }) => value === ir.userId
                      )?.label || "Anonymous"}
                    </td>
                    <td>
                      {parameters?.investigators?.find(
                        ({ value }) => value === ir.irInvestigator
                      )?.label || ir.irInvestigator}
                    </td>
                    <td>
                      {irStatus.find((item) => item.id === +ir.status)?.name ||
                        ir.status}
                    </td>
                    <td className={s.tat}>{tat}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

const PrintMemo = memo(Print);

function IrDashboard() {
  const { user, checkPermission } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      new RegExp(`${paths.incidentDashboard.basePath}/?$`).test(
        location.pathname
      )
    ) {
      navigate(paths.incidentDashboard.myDashboard);
    }
  }, []);
  return (
    <div className={s.container}>
      <Routes>
        {[
          paths.incidentDashboard.myDashboard + "/*",
          paths.incidentDashboard.qualityDashboard + "/*",
        ].map((path, i) => (
          <Route
            key={i}
            path={path}
            element={
              <>
                <header>
                  <h3>INCIDENT REPORTING DASHBOARD</h3>
                </header>
                <Tabs
                  tabs={[
                    {
                      label: "My Dashboard",
                      path:
                        paths.incidentDashboard.basePath +
                        "/" +
                        paths.incidentDashboard.myDashboard,
                      search: { userId: user.id },
                    },
                    ...(checkPermission({
                      roleId: ["irInvestigator", "incidentManager"],
                    })
                      ? [
                          {
                            label: "Quality Dashboard",
                            path:
                              paths.incidentDashboard.basePath +
                              "/" +
                              paths.incidentDashboard.qualityDashboard,
                            search: {
                              view: user.role.includes("incidentManager")
                                ? "all"
                                : "assigned",
                              ...(user.role.includes("incidentManager")
                                ? {}
                                : { irInvestigator: user.id }),
                            },
                          },
                        ]
                      : []),
                  ]}
                />
              </>
            }
          />
        ))}
      </Routes>
      <Routes>
        <Route
          path={paths.incidentDashboard.myDashboard + "/*"}
          element={<MyDashboard />}
        />
        {checkPermission({ roleId: ["irInvestigator", "incidentManager"] }) && (
          <Route
            path={paths.incidentDashboard.qualityDashboard + "/*"}
            element={<QualityDashboard />}
          />
        )}
        {checkPermission({ roleId: ["irInvestigator"] }) && (
          <Route
            path={paths.incidentDashboard.irInvestigation.basePath + "/*"}
            element={<IrInvestigation />}
          />
        )}
        <Route path={"/*"} element={<h1>Fallback</h1>} />
      </Routes>
    </div>
  );
}
export const MyDashboard = () => {
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters, count, dashboard, setDashboard, irConfig } = useContext(
    IrDashboardContext
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  const [focus, setFocus] = useState(null);

  const { get: searchIrs, loading } = useFetch(defaultEndpoints.searchIrs);
  const { remove: deleteIr } = useFetch(
    defaultEndpoints.incidentReport + "/" + "{ID}"
  );

  const getActions = useCallback((inc) => [
    ...(+inc.status === 1
      ? [
          {
            icon: <BsPencilFill />,
            label: "Edit",
            callBack: () => {
              navigate(paths.incidentReport, {
                state: {
                  edit: inc,
                  focus: inc.id,
                  from: location?.pathname,
                },
              });
            },
          },
          {
            icon: <FaRegTrashAlt />,
            label: "Delete",
            callBack: () => {
              Prompt({
                type: "confirmation",
                message: `Are you sure you want to remove this incident?`,
                callback: () => {
                  deleteIr(null, {
                    params: { "{ID}": inc.id },
                  }).then(({ res }) => {
                    if (res.status === 204) {
                      setIncidents((prev) =>
                        prev.filter((ir) => ir.id !== inc.id)
                      );
                    }
                  });
                },
              });
            },
          },
          ...((checkPermission({
            roleId: ["irInvestigator", "incidentManager"],
            permission: "Cancel IR",
          }) && [
            {
              icon: <FaRegTrashAlt />,
              label: "Delete",
              callBack: () => {
                Prompt({
                  type: "confirmation",
                  message: "Are you sure you want to delete this report?",
                  callback: () => {
                    deleteIr(null, {
                      params: { "{ID}": inc.id },
                    }).then(({ res }) => {
                      if (res.status === 204) {
                        setIncidents((prev) =>
                          prev.filter((ir) => ir.id !== inc.id)
                        );
                      }
                    });
                  },
                });
              },
            },
          ]) ||
            []),
        ]
      : [
          {
            icon: <FaEye />,
            label: "Review IR",
            callBack: () => {
              navigate(paths.incidentReport, {
                state: {
                  edit: inc,
                  readOnly: true,
                  focus: inc.id,
                  from: location?.pathname,
                },
              });
            },
          },
        ]),
    ...((checkPermission({
      roleId: "hod",
      permission: "Acknowledge IR",
    }) &&
      irConfig.hodAcknowledgement && [
        {
          icon: <FaExternalLinkAlt />,
          label: "Acknowledge IR",
          callBack: () => {
            navigate(paths.irPreview, {
              state: {
                ir: inc,
                focus: inc.id,
                from: location?.pathname,
              },
            });
          },
        },
      ]) ||
      []),
  ]);

  useEffect(() => {
    setDashboard("myDashboard");
    if (location.state?.focus) {
      setFocus(location.state.focus);
    }
  }, []);
  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
    if (_filters.fromIncidentDateTime) {
      _filters.fromIncidentDateTime =
        _filters.fromIncidentDateTime + " 00:00:00";
    }
    if (_filters.toIncidentDateTime) {
      _filters.toIncidentDateTime = _filters.toIncidentDateTime + " 23:59:59";
    }
    if (_filters.fromreportingDate) {
      _filters.fromreportingDate = _filters.fromreportingDate + " 00:00:00";
    }
    if (_filters.toreportingDate) {
      _filters.toreportingDate = _filters.toreportingDate + " 23:59:59";
    }

    if (_filters.byIr !== "department") {
      _filters.userId = user.id;
    } else {
      delete _filters.userId;
    }
    // if (_filters.irBy === "self") {
    // } else {
    //   delete _filters.userId;
    // }

    if (Object.entries(_filters).length) {
      searchIrs(null, { query: _filters })
        .then(({ data, error }) => {
          if (error) {
            return Prompt({
              type: "error",
              message: error.message || error,
            });
          }
          if (data?._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      searchIrs(null, { query: { userId: user.id } })
        .then(({ data, error }) => {
          if (error) {
            return Prompt({
              type: "error",
              message: error.message || error,
            });
          }
          if (data?._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [location.search]);
  return (
    <div key="myDashboard" className={s.myDashboard}>
      <div className={s.reportCounts}>
        <ReportCount
          className="open"
          label="OPEN IRS"
          irs={[
            { label: "My IRs", count: count.myIr },
            ...((checkPermission({ roleId: "hod" }) && [
              { label: "Department IRs", count: count.departmentIr },
            ]) ||
              []),
          ]}
        />
        <ReportCount
          className="pending"
          label="PENDING"
          irs={[
            { label: "IR Query", count: 0 },
            { label: "CAPA Actions", count: 5 },
            { label: "IR Acknowledgement", count: 5 },
          ]}
        />
        <ReportCount
          className="closure"
          label="IR CLOSURE"
          irs={[
            { label: "IR Closure", count: 0 },
            { label: "Addendum", count: 5 },
            { label: "CAPA Closure", count: 5 },
          ]}
        />
      </div>
      <Filters
        onSubmit={(values) => {
          const _filters = {};
          for (var field in values) {
            if (values[field]) {
              if (values[field] === "self") {
                _filters.userId = user.id;
              }
              if (values[field] === "department") {
                _filters.department = user.department;
              }
              _filters[field] = values[field]?.join?.(",") || values[field];
            }
          }
          // delete _filters.irBy;
          navigate({
            pathname: location?.pathname,
            search: `?${createSearchParams(_filters)}`,
          });
          // setFilters(_filters);
        }}
      />
      <div className={s.report} />
      <Table
        columns={[
          { label: "IR Code" },
          { label: "Reporting Date & Time" },
          { label: "Incident Date & Time" },
          { label: "Incident Location" },
          { label: "Category" },
          { label: "Subcategory" },
          { label: "Incident Type" },
          { label: "Reported / Captured by" },
          { label: "IR Investigator" },
          { label: "Status" },
          { label: "TAT" },
          { label: "Actions" },
        ]}
        actions={true}
        loading={loading}
      >
        {incidents
          .sort((a, b) =>
            new Date(a.reportingDate) > new Date(b.reportingDate) ? -1 : 1
          )
          .map((inc) => (
            <SingleIr
              focus={focus}
              setFocus={setFocus}
              key={inc.id}
              ir={inc}
              actions={getActions(inc)}
              parameters={parameters}
            />
          ))}
      </Table>
      <div className={s.legend}>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 16, 54)" }}>
            <FaCircle />
          </span>{" "}
          Sentinel Event
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 163, 16)" }}>
            <WiTime9 />
          </span>{" "}
          IRs Beyond TAT
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(115, 49, 162)" }}>
            <BsFillExclamationTriangleFill />
          </span>{" "}
          Reportable Incident
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 112, 16)" }}>
            <FaUser />
          </span>{" "}
          Patient Complaint
        </span>
      </div>
    </div>
  );
};
const ReportCount = ({ label, className, irs }) => {
  return (
    <div className={`${s.reportCount} ${s[className]}`}>
      <h4>{label}</h4>
      <div className={s.data}>
        {irs.map((ir) => (
          <span key={ir.label}>
            <label>{ir.label} - </label>
            {ir.count}
          </span>
        ))}
      </div>
    </div>
  );
};
const SingleIr = memo(
  ({ ir, focus, setFocus, className, actions, parameters, styles }) => {
    const { tatConfig } = useContext(IrDashboardContext);
    const { irTypes } = useContext(SiteContext);
    const [showTatDetails, setShowTatDetails] = useState(false);
    const [timeline, setTimeline] = useState({});
    const [totalTat, setTotalTat] = useState(0);
    useEffect(() => {
      let status = {};
      ir.irStatusDetails.forEach((detail) => {
        if (detail.status === 10) {
          return;
        }
        if (Array.isArray(status[detail.status])) {
          status[detail.status].push(detail);
        } else {
          status[detail.status] = [detail];
        }
      });
      Object.entries(status).forEach(([sts, detail]) => {
        status[sts] = detail.sort((a, b) =>
          new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1
        );
      });
      setTimeline(status);
    }, [ir.irStatusDetails]);
    useEffect(() => {
      if (Object.keys(timeline).length) {
        const startDate = new Date(Object.values(timeline)[0][0].dateTime);
        const endDate = new Date(
          Object.values(timeline)[Object.values(timeline).length - 1][
            Object.values(timeline)[Object.values(timeline).length - 1].length -
              1
          ].dateTime
        );

        setTotalTat(
          countDays(startDate, endDate, tatConfig?.excludeWeek || [])
        );
      }
    }, [timeline]);
    return (
      <>
        <tr
          className={`${ir.typeofInci === 8 ? s.sentinel : ""} ${
            focus === ir.id ? s.focus : ""
          } ${className || ""}`}
          onClick={() => {
            setFocus && setFocus(ir.id);
          }}
          style={styles || {}}
        >
          <td className={s.irCode}>
            <span className={s.icons}>
              {ir.patientYesOrNo && (
                <>
                  <FaUser className={s.user} />
                  <span className={s.patientDetail}>
                    <p>
                      Patient Name: <b>{ir.patientname}</b>
                    </p>
                    <p>
                      Complaint Date & Time:{" "}
                      <b>
                        <Moment format="DD/MM/YYYY hh:mm">
                          {ir.complaIntegerDatetime}
                        </Moment>
                      </b>
                    </p>
                    <p>
                      Complaint ID: <b>{ir.complaIntegerIdEntry}</b>
                    </p>
                  </span>
                </>
              )}
              {ir.typeofInci === 8 && (
                <>
                  <FaCircle className={s.sentinel} />
                </>
              )}
              {ir.typeofInci === 8
                ? totalTat > tatConfig?.acceptableTatSentinel && (
                    <span
                      className={s.icon}
                      style={{ color: "rgb(230, 163, 16)", fontSize: "1.15em" }}
                    >
                      <WiTime9 />
                    </span>
                  )
                : totalTat > tatConfig?.acceptableTAT && (
                    <span
                      className={s.icon}
                      style={{
                        color: "rgb(230, 163, 16)",
                        fontSize: "1.15rem",
                      }}
                    >
                      <WiTime9 />
                    </span>
                  )}
              {parameters?.categories
                ?.find((item) => item.id === ir.inciCateg)
                ?.subCategorys?.find((item) => item.id === ir.inciSubCat)
                ?.reportable.length > 0 && (
                <>
                  <BsFillExclamationTriangleFill className={s.reportable} />
                </>
              )}
            </span>
            {ir.sequence}
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ir.reportingDate}</Moment>
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ir.incident_Date_Time}</Moment>
          </td>
          <td>
            {parameters?.locations?.find((item) => item.id === ir.location)
              ?.name || ir.location}
          </td>
          <td>
            {parameters?.categories?.find((item) => item.id === ir.inciCateg)
              ?.name || ir.inciCateg}
          </td>
          <td>
            {parameters?.categories
              ?.find((item) => item.id === ir.inciCateg)
              ?.subCategorys?.find((item) => item.id === ir.inciSubCat)?.name ||
              ir.inciSubCat}
          </td>
          <td>
            {irTypes.find(({ value }) => value === ir.typeofInci)?.label || [
              ir.typeofInci,
            ]}
          </td>
          <td>
            {parameters?.users?.find(({ value }) => value === ir.userId)
              ?.label || "Anonymous"}
          </td>
          <td>
            {parameters?.investigators?.find(
              ({ value }) => value === ir.irInvestigator
            )?.label || ir.irInvestigator}
          </td>
          <td>
            {irStatus.find((item) => item.id === +ir.status)?.name || ir.status}
          </td>
          <td className={s.tat} onClick={() => setShowTatDetails(true)}>
            {ir.status !== "1" && totalTat}
          </td>
          {actions && <TableActions actions={actions} />}
        </tr>
        <Modal
          open={showTatDetails}
          setOpen={setShowTatDetails}
          head={true}
          label="TAT DETAILS"
          className={s.tatDetails}
        >
          <TatDetails
            ir={ir}
            parameters={parameters}
            timeline={timeline}
            setShowTatDetails={setShowTatDetails}
            totalTat={totalTat}
          />
        </Modal>
      </>
    );
  }
);
const TatDetails = ({
  ir,
  parameters,
  setShowTatDetails,
  timeline,
  totalTat,
}) => {
  const { irTypes } = useContext(SiteContext);
  const { tatConfig } = useContext(IrDashboardContext);
  return (
    <div className={s.content}>
      <ul className={s.irDetail}>
        <li>IR Code: {ir?.sequence}</li>
        <li>
          Incident Date & Time:{" "}
          <Moment format="DD/MM/YYYY hh:mm">{ir?.incident_Date_Time}</Moment>
        </li>
        <li>
          Incident Type:{" "}
          {irTypes.find(({ value }) => value === ir?.typeofInci)?.label ||
            ir?.typeofInci}
        </li>
        <li>
          Category:{" "}
          {parameters?.categories?.find((item) => item.id === ir?.inciCateg)
            ?.name || ir?.inciCateg}
        </li>
        <li>
          Location:{" "}
          {parameters?.locations?.find((item) => item.id === ir?.location)
            ?.name || ir?.location}
        </li>
        <li>
          Sub Category:{" "}
          {parameters?.categories
            ?.find((item) => item.id === ir?.inciCateg)
            ?.subCategorys?.find((item) => item.id === ir?.inciSubCat)?.name ||
            ir?.inciSubCat}
        </li>
      </ul>
      <p className={s.totalDays}>TAT: {totalTat} Days</p>
      <Table
        columns={[
          { label: "Status" },
          { label: "User" },
          { label: "Date & Time" },
          { label: "Days" },
        ]}
      >
        {Object.entries(timeline)
          .filter(([status]) => status !== "10")
          .sort((a, b) =>
            irStatus.findIndex((s) => s.id === a.id) <
            irStatus.findIndex((s) => s.id === b.id)
              ? 1
              : -1
          )
          .map(([status, details], i, arr) => {
            const prevFirstDetail = arr[i + 1]?.[1]?.[arr[i + 1][1].length - 1];
            return (
              <tr key={status}>
                <td>
                  {irStatus.find((sts) => sts.id === +status)?.name || status}
                </td>
                <td>
                  {details.map((detail, i) => {
                    return (
                      <p key={detail.id}>
                        {parameters?.users?.find(
                          (user) => user.value === detail.userid
                        )?.label || detail.userid}
                      </p>
                    );
                  })}
                </td>
                <td>
                  {details
                    .sort((a, b) =>
                      new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1
                    )
                    .map((detail) => {
                      return (
                        <p key={detail.id}>
                          <Moment format="MM/DD/YYYY hh:mm">
                            {detail.dateTime}
                          </Moment>
                        </p>
                      );
                    })}
                </td>
                <td>
                  {(prevFirstDetail
                    ? countDays(
                        new Date(prevFirstDetail.dateTime),
                        new Date(details[details.length - 1]?.dateTime),
                        tatConfig?.excludeWeek || []
                      )
                    : 0) || null}
                </td>
              </tr>
            );
          })}
      </Table>
      <section className={s.btns}>
        <button
          className={`btn secondary wd-100`}
          onClick={() => setShowTatDetails(false)}
        >
          Close
        </button>
      </section>
    </div>
  );
};
const Filters = ({ onSubmit, qualityDashboard }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPermission, irTypes } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const defaultView = user?.role?.includes?.("incidentManager")
    ? "all"
    : "assigned";
  const { handleSubmit, register, watch, reset, setValue, getValues } = useForm(
    {
      defaultValues: {
        irBy: "self",
        status: "",
        view: user?.role?.includes?.("incidentManager") ? "all" : "assigned",
      },
    }
  );
  const [categories, setCategories] = useState([]);
  const fromIncidentDateTime = watch("fromIncidentDateTime");
  const fromreportingDate = watch("fromreportingDate");
  useEffect(() => {
    if (parameters.categories) {
      setCategories(
        parameters.categories.map(({ id, name }) => ({
          value: id,
          label: name,
        }))
      );
    }
  }, [parameters.categories]);
  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
    reset({
      sequence: "",
      fromreportingDate: "",
      toreportingDate: "",
      fromIncidentDateTime: "",
      toIncidentDateTime: "",
      ..._filters,
      typeofInci: _filters.typeofInci?.split(",").map((c) => +c) || "",
      irInvestigator: _filters.irInvestigator?.split(",").map((c) => +c) || "",
      status: _filters.status?.split(",").map((c) => +c) || "",
      InciCateg: _filters.InciCateg?.split(",").map((c) => +c) || "",
    });
  }, [location.search]);
  const view = watch("view");
  useEffect(() => {
    if (qualityDashboard) {
      if (view === "all") {
        setValue("irInvestigator", "");
      } else if (view === "assigned") {
        setValue("irInvestigator", user.id);
      }
    }
  }, [view]);
  return (
    <form className={s.filters} onSubmit={handleSubmit(onSubmit)}>
      <Input label="IR Code" {...register("sequence")} />
      <Combobox
        placeholder="All"
        label="Category"
        name="InciCateg"
        setValue={setValue}
        watch={watch}
        multiple={true}
        register={register}
        options={categories}
      />
      <section className={s.pair}>
        <label>Incident Date Range</label>
        <Input
          type="date"
          placeholder="From"
          {...register("fromIncidentDateTime")}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
        <Input
          type="date"
          placeholder="To"
          {...register("toIncidentDateTime")}
          min={moment({
            format: "YYYY-MM-DD",
            time: new Date(fromIncidentDateTime),
          })}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
      </section>
      <section className={s.pair}>
        <label>Reporting Date Range</label>
        <Input
          type="date"
          placeholder="From"
          {...register("fromreportingDate")}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
        <Input
          type="date"
          placeholder="To"
          {...register("toreportingDate")}
          min={moment({
            format: "YYYY-MM-DD",
            time: new Date(fromreportingDate),
          })}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
      </section>
      <Combobox
        placeholder="All"
        label="Incident Type"
        name="typeofInci"
        setValue={setValue}
        watch={watch}
        multiple={true}
        register={register}
        options={irTypes}
      />
      <section className={s.pair}>
        <Combobox
          placeholder="All"
          label="IR Investigator"
          name="irInvestigator"
          setValue={setValue}
          watch={watch}
          register={register}
          options={parameters?.investigators}
          multiple={true}
        />
        <Combobox
          placeholder="All"
          label="Status"
          name="status"
          setValue={setValue}
          watch={watch}
          register={register}
          multiple={true}
          options={irStatus
            .filter((status) =>
              qualityDashboard && status.id === 1 ? false : true
            )
            .map((item) => ({
              label: item.name,
              value: item.id,
            }))}
        />
      </section>
      {qualityDashboard ? (
        <section className={`${s.pair} ${s.checkboxes}`}>
          <Radio
            register={register}
            name="view"
            options={[
              ...((checkPermission({
                roleId: ["irInvestigator"],
                permission:
                  "Access to view IRs in quality dashboardAssigned IR",
              }) && [
                {
                  label: "Assigned IRs",
                  value: "assigned",
                },
              ]) ||
                []),
              ...(checkPermission({
                roleId: ["irInvestigator"],
                permission: "Access to view IRs in quality dashboardAll IRs",
              })
                ? [
                    {
                      label: "All IRs",
                      value: "all",
                    },
                  ]
                : []),
            ]}
          />
        </section>
      ) : (
        <section className={`${s.pair} ${s.checkboxes}`}>
          <Radio
            register={register}
            name="irBy"
            options={[
              {
                label: "My IRs",
                value: "self",
              },
              ...((checkPermission({ roleId: "hod" }) && [
                {
                  label: "My Department IRs",
                  value: "department",
                },
              ]) ||
                []),
            ]}
          />
        </section>
      )}
      <section className={s.btns}>
        <button className="btn secondary">
          <BiSearch /> Search
        </button>
        <button
          type="button"
          className={`btn clear ${s.clear}`}
          onClick={() => {
            reset({
              irBy: "self",
              view: defaultView,
            });
            navigate({
              pathname: location?.pathname,
              search: `?${createSearchParams({
                irBy: "self",
                view: defaultView,
              })}`,
            });
            onSubmit({
              irBy: "self",
              view: defaultView,
            });
          }}
        >
          Clear
        </button>
      </section>
    </form>
  );
};

export const QualityDashboard = () => {
  const { user, checkPermission, irTypes } = useContext(SiteContext);
  const {
    parameters,
    setDashboard,
    updateUsers,
    tatConfig,
    irConfig,
  } = useContext(IrDashboardContext);
  const printRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [csvDraft, setCsvDraft] = useState(null);
  const [filters, setFilters] = useState({});
  const [assign, setAssign] = useState(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const getActions = useCallback((inc) => [
    ...(checkPermission({
      roleId: "incidentManager",
      permission: "Assign IRs",
    }) && [2, 3].includes(+inc.status)
      ? [
          {
            icon: <FaRegUser />,
            label: +inc.status === 2 ? "Assign IR" : "Re-assign IR",
            callBack: () => setAssign(inc),
          },
        ]
      : []),
    ...(+inc.status === 2
      ? [
          {
            icon: <FaRegFileAlt />,
            label: (
              <>
                Review IR <FaFlag style={{ color: "rgb(21, 164, 40)" }} />
                <FiCheckSquare />
              </>
            ),
            callBack: () => {},
          },
          ...(checkPermission({
            roleId: ["irInvestigator", "incidentManager"],
            permission: "Cancel IR",
          })
            ? [
                {
                  icon: <FaRegTimesCircle />,
                  label: "Cancel IR",
                  callBack: () => {},
                },
              ]
            : []),
          {
            icon: <FaExternalLinkAlt />,
            label: "Reportable Incident",
            callBack: () => {},
          },
          {
            icon: <FaAdjust />,
            label: "Merge/Un-Merge IR",
            callBack: () => {},
          },
        ]
      : []),
    ...(checkPermission({
      roleId: ["incidentManager", "hod"],
      permission: "Approve IRs",
    })
      ? [
          {
            icon: <FiCheckSquare />,
            label: "IR Approval",
            callBack: () => {},
          },
        ]
      : []),
    ...(checkPermission({
      roleId: ["hod"],
      permission: "Acknowledge IR",
    }) && irConfig.hodAcknowledgement
      ? [
          {
            icon: <FaExternalLinkAlt />,
            label: (
              <>
                Acknowledge IR{" "}
                {inc.status.toString() === "11" && (
                  <FaFlag style={{ color: "rgb(21, 164, 40)" }} />
                )}
              </>
            ),
            callBack: () => {
              navigate(paths.irPreview, {
                state: {
                  ir: inc,
                  focus: inc.id,
                  from: location?.pathname,
                },
              });
            },
          },
        ]
      : []),
    {
      icon: <FaAdjust />,
      label: "IR Combine",
      callBack: () => {},
    },
    {
      icon: <FaCrosshairs />,
      label: "IR Investigation",
      callBack: () =>
        navigate({
          pathname: `${
            paths.incidentDashboard.basePath
          }/${paths.incidentDashboard.irInvestigation.basePath.replace(
            ":irId",
            inc.id
          )}/${paths.incidentDashboard.irInvestigation.investigation.basePath}`,
          // search: "?" + createSearchParams({ irId: inc.id }),
        }),
    },
    {
      icon: <FaRegStar />,
      label: "CAPA",
      callBack: () => {},
    },
    {
      icon: <svg />,
      label: "IR Closure",
      callBack: () => {},
    },
  ]);

  const { get: searchIrs, loading } = useFetch(defaultEndpoints.searchIrs);

  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
    if (_filters.fromIncidentDateTime) {
      _filters.fromIncidentDateTime =
        _filters.fromIncidentDateTime + " 00:00:00";
    }
    if (_filters.toIncidentDateTime) {
      _filters.toIncidentDateTime = _filters.toIncidentDateTime + " 23:59:59";
    }
    if (_filters.fromreportingDate) {
      _filters.fromreportingDate = _filters.fromreportingDate + " 00:00:00";
    }
    if (_filters.toreportingDate) {
      _filters.toreportingDate = _filters.toreportingDate + " 23:59:59";
    }
    if (Object.entries(_filters).length) {
      searchIrs(null, {
        query: {
          ...filters,
          ..._filters,
          status: _filters.status ? _filters.status : "2,3,4,5,6,7,8,9,11",
        },
      })
        .then(({ data, error }) => {
          if (error) {
            return Prompt({
              type: "error",
              message: error.message || error,
            });
          }
          if (data?._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
            setCsvDraft({
              headers: Object.entries({
                "IR Code": "sequence",
                "Reporting Date & Time": "reportingDate",
                "Incident Date & Time": "incident_Date_Time",
                "Incident Location": "location",
                Category: "inciCateg",
                Subcategory: "inciSubCat",
                "Incident Type": "typeofInci",
                "Reported / Captured by": "userId",
                "IR Investigator": "irInvestigator",
                Status: "status",
                TAT: "tat",
              }).map(([key, value]) => ({
                label: key,
                key: value,
              })),
              data: data._embedded.IncidentReport.sort((a, b) =>
                new Date(a.reportingDate) > new Date(b.reportingDate) ? -1 : 1
              ).map((ir) => {
                const tat = calculateDays(ir, tatConfig?.excludeWeek);

                return {
                  ...ir,
                  reportingDate: moment({
                    time: ir.reportingDate,
                    format: "DD/MM/YYYY hh:mm",
                  }),
                  incident_Date_Time: moment({
                    time: ir.incident_Date_Time,
                    format: "DD/MM/YYYY hh:mm",
                  }),
                  location:
                    parameters?.locations?.find(
                      (item) => item.id === ir.location
                    )?.name || ir.location,
                  inciCateg:
                    parameters?.categories?.find(
                      (item) => item.id === ir.inciCateg
                    )?.name || ir.inciCateg,
                  inciSubCat:
                    parameters?.categories
                      ?.find((item) => item.id === ir.inciCateg)
                      ?.subCategorys?.find((item) => item.id === ir.inciSubCat)
                      ?.name || ir.inciSubCat,
                  typeofInci: irTypes.find(
                    ({ value }) => value === ir.typeofInci
                  )?.label || [ir.typeofInci],
                  userId:
                    parameters?.users?.find(({ value }) => value === ir.userId)
                      ?.label || "Anonymous",
                  irInvestigator:
                    parameters?.investigators?.find(
                      ({ value }) => value === ir.irInvestigator
                    )?.label || ir.irInvestigator,
                  status:
                    irStatus.find((item) => item.id === +ir.status)?.name ||
                    ir.status,
                  tat,
                };
              }),
              filename: `Incident Report.csv`,
            });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      searchIrs(null, { query: { status: "2,3,4,5,6,7,8,9,11" } })
        .then(({ data, error }) => {
          if (error) {
            return Prompt({
              type: "error",
              message: error.message || error,
            });
          }
          if (data?._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [location.search]);
  useEffect(() => {
    setDashboard("qualityDashboard");
  }, []);
  return (
    <div key="qualityDashboard" className={s.qualityDashboard}>
      <Filters
        onSubmit={(values) => {
          const _filters = {};
          for (var field in values) {
            if (values[field])
              _filters[field] = values[field]?.join?.(",") || values[field];
            if (values[field] === "assigned") {
              // _filters.status = 3;
              _filters.irInvestigator = user.id;
            }
          }
          // delete _filters.view;
          navigate({
            pathname: location?.pathname,
            search: `?${createSearchParams(_filters)}`,
          });
          // setFilters(_filters);
        }}
        qualityDashboard={true}
      />
      <div className={s.report}>
        {checkPermission({
          roleId: ["irInvestigator", "irManager"],
          permission: "PrintReported IR",
        }) && (
          <>
            {csvDraft && (
              <button className={"btn clear"}>
                <CSVLink {...csvDraft} type="submit">
                  Export <FaUpload />
                </CSVLink>
              </button>
            )}
            <button className={"btn clear"} onClick={handlePrint}>
              Print <FaPrint />
            </button>
            <PrintMemo
              incidents={incidents}
              parameters={parameters}
              ref={printRef}
              irTypes={irTypes}
              tatConfig={tatConfig}
            />
          </>
        )}
      </div>
      <VirtualTable
        columns={[
          { label: "IR Code" },
          { label: "Reporting Date & Time" },
          { label: "Incident Date & Time" },
          { label: "Incident Location" },
          { label: "Category" },
          { label: "Subcategory" },
          { label: "Incident Type" },
          { label: "Reported / Captured by" },
          { label: "IR Investigator" },
          { label: "Status" },
          { label: "TAT" },
          { label: "Actions" },
        ]}
        actions={true}
        loading={loading}
        rows={incidents.sort((a, b) =>
          new Date(a.reportingDate) > new Date(b.reportingDate) ? -1 : 1
        )}
        rowHeight={50}
        rowRenderer={(inc, styles) => (
          <SingleIr
            key={inc.id}
            ir={inc}
            actions={getActions(inc)}
            parameters={parameters}
            styles={styles}
          />
        )}
      />
      {
        //   <Table
        //   columns={[
        //     { label: "IR Code" },
        //     { label: "Reporting Date & Time" },
        //     { label: "Incident Date & Time" },
        //     { label: "Incident Location" },
        //     { label: "Category" },
        //     { label: "Subcategory" },
        //     { label: "Incident Type" },
        //     { label: "Reported / Captured by" },
        //     { label: "IR Investigator" },
        //     { label: "Status" },
        //     { label: "TAT" },
        //     { label: "Actions" },
        //   ]}
        //   actions={true}
        //   loading={loading}
        // >
        //   {incidents
        //     .sort((a, b) =>
        //       new Date(a.reportingDate) > new Date(b.reportingDate) ? -1 : 1
        //     )
        //     .map((inc, i) => (
        //       <SingleIr
        //         key={inc.id}
        //         ir={inc}
        //         actions={getActions(inc)}
        //         parameters={parameters}
        //       />
        //     ))}
        // </Table>
      }
      <div className={s.legend}>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 16, 54)" }}>
            <FaCircle />
          </span>{" "}
          Sentinel Event
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 163, 16)" }}>
            <WiTime9 />
          </span>{" "}
          IRs Beyond TAT
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(115, 49, 162)" }}>
            <BsFillExclamationTriangleFill />
          </span>{" "}
          Reportable Incident
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 112, 16)" }}>
            <FaUser />
          </span>{" "}
          Patient Complaint
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(46, 74, 121)" }}>
            <FiCheckSquare />
          </span>{" "}
          IR Rectified
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(46, 74, 121)" }}>
            <FaRegCheckCircle />
          </span>{" "}
          CAPA Accepted
        </span>
        <span>
          <span className={s.icon} style={{ color: "rgb(21, 164, 40)" }}>
            <FaFlag />
          </span>{" "}
          IR Acknowledge
        </span>
      </div>
      <Modal
        head={true}
        label={+assign?.status === 2 ? "ASSIGN IR" : "RE-ASSIGN IR"}
        open={assign}
        setOpen={setAssign}
        className={s.assignModal}
      >
        <div className={s.content}>
          <ul className={s.irDetail}>
            <li>IR Code: {assign?.sequence}</li>
            <li>
              Incident Date & Time:{" "}
              <Moment format="DD/MM/YYYY hh:mm">
                {assign?.incident_Date_Time}
              </Moment>
            </li>
            <li>
              Incident Type:{" "}
              {irTypes.find(({ value }) => value === assign?.typeofInci)
                ?.label || assign?.typeofInci}
            </li>
            <li>
              Category:{" "}
              {parameters?.categories?.find(
                (item) => item.id === assign?.inciCateg
              )?.name || assign?.inciCateg}
            </li>
            <li>
              Location:{" "}
              {parameters?.locations?.find(
                (item) => item.id === assign?.location
              )?.name || assign?.location}
            </li>
            <li>
              Sub Category:{" "}
              {parameters?.categories
                ?.find((item) => item.id === assign?.inciCateg)
                ?.subCategorys?.find((item) => item.id === assign?.inciSubCat)
                ?.name || assign?.inciSubCat}
            </li>
          </ul>
          <AssignForm
            assign={assign}
            users={parameters?.investigators}
            setAssign={setAssign}
            onSuccess={(incident) => {
              setIncidents((prev) =>
                prev.map((inc) => (inc.id === incident.id ? incident : inc))
              );
              updateUsers();
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
const AssignForm = ({ assign, users, setAssign, onSuccess }) => {
  const [timeline, setTimeline] = useState([]);

  const { put: assignIr, loading } = useFetch(
    defaultEndpoints.incidentReport + "/" + (assign.id || "")
  );

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (assign?.irStatusDetails?.length) {
      setTimeline(
        assign.irStatusDetails
          .filter((evt) => evt.status === 3)
          .sort((a, b) =>
            new Date(a.dateTime) > new Date(b.dateTime) ? 1 : -1
          )
          .map((evt) => ({
            ...evt,
            status: "Assigned",
            user: users.find((u) => u.value === evt.userid) || {},
          }))
      );
    }
  }, []);
  return (
    <>
      {timeline && +assign.status === 3 && (
        <ul className={s.timeline}>
          {timeline.map((evt) => (
            <li key={evt.id}>
              <span className={s.ball} />
              <p>
                <span className={s.status}>{evt.status}</span> to{" "}
                {evt.user.label} on{" "}
                <Moment format="DD/MM/YYYY">{evt.dateTime}</Moment> at{" "}
                <Moment format="hh:mm">{evt.dateTime}</Moment>
              </p>
            </li>
          ))}
          <li>
            <span className={`${s.ball} ${s.new}`} />
            <p>Re-assign</p>
            <span className={s.ir}>IR</span>
          </li>
        </ul>
      )}
      <form
        onSubmit={handleSubmit((data) => {
          assignIr({
            ...assign,
            irInvestigator: data.user,
            status: 3,
            irStatusDetails: [
              ...(assign.irStatusDetails || []).map((evt) => ({
                ...evt,
                id: undefined,
              })),
              ...((timeline.length && [
                {
                  userid: timeline[timeline.length - 1].userid,
                  status: 10,
                  dateTime: new Date().toISOString(),
                },
              ]) ||
                []),
              {
                userid: data.user,
                status: 3,
                dateTime: new Date().toISOString(),
              },
            ],
            actionTakens: undefined,
            _links: undefined,
          })
            .then((data) => {
              if (data.id) {
                setAssign(null);
                onSuccess(data);
              }
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        })}
      >
        <Combobox
          className={s.userCombo}
          label="Select User to assign:"
          name="user"
          register={register}
          formOptions={{
            required: "Select an Investigator",
          }}
          error={errors.user}
          setValue={setValue}
          watch={watch}
          options={users.filter((user) => user.value !== assign.irInvestigator)}
          item={(option) => (
            <>
              {option.label} ({option.assignedIr || 0})
            </>
          )}
        />
        <section className={s.btns}>
          <button
            className="btn secondary ghost wd-100"
            type="button"
            onClick={() => setAssign(null)}
          >
            Close
          </button>
          <button className="btn wd-100" disabled={loading}>
            {timeline.length > 0 ? "Re-Assign" : "Assign"}
          </button>
        </section>
      </form>
    </>
  );
};

export default IrDashboard;
