import React, {
  useState,
  useEffect,
  useContext,
  Component,
  useRef,
} from "react";
import {
  SiteContext,
  IrDashboardContext,
  IrDashboardContextProvider,
} from "../SiteContext";
import { Routes, Route } from "react-router-dom";
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
  TableActions,
  Moment,
  moment,
} from "./elements";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
import paths from "./path";
import { incidentTypes, irStatus } from "../config";
import { CSVLink } from "react-csv";
import s from "./irDashboard.module.scss";
import { useReactToPrint } from "react-to-print";

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
              .map((ir, i) => (
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
                    {parameters?.locations.find(
                      (item) => item.id === ir.location
                    )?.name || ir.location}
                  </td>
                  <td>
                    {parameters?.categories.find(
                      (item) => item.id === ir.inciCateg
                    )?.name || ir.inciCateg}
                  </td>
                  <td>
                    {parameters?.categories
                      .find((item) => item.id === ir.inciCateg)
                      ?.subCategorys?.find((item) => item.id === ir.inciSubCat)
                      ?.name || ir.inciSubCat}
                  </td>
                  <td>
                    {incidentTypes.find(({ value }) => value === ir.typeofInci)
                      ?.label || [ir.typeofInci]}
                  </td>
                  <td>
                    {parameters?.users.find(({ value }) => value === ir.userId)
                      ?.label || "Anonymous"}
                  </td>
                  <td>
                    {parameters?.investigators.find(
                      ({ value }) => value === ir.irInvestigator
                    )?.label || ir.irInvestigator}
                  </td>
                  <td>
                    {irStatus.find((item) => item.id === +ir.status)?.name ||
                      ir.status}
                  </td>
                  <td className={s.tat}>
                    {Math.floor(
                      ((ir.closureDate || new Date()) -
                        new Date(ir.reportingDate)) /
                        (1000 * 3600 * 24)
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

function IrDashboard() {
  const { user, checkPermission } = useContext(SiteContext);
  return (
    <div className={s.container}>
      <header>
        <h3>INCIDENT REPORTING DASHBOARD</h3>
      </header>
      <Tabs
        tabs={[
          {
            label: "My Dashboard",
            path: paths.incidentDashboard.myDashboard,
            search: {
              userId: user.id,
            },
          },
          ...(checkPermission({ roleId: ["irInvestigator", "incidentManager"] })
            ? [
                {
                  label: "Quality Dashboard",
                  path: paths.incidentDashboard.qualityDashboard,
                  search: {
                    // status: 3,
                    irInvestigator: user.id,
                  },
                },
              ]
            : []),
        ]}
      />
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
        <Route path={"/*"} element={<h1>Fallback</h1>} />
      </Routes>
    </div>
  );
}
export const MyDashboard = () => {
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters, count, setDashboard } = useContext(IrDashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  const [focus, setFocus] = useState(null);
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
    if (_filters.irBy === "self") {
      _filters.userId = user.id;
    } else {
      delete _filters.userId;
    }
    setLoading(true);
    if (Object.entries(_filters).length) {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search/byDetails?${new URLSearchParams({
          ..._filters,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search/byDetails?${new URLSearchParams({
          userId: user.id,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => {
          setLoading(false);
        });
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
            pathname: location.pathname,
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
              actions={[
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
                              from: location.pathname,
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
                              message:
                                "Are you sure you want to delete this report?",
                              callback: () => {
                                fetch(
                                  `${process.env.REACT_APP_HOST}/IncidentReport/${inc.id}`,
                                  { method: "DELETE" }
                                ).then((res) => {
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
                              from: location.pathname,
                            },
                          });
                        },
                      },
                    ]),
                ...((checkPermission({
                  roleId: "hod",
                  permission: "Acknowledge IR",
                }) && [
                  {
                    icon: <FaExternalLinkAlt />,
                    label: "Acknowledge IR",
                    callBack: () => {},
                  },
                ]) ||
                  []),
              ]}
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
const SingleIr = ({ ir, focus, setFocus, className, actions, parameters }) => {
  const [showTatDetails, setShowTatDetails] = useState(false);
  return (
    <>
      <tr
        className={`${ir.typeofInci === 8 ? s.sentinel : ""} ${
          focus === ir.id ? s.focus : ""
        } ${className || ""}`}
        onClick={() => {
          setFocus && setFocus(ir.id);
        }}
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
            {parameters?.categories
              .find((item) => item.id === ir.inciCateg)
              ?.subCategorys?.find((item) => item.id === ir.inciSubCat)
              ?.reportable?.length > 0 && (
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
          {parameters?.locations.find((item) => item.id === ir.location)
            ?.name || ir.location}
        </td>
        <td>
          {parameters?.categories.find((item) => item.id === ir.inciCateg)
            ?.name || ir.inciCateg}
        </td>
        <td>
          {parameters?.categories
            .find((item) => item.id === ir.inciCateg)
            ?.subCategorys?.find((item) => item.id === ir.inciSubCat)?.name ||
            ir.inciSubCat}
        </td>
        <td>
          {incidentTypes.find(({ value }) => value === ir.typeofInci)
            ?.label || [ir.typeofInci]}
        </td>
        <td>
          {parameters?.users.find(({ value }) => value === ir.userId)?.label ||
            "Anonymous"}
        </td>
        <td>
          {parameters?.investigators.find(
            ({ value }) => value === ir.irInvestigator
          )?.label || ir.irInvestigator}
        </td>
        <td>
          {irStatus.find((item) => item.id === +ir.status)?.name || ir.status}
        </td>
        <td className={s.tat} onClick={() => setShowTatDetails(true)}>
          {Math.floor(
            ((ir.closureDate || new Date()) - new Date(ir.reportingDate)) /
              (1000 * 3600 * 24)
          )}
        </td>
        <TableActions actions={actions} />
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
          setShowTatDetails={setShowTatDetails}
        />
      </Modal>
    </>
  );
};
const TatDetails = ({ ir, parameters, setShowTatDetails }) => {
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
          {incidentTypes.find(({ value }) => value === ir?.typeofInci)?.label ||
            ir?.typeofInci}
        </li>
        <li>
          Category:{" "}
          {parameters?.categories.find((item) => item.id === ir?.inciCateg)
            ?.name || ir?.inciCateg}
        </li>
        <li>
          Location:{" "}
          {parameters?.locations.find((item) => item.id === ir?.location)
            ?.name || ir?.location}
        </li>
        <li>
          Sub Category:{" "}
          {parameters?.categories
            .find((item) => item.id === ir?.inciCateg)
            ?.subCategorys?.find((item) => item.id === ir?.inciSubCat)?.name ||
            ir?.inciSubCat}
        </li>
      </ul>
      <p className={s.totalDays}>
        TAT:{" "}
        {Math.floor(
          ((ir.closureDate || new Date()) - new Date(ir.reportingDate)) /
            (1000 * 3600 * 24)
        )}{" "}
        Days
      </p>
      <Table
        columns={[
          { label: "Status" },
          { label: "User" },
          { label: "Date & Time" },
          { label: "Days" },
        ]}
      >
        {ir.irStatusDetails
          .sort((a, b) =>
            new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1
          )
          .map((evt) => (
            <tr key={evt.dateTime}>
              <td>
                {irStatus.find((status) => status.id === evt.status)?.name ||
                  evt.status}
              </td>
              <td>
                {parameters?.users.find((user) => user.value === evt.userid)
                  ?.label || evt.userid}
              </td>
              <td>
                <Moment format="MM/DD/YYYY hh:mm">{evt.dateTime}</Moment>
              </td>
              <td>
                {Math.floor(
                  (new Date(evt.dateTime) - new Date(ir.reportingDate)) /
                    (1000 * 3600 * 24)
                )}
              </td>
            </tr>
          ))}
      </Table>
      <section className={s.btns}>
        <button
          className={`btn secondary w-100`}
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
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const { handleSubmit, register, watch, reset, setValue, getValues } = useForm(
    {
      defaultValues: { irBy: "self", status: "", view: "assigned" },
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
      // view: _filters.status === "3" ? "assigned" : "all",
      ..._filters,
      typeofInci: _filters.typeofInci?.split(",").map((c) => +c) || "",
      irInvestigator: _filters.irInvestigator?.split(",").map((c) => +c) || "",
      status: _filters.status?.split(",").map((c) => +c) || "",
      // view: "assigned",
      InciCateg: _filters.InciCateg?.split(",").map((c) => +c) || "",
    });
  }, [location.search]);
  const view = watch("view");
  useEffect(() => {
    if (qualityDashboard) {
      if (view === "all") {
        setValue("irInvestigator", "");
        // setValue("status", "");
      } else if (view === "assigned") {
        setValue("irInvestigator", user.id);
        // setValue("status", 3);
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
        options={incidentTypes}
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
              view: "assigned",
            });
            // navigate({
            //   pathname: location.pathname,
            //   search: `?${createSearchParams(_filters)}`,
            // });
            navigate({
              pathname: location.pathname,
              search: `?${createSearchParams({
                irBy: "self",
                view: "assigned",
              })}`,
            });
            onSubmit({
              irBy: "self",
              view: "assigned",
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
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters, setDashboard } = useContext(IrDashboardContext);
  const printRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [csvDraft, setCsvDraft] = useState(null);
  const [filters, setFilters] = useState({});
  const [assign, setAssign] = useState(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });
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
    setLoading(true);
    if (Object.entries(_filters).length) {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search/byDetails?${new URLSearchParams({
          ...filters,
          ..._filters,
          status: _filters.status ? _filters.status : "2,3,4,5,6,7,8,9",
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data._embedded?.IncidentReport) {
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
              ).map((ir) => ({
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
                  parameters?.locations.find((item) => item.id === ir.location)
                    ?.name || ir.location,
                inciCateg:
                  parameters?.categories.find(
                    (item) => item.id === ir.inciCateg
                  )?.name || ir.inciCateg,
                inciSubCat:
                  parameters?.categories
                    .find((item) => item.id === ir.inciCateg)
                    ?.subCategorys?.find((item) => item.id === ir.inciSubCat)
                    ?.name || ir.inciSubCat,
                typeofInci: incidentTypes.find(
                  ({ value }) => value === ir.typeofInci
                )?.label || [ir.typeofInci],
                userId:
                  parameters?.users.find(({ value }) => value === ir.userId)
                    ?.label || "Anonymous",
                irInvestigator:
                  parameters?.investigators.find(
                    ({ value }) => value === ir.irInvestigator
                  )?.label || ir.irInvestigator,
                status:
                  irStatus.find((item) => item.id === +ir.status)?.name ||
                  ir.status,
                tat: Math.floor(
                  ((ir.closureDate || new Date()) -
                    new Date(ir.reportingDate)) /
                    (1000 * 3600 * 24)
                ),
              })),
              filename: `Incident Report.csv`,
            });
          }
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search/byDetails?${new URLSearchParams({
          status: "2,3,4,5,6,7,8,9",
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        })
        .catch((err) => {
          setLoading(false);
        });
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
            pathname: location.pathname,
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
          </>
        )}
      </div>
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
              key={inc.id}
              ir={inc}
              actions={[
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
                            Review IR{" "}
                            <FaFlag style={{ color: "rgb(21, 164, 40)" }} />
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
                })
                  ? [
                      {
                        icon: <FaExternalLinkAlt />,
                        label: "Acknowledge IR",
                        callBack: () => {},
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
                  callBack: () => {},
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
              ]}
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
      <Print incidents={incidents} parameters={parameters} ref={printRef} />
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
              {incidentTypes.find(({ value }) => value === assign?.typeofInci)
                ?.label || assign?.typeofInci}
            </li>
            <li>
              Category:{" "}
              {parameters?.categories.find(
                (item) => item.id === assign?.inciCateg
              )?.name || assign?.inciCateg}
            </li>
            <li>
              Location:{" "}
              {parameters?.locations.find(
                (item) => item.id === assign?.location
              )?.name || assign?.location}
            </li>
            <li>
              Sub Category:{" "}
              {parameters?.categories
                .find((item) => item.id === assign?.inciCateg)
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
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
const AssignForm = ({ assign, users, setAssign, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);
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
        assign.irStatusDetails.map((evt) => ({
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
          setLoading(true);
          fetch(`${process.env.REACT_APP_HOST}/IncidentReport/${assign.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...assign,
              irInvestigator: data.user,
              status: 3,
              irStatusDetails: [
                ...(assign.irStatusDetails || []).map((evt) => ({
                  ...evt,
                  id: undefined,
                })),
                {
                  userid: data.user,
                  status: 3,
                  dateTime: new Date().toISOString(),
                },
              ],
              actionTakens: undefined,
              _links: undefined,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              setLoading(false);
              if (data.id) {
                setAssign(null);
                onSuccess(data);
              }
            })
            .catch((err) => {
              setLoading(false);
              Prompt({ type: "error", message: err.message });
            });
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
            className="btn secondary ghost w-100"
            type="button"
            onClick={() => setAssign(null)}
          >
            Close
          </button>
          <button className="btn w-100" disabled={loading}>
            {assign ? "Re-Assign" : "Assign"}
          </button>
        </section>
      </form>
    </>
  );
};

export default IrDashboard;
