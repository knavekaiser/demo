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
  FaPlusSquare,
  FaMinusSquare,
} from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { WiTime9 } from "react-icons/wi";
import { BsPencilFill, BsFillExclamationTriangleFill } from "react-icons/bs";
import { FiCheckSquare } from "react-icons/fi";
import {
  Checkbox,
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
import s from "./irDashboard.module.scss";
import { useFetch } from "../hooks";
import { countDays } from "../helpers";

function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function CapaDashboard() {
  const { user, checkPermission } = useContext(SiteContext);
  // const location = useLocation();
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (
  //     new RegExp(`${paths.capaDashboard.basePath}/?$`).test(location.pathname)
  //   ) {
  //     navigate(paths.capaDashboard.myDashboard);
  //   }
  // }, []);
  return (
    <div className={s.container}>
      <MyDashboard />
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

  const { get: searchIrs, loading } = useFetch(defaultEndpoints.searchIrs, {
    validator: { sequence: /^.+$/gi },
  });
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
          // {
          //   icon: <FaRegTrashAlt />,
          //   label: "Delete",
          //   callBack: () => {
          //     Prompt({
          //       type: "confirmation",
          //       message: `Are you sure you want to remove this incident?`,
          //       callback: () => {
          //         deleteIr(null, {
          //           params: { "{ID}": inc.id },
          //         }).then(({ res }) => {
          //           if (res.status === 204) {
          //             setIncidents((prev) =>
          //               prev.filter((ir) => ir.id !== inc.id)
          //             );
          //           }
          //         });
          //       },
          //     });
          //   },
          // },
          ...((checkPermission({ roleId: [4, 7], permission: [89, 91] }) && [
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
            label: (
              <>
                Review IR{" "}
                {inc.irHodAck?.length > 0 && (
                  <FaFlag style={{ color: "rgb(21, 164, 40)" }} />
                )}
                <FiCheckSquare />
              </>
            ),
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
    ...((checkPermission({ roleId: 9, permission: 47 }) &&
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

    if (_filters.irBy !== "department") {
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
            setIncidents([
              {
                id: 2,
                actionPlans: [
                  {
                    id: 1,
                    action: "This are some actions",
                    responsibility: "Thomas",
                    status: "Accepted",
                    deadline: "2022-02-16T16:18:00.000+05:30",
                  },
                  {
                    id: 2,
                    action: "This are some more actions",
                    responsibility: "Ameem",
                    status: "Accepted",
                    deadline: "2022-02-16T16:18:00.000+05:30",
                  },
                ],
                sequence: "040 /07/2022 NAP H",
                status: "11",
                department: "1",
                userDept: "",
                userId: 15,
                irInvestigator: null,
                capturedBy: null,
                reportingDate: "2022-02-16T16:18:57.563+05:30",
                irStatusDetails: [
                  {
                    id: 22896,
                    status: 11,
                    dateTime: "2022-06-22T13:13:09.597+05:30",
                    userid: 15,
                  },
                  {
                    id: 2,
                    status: 2,
                    dateTime: "2022-02-16T16:21:37.889+05:30",
                    userid: 15,
                  },
                ],
                templateData: [],
                irHodAck: [],
                reqInput: [],
                recordInput: [],
                responseIrInput: [],
                irInvestigation: [],
                location: 1,
                incident_Date_Time: "2022-02-10T04:17:00.000+05:30",
                locationDetailsEntry: "first room",
                patientYesOrNo: null,
                patientname: "",
                complaIntegerDatetime: null,
                complaIntegerIdEntry: null,
                typeofInci: 4,
                inciCateg: 1,
                inciSubCat: 1,
                template: null,
                personAffected: null,
                inciDescription: "dvfsdfsdf",
                deptsLookupMultiselect: "102",
                contribFactorYesOrNo: null,
                preventability: 1,
                incidentReportedDept: null,
                headofDepart: null,
                contribFactor: null,
              },
            ]);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      searchIrs(null, {
        query: { userId: user.id },
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
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [location.search]);
  return (
    <div key="myDashboard" className={s.capaDashboard}>
      <header>
        <h3>CAPA DASHBOARD</h3>
      </header>
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
      <div className={s.report}>
        Records Display: <strong>{incidents?.length}</strong>
      </div>
      <Table
        columns={[
          { label: "" },
          { label: "IR Code" },
          { label: "Reporting Date & Time" },
          { label: "Incident Date & Time" },
          { label: "Incident Location" },
          // { label: "Category" },
          // { label: "Subcategory" },
          // { label: "Incident Type" },
          // { label: "Reported / Captured by" },
          { label: "IR Investigator" },
          { label: "CAPA Monitoring" },
          // { label: "Status" },
          // { label: "TAT" },
          { label: "Actions" },
        ]}
        className={s.irs}
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
              key={inc.id}
              ir={inc}
              actions={getActions(inc)}
              parameters={parameters}
            />
          ))}
      </Table>
      <div className={s.legend}>
        <span>
          <span className={s.icon} style={{ color: "rgb(230, 163, 16)" }}>
            <WiTime9 />
          </span>{" "}
          Deadline Crossed
        </span>
      </div>
    </div>
  );
};
const SingleIr = memo(
  ({ ir, focus, setFocus, className, actions, parameters, styles }) => {
    const { tatConfig } = useContext(IrDashboardContext);
    const { irTypes } = useContext(SiteContext);
    const [showPlans, setShowPlans] = useState(false);
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
          countDays(
            startDate,
            endDate,
            (tatConfig &&
              (ir.typeofInci === 8
                ? tatConfig.sentinelExcludeWeek
                : tatConfig.excludeWeek)) ||
              []
          )
        );
      }
    }, [timeline]);
    return (
      <tr
        className={`${ir.typeofInci === 8 ? s.sentinel : ""} ${
          focus === ir.id ? s.focus : ""
        } ${className || ""}`}
        style={styles || {}}
      >
        <td>
          <button
            className={`btn clear ${s.expandBtn}`}
            onClick={() => setShowPlans(!showPlans)}
          >
            {showPlans ? <FaMinusSquare /> : <FaPlusSquare />}
          </button>
        </td>
        <td className={s.irCode}>
          <span className={s.icons}>
            {ir.typeofInci === 8
              ? totalTat > tatConfig.acceptableTatSentinel && (
                  <span
                    className={s.icon}
                    style={{ color: "rgb(230, 163, 16)", fontSize: "1.15em" }}
                  >
                    <WiTime9 />
                  </span>
                )
              : totalTat > tatConfig.acceptableTAT && (
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
          {parameters?.investigators?.find(
            ({ value }) => value === ir.irInvestigator
          )?.label || ir.irInvestigator}
        </td>
        <td className={s.capa}>{ir.irInvestigators}</td>
        {actions && <TableActions actions={actions} />}
        {showPlans && (
          <td className={s.actionPlans}>
            <Table
              columns={[
                { label: "Action Plan" },
                { label: "Deadline" },
                { label: "Action Responsibility" },
                { label: "CAPA Status" },
                { label: "Actions" },
              ]}
            >
              {ir.actionPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.action}</td>
                  <td>
                    <Moment format="DD/MM/YYYY">{plan.deadline}</Moment>
                  </td>
                  <td>{plan.responsibility}</td>
                  <td>{plan.status}</td>
                  <TableActions actions={actions} />
                </tr>
              ))}
            </Table>
          </td>
        )}
      </tr>
    );
  }
);
const Filters = ({ onSubmit, qualityDashboard }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPermission, irTypes } = useContext(SiteContext);
  const { parameters, irConfig } = useContext(IrDashboardContext);
  const defaultView = user?.role?.includes?.(7) ? "all" : "assigned";
  const { handleSubmit, register, watch, reset, setValue, getValues } = useForm(
    {
      defaultValues: {
        irBy: "self",
        status: "",
        view: user?.role?.includes?.(7) ? "all" : "assigned",
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
      <section className={s.pair}>
        <label>IR Reporting Date</label>
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
        <label>Action Deadline Date</label>
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
        label="Action Responsibility"
        name="InciCateg"
        setValue={setValue}
        watch={watch}
        multiple={true}
        register={register}
        options={categories}
      />
      <Combobox
        placeholder="All"
        label="CAPA Status"
        name="InciCateg"
        setValue={setValue}
        watch={watch}
        multiple={true}
        register={register}
        options={categories}
      />
      <Combobox
        placeholder="All"
        label="CAPA Monitoring"
        name="typeofInci"
        setValue={setValue}
        watch={watch}
        multiple={true}
        register={register}
        options={irTypes}
      />
      <section className={`${s.pair} ${s.checkboxes}`}>
        <Checkbox
          {...register("assignedIr")}
          name="view"
          label="Assigned IRs"
        />
        <Checkbox
          {...register("capaResponsibility")}
          name="view"
          label="CAPA Responsibility"
        />
      </section>
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

export default CapaDashboard;
