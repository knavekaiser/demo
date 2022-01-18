import React, { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Routes, Route } from "react-router-dom";
import { FaInfoCircle, FaRegTrashAlt, FaPlus, FaRegEye } from "react-icons/fa";
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
  Tabs,
  Input,
  Combobox,
  Table,
  TableActions,
  Moment,
  Checkbox,
  moment,
} from "./elements";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
import paths from "./path";
import s from "./incidentReportingDashboard.module.scss";

const incidentType = [
  {
    label: "Unsafe condition",
    value: 1,
  },
  {
    label: "No Harm",
    value: 2,
  },
  {
    label: "Near Miss",
    value: 4,
  },
  {
    label: "Adverse Event",
    value: 7,
  },
  {
    label: "Sentinel Event",
    value: 0,
  },
];
function IncidentReportingDashboard() {
  return (
    <div className={s.container}>
      <header>
        <h3>INCIDENT REPORTING DASHBOARD</h3>
      </header>
      <Tabs
        tabs={[
          { label: "My Dashboard", path: paths.incidentDashboard.myDashboard },
          {
            label: "Quality Dashboard",
            path: paths.incidentDashboard.qualityDashboard,
          },
        ]}
      />
      <Routes>
        <Route
          path={paths.incidentDashboard.myDashboard + "/*"}
          element={<MyDashboard />}
        />
        <Route
          path={paths.incidentDashboard.qualityDashboard + "/*"}
          element={<QualityDashboard />}
        />
      </Routes>
    </div>
  );
}
const MyDashboard = () => {
  const { user } = useContext(SiteContext);
  const location = useLocation();
  const [parameters, setParameters] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  const [focus, setFocus] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/location`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
    ]).then(([location, category]) => {
      const _parameters = { ...parameters };
      if (location?._embedded.location) {
        _parameters.locations = location._embedded.location;
      }
      if (category?._embedded.category) {
        _parameters.categories = category._embedded.category;
      }
      setParameters(_parameters);
    });
    if (location.state?.focus) {
      setFocus(location.state.focus);
    }
  }, []);
  useEffect(() => {
    if (Object.entries(filters).length) {
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
  }, [filters]);
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
            if (values[field]) _filters[field] = values[field];
          }
          console.log(values);
          if (values.userId) {
            _filters.userId = user.id;
          }
          console.log(_filters);
          setFilters(_filters);
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
      >
        {incidents
          .sort((a, b) =>
            new Date(a.incident_Date_Time) > new Date(b.incident_Date_Time)
              ? -1
              : 1
          )
          .map((inc) => (
            <tr
              key={inc.id}
              className={focus === inc.id ? s.focus : ""}
              onClick={() => setFocus(inc.id)}
            >
              <td>{inc.sequence}</td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">{inc.reportingDate}</Moment>
              </td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">
                  {inc.incident_Date_Time}
                </Moment>
              </td>
              <td>
                {parameters?.locations.find((item) => item.id === inc.location)
                  ?.name || inc.location}
              </td>
              <td>
                {parameters?.categories.find(
                  (item) => item.id === inc.inciCateg
                )?.name || inc.inciCateg}
              </td>
              <td>
                {parameters?.categories
                  .find((item) => item.id === inc.inciCateg)
                  ?.subCategorys?.find((item) => item.id === inc.inciSubCat)
                  ?.name || inc.inciSubCat}
              </td>
              <td>
                {incidentType.find(({ value }) => value === inc.typeofInci)
                  ?.label || [inc.typeofInci]}
              </td>
              <td>{inc.reportedBy}</td>
              <td>{inc.irInvestigator}</td>
              <td>{inc.status}</td>
              <td>{inc.tat}</td>
              <TableActions
                actions={[
                  ...(inc.status === "Submitted"
                    ? [
                        {
                          icon: <FaRegEye />,
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
                      ]
                    : [
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
                      ]),
                ]}
              />
            </tr>
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
const Filters = ({ onSubmit, qualityDashboard }) => {
  const { handleSubmit, register, watch, reset, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [irInvestigator, setIrInvestigator] = useState([]);
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
    ]).then(([category]) => {
      if (category._embedded?.category) {
        setCategories(
          category._embedded.category.map(({ id, name }) => ({
            value: id,
            label: name,
          }))
        );
      }
    });
  }, []);
  return (
    <form className={s.filters} onSubmit={handleSubmit(onSubmit)}>
      <Input label="IR Code" {...register("sequence")} />
      <Combobox
        label="Category"
        name="InciCateg"
        setValue={setValue}
        watch={watch}
        register={register}
        options={categories}
      />
      <section className={s.pair}>
        <label>Incident Date Range</label>
        <Input
          type="date"
          placeholder="From"
          {...register("fromIncidentDateTime", {
            // validate: (v) =>
            //   new Date(v) < new Date() || "Can not select date from future",
          })}
          max={moment({ format: "YYYY-MM-DDThh:mm", time: new Date() })}
        />
        <Input
          type="date"
          placeholder="To"
          {...register("toIncidentDateTime", {
            // validate: (v) =>
            //   new Date(v) < new Date() || "Can not select date from future",
          })}
        />
      </section>
      <section className={s.pair}>
        <label>Reporting Date Range</label>
        <Input
          type="date"
          placeholder="From"
          {...register("fromreportingDate")}
        />
        <Input type="date" placeholder="To" {...register("toreportingDate")} />
      </section>
      <Combobox
        label="Incident Type"
        name="incidentType"
        setValue={setValue}
        watch={watch}
        register={register}
        options={incidentType}
      />
      <section className={s.pair}>
        <Combobox
          label="IR Investigator"
          name="irInvestigator"
          setValue={setValue}
          watch={watch}
          register={register}
          options={irInvestigator.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
        />
        <Combobox
          label="Status"
          name="status"
          setValue={setValue}
          watch={watch}
          register={register}
          options={[
            { label: "Saved", value: "Saved" },
            { label: "Submitted", value: "Submitted" },
          ]}
        />
      </section>
      {!qualityDashboard && (
        <section className={`${s.pair} ${s.checkboxes}`}>
          <section>
            <Checkbox label="My IRs" {...register("userId")} />
          </section>
          <section>
            <Checkbox label="My Department IRs" {...register("myDept")} />
          </section>
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
            reset();
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
  const { user } = useContext(SiteContext);
  const [parameters, setParameters] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/location`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
    ])
      .then(([location, category]) => {
        const _parameters = { ...parameters };
        if (location?._embedded.location) {
          _parameters.locations = location._embedded.location;
        }
        if (category?._embedded.category) {
          _parameters.categories = category._embedded.category;
        }
        setParameters(_parameters);
        return fetch(
          `${process.env.REACT_APP_HOST}/IncidentReport`
        ).then((res) => res.json());
      })
      .then((data) => {
        if (data._embedded?.IncidentReport) {
          setIncidents(data._embedded.IncidentReport);
        }
      });
  }, []);
  useEffect(() => {
    if (Object.entries(filters).length) {
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
  }, [filters]);
  return (
    <div className={s.qualityDashboard}>
      <Filters
        onSubmit={(values) => {
          const _filters = {};
          for (var field in values) {
            if (values[field]) _filters[field] = values[field];
          }
          console.log(values);
          if (values.userId) {
            _filters.userId = user.id;
          }
          console.log(_filters);
          setFilters(_filters);
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
      >
        {incidents
          .sort((a, b) =>
            new Date(a.incident_Date_Time) > new Date(b.incident_Date_Time)
              ? -1
              : 1
          )
          .map((inc) => (
            <tr key={inc.id}>
              <td>{inc.sequence}</td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">{inc.reportingDate}</Moment>
              </td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">
                  {inc.incident_Date_Time}
                </Moment>
              </td>
              <td>
                {parameters?.locations.find((item) => item.id === inc.location)
                  ?.name || inc.location}
              </td>
              <td>
                {parameters?.categories.find(
                  (item) => item.id === inc.inciCateg
                )?.name || inc.inciCateg}
              </td>
              <td>
                {parameters?.categories
                  .find((item) => item.id === inc.inciCateg)
                  ?.subCategorys?.find((item) => item.id === inc.inciSubCat)
                  ?.name || inc.inciSubCat}
              </td>
              <td>
                {incidentType.find(({ value }) => value === inc.typeofInci)
                  ?.label || [inc.typeofInci]}
              </td>
              <td>{inc.reportedBy}</td>
              <td>{inc.irInvestigator}</td>
              <td>{inc.status}</td>
              <td>{inc.tat}</td>
              <TableActions
                actions={[
                  ...(inc.status === "Submitted"
                    ? [
                        {
                          icon: <BsPencilFill />,
                          label: "Review IR",
                          callBack: () => {},
                        },
                        {
                          icon: <FaRegTrashAlt />,
                          label: "Assign IR",
                          callBack: () => {},
                        },
                        {
                          icon: <FaRegTrashAlt />,
                          label: "Cancel IR",
                          callBack: () => {},
                        },
                        {
                          icon: <FaRegTrashAlt />,
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
                  {
                    icon: <FaRegTrashAlt />,
                    label: "IR Approval",
                    callBack: () => {},
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "IR Combine",
                    callBack: () => {},
                  },
                  {
                    icon: <FaRegTrashAlt />,
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
              />
            </tr>
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

export default IncidentReportingDashboard;
