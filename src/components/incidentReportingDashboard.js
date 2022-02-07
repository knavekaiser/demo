import React, { useState, useEffect, useContext } from "react";
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
  FaRegFileAlt,
  FaExternalLinkAlt,
  FaRegStickyNote,
  FaRegCheckSquare,
  FaAdjust,
  FaCrosshairs,
  FaRegUser,
  FaUser,
} from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { WiTime9 } from "react-icons/wi";
import {
  BsPencilFill,
  BsFillCircleFill,
  BsFillExclamationTriangleFill,
} from "react-icons/bs";
import { GoPerson } from "react-icons/go";
import {
  Radio,
  Tabs,
  Input,
  Combobox,
  Table,
  TableActions,
  Moment,
  Checkbox,
  moment,
} from "./elements";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
import paths from "./path";
import { incidentTypes, irStatus } from "../config";
import s from "./incidentReportingDashboard.module.scss";

function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function IncidentReportingDashboard() {
  const { checkPermission } = useContext(SiteContext);
  return (
    <div className={s.container}>
      <header>
        <h3>INCIDENT REPORTING DASHBOARD</h3>
      </header>
      <Tabs
        tabs={[
          { label: "My Dashboard", path: paths.incidentDashboard.myDashboard },
          ...(checkPermission({ roleId: ["irInvestigator", "irManager"] })
            ? [
                {
                  label: "Quality Dashboard",
                  path: paths.incidentDashboard.qualityDashboard,
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
        {checkPermission({ roleId: ["irInvestigator", "irManager"] }) && (
          <Route
            path={paths.incidentDashboard.qualityDashboard + "/*"}
            element={<QualityDashboard />}
          />
        )}
      </Routes>
    </div>
  );
}
const MyDashboard = () => {
  const { user } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  const [focus, setFocus] = useState(null);
  useEffect(() => {
    if (location.state?.focus) {
      setFocus(location.state.focus);
    }
  }, []);
  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
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
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        });
    } else {
      fetch(`${process.env.REACT_APP_HOST}/IncidentReport`)
        .then((res) => res.json())
        .then((data) => {
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        });
    }
  }, [location.search]);
  return (
    <div className={s.myDashboard}>
      <div className={s.reportCounts}>
        <ReportCount
          className="open"
          label="OPEN IRS"
          irs={[
            { label: "My IRs", count: 0 },
            { label: "Department IRs", count: 10 },
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
          delete _filters.irBy;
          navigate({
            pathname: location.pathname,
            search: `?${createSearchParams(_filters)}`,
          });
          // setFilters(_filters);
        }}
      />
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
                    ]
                  : [
                      {
                        icon: <FaRegFileAlt />,
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
              ]}
              parameters={parameters}
            />
          ))}
      </Table>
      <div className={s.legend}>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 16, 54)" }}>
            <BsFillCircleFill />
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
            <GoPerson />
          </span>{" "}
          Patient Complient
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
  return (
    <tr
      className={`${ir.typeofInci === 8 ? s.sentinel : ""} ${
        focus === ir.id ? s.focus : ""
      } ${className || ""}`}
      onClick={() => {
        setFocus && setFocus(ir.id);
      }}
    >
      <td>
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
                    <Moment format="DD/MM/YYYY hh:mma">
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
        {parameters?.locations.find((item) => item.id === ir.location)?.name ||
          ir.location}
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
        {incidentTypes.find(({ value }) => value === ir.typeofInci)?.label || [
          ir.typeofInci,
        ]}
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
      <td>{ir.tat}</td>
      <TableActions actions={actions} />
    </tr>
  );
};
const Filters = ({ onSubmit, qualityDashboard }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkPermission } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    getValues,
  } = useForm({ defaultValues: { view: "assignedToSelf" } });
  const [categories, setCategories] = useState([]);
  const [irInvestigator, setIrInvestigator] = useState([]);
  const fromIncidentDateTime = watch("fromIncidentDateTime");
  const fromreportingDate = watch("fromreportingDate");
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/user`).then((res) => res.json()),
    ]).then(([category, users]) => {
      if (category._embedded?.category) {
        setCategories(
          category._embedded.category.map(({ id, name }) => ({
            value: id,
            label: name,
          }))
        );
      }
      if (users._embedded?.user) {
        setIrInvestigator(
          users._embedded.user
            .map((user) => ({
              ...user,
              role: user.role.split(",").filter((r) => r),
            }))
            .filter((user) => user.role.includes("irInvestigator"))
            .map((user) => ({ label: user.name, value: user.id }))
        );
      }
    });
  }, []);
  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
    reset({
      sequence: "",
      fromreportingDate: "",
      toreportingDate: "",
      fromIncidentDateTime: "",
      toIncidentDateTime: "",
      view: "all",
      ..._filters,
      typeofInci: _filters.typeofInci?.split(",").map((c) => +c) || "",
      irInvestigator: _filters.irInvestigator?.split(",").map((c) => +c) || "",
      status: _filters.status?.split(",").map((c) => +c) || "",
      InciCateg: _filters.InciCateg?.split(",").map((c) => +c) || "",
    });
  }, [location.search]);
  return (
    <form className={s.filters} onSubmit={handleSubmit(onSubmit)}>
      <Input label="IR Code" {...register("sequence")} />
      <Combobox
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
          label="IR Investigator"
          name="irInvestigator"
          setValue={setValue}
          watch={watch}
          register={register}
          options={irInvestigator}
          multiple={true}
        />
        <Combobox
          label="Status"
          name="status"
          setValue={setValue}
          watch={watch}
          register={register}
          multiple={true}
          options={irStatus.map((item) => ({
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
              {
                label: "Assigned IRs",
                value: "assignedToSelf",
              },
              ...(checkPermission({
                roleId: ["incidentReporter", "irInvestigator", "irManager"],
                permission: "Access to view IR's",
              }) || true
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
              {
                label: "My Department IRs",
                value: "department",
              },
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
              sequence: "",
              fromreportingDate: "",
              toreportingDate: "",
              fromIncidentDateTime: "",
              toIncidentDateTime: "",
              InciCateg: "",
              typeofInci: "",
              view: "all",
              irInvestigator: "",
              status: "",
            });
            navigate(location.pathname);
            onSubmit({});
          }}
        >
          Clear
        </button>
      </section>
    </form>
  );
};

const QualityDashboard = () => {
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ irInvestigator: user.id });
  const [assign, setAssign] = useState(null);
  useEffect(() => {
    const _filters = paramsToObject(new URLSearchParams(location.search));
    if (Object.entries(_filters).length) {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search/byDetails?${new URLSearchParams({
          ...filters,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        });
    } else {
      fetch(`${process.env.REACT_APP_HOST}/IncidentReport`)
        .then((res) => res.json())
        .then((data) => {
          if (data._embedded?.IncidentReport) {
            setIncidents(data._embedded.IncidentReport);
          }
        });
    }
  }, [location.search]);
  return (
    <div className={s.qualityDashboard}>
      <Filters
        onSubmit={(values) => {
          const _filters = {};
          for (var field in values) {
            if (values[field])
              _filters[field] = values[field]?.join?.(",") || values[field];
            if (values[field] === "assignedToSelf")
              _filters.irInvestigator = user.id;
          }
          delete _filters.view;
          navigate({
            pathname: location.pathname,
            search: `?${createSearchParams(_filters)}`,
          });
          // setFilters(_filters);
        }}
        qualityDashboard={true}
      />
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
                        label: "Review IR",
                        callBack: () => {},
                      },
                      ...(checkPermission({
                        roleId: ["irInvestigator", "irManager"],
                        permission: "Cancel IRs",
                      })
                        ? [
                            {
                              icon: <FaRegTrashAlt />,
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
                        icon: <FaRegTrashAlt />,
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
                        icon: <FaRegCheckSquare />,
                        label: "IR Approval",
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
                  icon: <FaRegTrashAlt />,
                  label: "CAPA",
                  callBack: () => {},
                },
                {
                  icon: <FaRegTrashAlt />,
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
            <BsFillCircleFill />
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
            <GoPerson />
          </span>{" "}
          Patient Complient
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
              <Moment format="DD/MM/YYYY hh:mma">
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
                <Moment format="hh:mma">{evt.dateTime}</Moment>
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
                ...(assign.irStatusDetails || []),
                {
                  userid: data.user,
                  dateTime: new Date().toISOString(),
                },
              ],
              actionTakens: undefined,
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
              console.log(err);
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
          options={users}
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
            Assign
          </button>
        </section>
      </form>
    </>
  );
};

export default () => (
  <IrDashboardContextProvider>
    <IncidentReportingDashboard />
  </IrDashboardContextProvider>
);
