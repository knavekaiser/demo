import React, { useState, useEffect, useContext, memo } from "react";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import {
  FaExternalLinkAlt,
  FaPlusSquare,
  FaMinusSquare,
  FaHeartbeat,
} from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { WiTime9 } from "react-icons/wi";
import {
  Checkbox,
  Input,
  DateInput,
  Combobox,
  Table,
  TableActions,
  Moment,
  moment,
  Tabs,
  Textarea,
  FileInput,
} from "./elements";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
import { endpoints as defaultEndpoints } from "../config";
import s from "./irDashboard.module.scss";
import { useFetch } from "../hooks";

const Data = ({ label, value }) => {
  return (
    <section className={s.data}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </section>
  );
};

function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

function CapaDashboard() {
  return (
    <div className={s.container}>
      <MyDashboard />
    </div>
  );
}
export const MyDashboard = () => {
  const { user, checkPermission } = useContext(SiteContext);
  const { parameters, count, dashboard, setDashboard, irConfig } =
    useContext(IrDashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  const [focus, setFocus] = useState(null);

  const { get: searchIrs, loading } = useFetch(defaultEndpoints.searchIrs, {
    validator: { sequence: /^.+$/gi },
  });

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
              {
                id: 21,
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
                sequence: "050 /07/2022 NAP H",
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
const SingleIr = memo(({ ir, focus, className, parameters, styles }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [capaAction, setCapaAction] = useState(false);
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
          <span
            className={s.icon}
            style={{ color: "rgb(230, 163, 16)", fontSize: "1.15em" }}
          >
            <WiTime9 />
          </span>
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
        {parameters?.locations?.find((item) => item.id === ir.location)?.name ||
          ir.location}
      </td>
      <td>
        {parameters?.investigators?.find(
          ({ value }) => value === ir.irInvestigator
        )?.label || ir.irInvestigator}
      </td>
      <td className={s.capa}>{ir.irInvestigators}</td>
      <td />

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
                <TableActions
                  actions={[
                    {
                      icon: <FaExternalLinkAlt />,
                      label: "View IR",
                      callBack: () => {
                        setCapaAction(true);
                      },
                    },
                    {
                      icon: <FaHeartbeat />,
                      label: "CAPA Monitoring",
                      callBack: () => {},
                    },
                  ]}
                />
                {
                  //   <Modal
                  //   head
                  //   label="CAPA MONITORING"
                  //   open={showCapaMonitoring}
                  //   setOpen={setShowCapaMonitoring}
                  //   className={s.capaMonitoringModal}
                  // >
                  //   <CapaMonitoringModal
                  //     ir={ir}
                  //     plan={plan}
                  //     parameters={parameters}
                  //   />
                  // </Modal>
                }
              </tr>
            ))}
          </Table>
        </td>
      )}

      {capaAction && (
        <CapaAction
          parameters={parameters}
          ir={ir}
          open={capaAction}
          setOpen={setCapaAction}
          onSubmit={(data) => {
            // handle data
          }}
        />
      )}
    </tr>
  );
});
const CapaAction = ({ ir, open, setOpen, parameters }) => {
  const { irTypes } = useContext(SiteContext);
  const [tab, setTab] = useState("info");
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const uploads = watch("upload");
  return (
    <Modal
      open={open}
      head
      label="CAPA ACTIONS"
      className={s.capaActions}
      setOpen={setOpen}
    >
      <div className={s.content}>
        <Tabs
          activeTab={tab}
          tabs={[
            { label: "CAPA INFO", value: "info" },
            { label: "HISOTRY OF COMMENTS", value: "comments" },
          ]}
          onChange={(tab) => setTab(tab.value)}
          secondary
        />

        {tab === "info" && (
          <>
            <div className={s.summary}>
              <Data label="IR Code" value={ir?.sequence} />
              <Data
                label="Incident Date & Time"
                value={moment({
                  time: ir?.incident_Date_Time,
                  format: "DD/MM/YYYY hh:mm",
                })}
              />
              <Data
                label="Incident Type"
                value={
                  irTypes?.find(
                    (item) => item.id?.toString() === ir?.typeofInci?.toString()
                  )?.label || ir?.typeofInci
                }
              />
              <Data
                label="Category"
                value={
                  parameters?.categories?.find(
                    (item) => item.id?.toString() === ir?.inciCateg?.toString()
                  )?.name || ir?.inciCateg
                }
              />
              <Data
                label="Location"
                value={
                  parameters?.locations?.find(
                    (item) => item.id?.toString() === ir?.location?.toString()
                  )?.label || ir?.location
                }
              />
              <Data
                label="Sub Category"
                value={
                  parameters?.categories
                    ?.find(
                      (item) =>
                        item.id?.toString() === ir?.inciCateg?.toString()
                    )
                    ?.subCategorys?.find(
                      (item) =>
                        item.id?.toString() === ir?.inciSubCat?.toString()
                    )?.name || ir?.inciSubCat
                }
              />
            </div>

            <div className={s.actionPlan}>
              <label>Action Plan</label>
              <p className={s.plan}>
                <strong>Counsel lab safety office</strong> - Counseling is to be
                done to ensure safety team is informed for any outsourced work
                being done.
              </p>
              <p className={s.deadline}>
                Deadline -{" "}
                <span>
                  <Moment format={"DD/MM/YYYY"}>{new Date()}</Moment>
                </span>
              </p>
            </div>

            <form
              onSubmit={handleSubmit((values) => {
                ///
              })}
            >
              <section className={s.status}>
                <Checkbox label="Acknowledge" {...register("acknowledge")} />
                <Checkbox label="Deligate" {...register("deligate")} />
              </section>
              <Textarea
                label="Comments / Reason for rejection"
                {...register("comment")}
              />
              <FileInput
                label="Upload"
                prefill={uploads}
                onChange={(files) => {
                  setValue("upload", files);
                }}
              />
              <div className={`${s.btns} flex`}>
                <button
                  type="button"
                  className="btn wd-100 ghost"
                  onClick={() => reset()}
                >
                  Clear
                </button>
                <button type="submit" className="btn wd-100">
                  Submit
                </button>
                <button type="button" className="btn wd-100 secondary">
                  Deligate
                </button>
              </div>
            </form>
          </>
        )}

        {tab === "comments" && (
          <>
            <div className={s.comments}>
              {[
                {
                  id: 1,
                  user: 15,
                  comment: "This is the first comment",
                  dateTime: "2022-11-05T09:18:55.631Z",
                },
                {
                  id: 2,
                  user: 17,
                  comment: "This is the second comment",
                  dateTime: "2022-12-05T09:12:10.631Z",
                },
                {
                  id: 3,
                  user: 20,
                  comment: "This is the third comment",
                  dateTime: "2022-10-05T09:04:19.631Z",
                },
              ]
                .sort((a, b) =>
                  new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1
                )
                .map((comment, i) => (
                  <div key={comment.id} className={i === 0 ? s.latest : ""}>
                    <span className={s.ball} />
                    <p>
                      Commented by -{" "}
                      <span className={s.user}>
                        {parameters.users?.find(
                          (user) =>
                            user.value?.toString() === comment.user.toString()
                        )?.label || comment.user}
                      </span>{" "}
                      on{" "}
                      <Moment format="DD/MM/YYYY hh:mm">
                        {comment.dateTime}
                      </Moment>
                    </p>
                    <p className={s.comment}>{comment.comment}</p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
const Filters = ({ onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, irTypes } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const defaultView = user?.role?.includes?.(7) ? "all" : "assigned";
  const { control, handleSubmit, register, watch, reset, setValue, getValues } =
    useForm({
      defaultValues: {
        irBy: "self",
        status: "",
        view: user?.role?.includes?.(7) ? "all" : "assigned",
      },
    });
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
      // status: _filters.status?.split(",").map((c) => +c) || "",
    });
  }, [location.search]);
  return (
    <form className={s.filters} onSubmit={handleSubmit(onSubmit)}>
      <Input label="IR Code" {...register("sequence")} />
      <section className={s.pair}>
        <label>IR Reporting Date</label>
        <DateInput
          control={control}
          name="fromIncidentDateTime"
          placeholder="From"
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
        <DateInput
          control={control}
          name="toIncidentDateTime"
          placeholder="To"
          min={moment({
            format: "YYYY-MM-DD",
            time: new Date(fromIncidentDateTime),
          })}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
      </section>
      <section className={s.pair}>
        <label>Action Deadline Date</label>
        <DateInput
          control={control}
          name="fromreportingDate"
          placeholder="From"
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
        <DateInput
          placeholder="To"
          control={control}
          name="toreportingDate"
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
