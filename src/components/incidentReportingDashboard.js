import React, { useState, useEffect } from "react";
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
import { Tabs, Input, Combobox, Table, TableActions, Moment } from "./elements";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "./modal";
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
          { label: "My Dashboard", path: "my-dashboard" },
          { label: "Quality Dashboard", path: "quality-dashboard" },
        ]}
      />
      <Routes>
        <Route path="my-dashboard/*" element={<MyDashboard />} />
        <Route path="quality-dashboard/*" element={<QualityDashboard />} />
      </Routes>
    </div>
  );
}
const MyDashboard = ({}) => {
  const [parameters, setParameters] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({});
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
  }, []);
  useEffect(() => {
    if (Object.entries(filters).length) {
      fetch(
        `${
          process.env.REACT_APP_HOST
        }/IncidentReport/search?${new URLSearchParams({
          ...filters,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          // if (data._embedded?.IncidentReport) {
          //   setIncidents(data._embedded.IncidentReport);
          // }
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
          console.log(values);
          setFilters(values);
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
        {incidents.map((inc) => (
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
              {parameters?.categories.find((item) => item.id === inc.inciCateg)
                ?.name || inc.inciCateg}
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
                          navigate("/incident-report", {
                            state: { edit: inc, readOnly: true },
                          });
                        },
                      },
                    ]
                  : [
                      {
                        icon: <BsPencilFill />,
                        label: "Edit",
                        callBack: () => {
                          navigate("/incident-report", {
                            state: { edit: inc },
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
const Filters = ({ onSubmit }) => {
  const { handleSubmit, register, watch, reset, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [irInvestigator, setIrInvestigator] = useState([
    { id: "Saved", name: "Saved" },
    { id: "Submitted", name: "Submitted" },
  ]);
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
        name="category"
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
          {...register("inciDate_from", {
            // validate: (v) =>
            //   new Date(v) < new Date() || "Can not select date from future",
          })}
        />
        <Input
          type="date"
          placeholder="To"
          {...register("inciDate_to", {
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
          {...register("reportDate_from")}
        />
        <Input type="date" placeholder="To" {...register("reportDate_to")} />
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
            { value: "open", label: "Open" },
            { value: "close", label: "Close" },
          ]}
        />
      </section>
      <section className={`${s.pair} ${s.checkboxes}`}>
        <section>
          <input type="checkbox" id="my-irs" name="my-irs" />
          <label htmlFor="my-irs">My IRs</label>
        </section>
        <section>
          <input type="checkbox" id="my-dep-irs" name="my-dep-irs" />
          <label htmlFor="my-dep-irs">My Department IRs</label>
        </section>
      </section>
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

const QualityDashboard = ({}) => {
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
  return (
    <div className={s.qualityDashboard}>
      <Filters onSubmit={(values) => setFilters(values)} />
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
        {incidents.map((inc) => (
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
              {parameters?.categories.find((item) => item.id === inc.inciCateg)
                ?.name || inc.inciCateg}
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
                {
                  icon: <BsPencilFill />,
                  label: "Review IR",
                  callBack: () => {},
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Reportable Incident",
                  callBack: () => {},
                },
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
                  label: "Assign IR",
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
                {
                  icon: <FaRegTrashAlt />,
                  label: "Cancel IR",
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
