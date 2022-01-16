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
import { useForm } from "react-hook-form";
import s from "./incidentReportingDashboard.module.scss";

const incidentType = [
  undefined,
  "Unsafe condition",
  "No Harm",
  "Near Miss",
  "Adverse Event",
  "Sentinel Event",
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
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
    {
      id: 2,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
    {
      id: 3,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
  ]);
  const [filters, setFilters] = useState({});
  console.log(incidents);
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
            <td>{incidentType[inc.typeofInci]}</td>
            <td>{inc.reportedBy}</td>
            <td>{inc.irInvestigator}</td>
            <td>{inc.status}</td>
            <td>{inc.tat}</td>
            <TableActions
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "Review IR",
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
  const [categories, setCategories] = useState([
    { id: 1, name: "cat 1" },
    { id: 2, name: "cat 2" },
    { id: 3, name: "cat 2" },
  ]);
  const [incidentType, setIncidentType] = useState([
    { id: 1, name: "cat 1" },
    { id: 2, name: "cat 2" },
    { id: 3, name: "cat 2" },
  ]);
  const [irInvestigator, setIrInvestigator] = useState([
    { id: 1, name: "cat 1" },
    { id: 2, name: "cat 2" },
    { id: 3, name: "cat 2" },
  ]);
  return (
    <form className={s.filters} onSubmit={handleSubmit(onSubmit)}>
      <Input label="IR Code" {...register("incidentCode")} />
      <Combobox
        label="Category"
        name="category"
        setValue={setValue}
        watch={watch}
        register={register}
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
      />
      <section className={s.pair}>
        <label>Incident Date Range</label>
        <Input type="date" placeholder="From" {...register("inciDate_from")} />
        <Input type="date" placeholder="To" {...register("inciDate_to")} />
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
        options={incidentType.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }))}
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
        <button type="button" className={`btn clear ${s.clear}`}>
          Clear
        </button>
      </section>
    </form>
  );
};

const QualityDashboard = ({}) => {
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
    {
      id: 2,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
    {
      id: 3,
      code: "40",
      reportedAt: "2021-12-21T15:56:09.153Z",
      incidentTime: "2021-12-21T15:56:09.153",
      location: "OT",
      category: "My Dashboard",
      subCategory: "My Subdashboard",
      incidentType: "Sentinel",
      reportedBy: "John goodman",
      irInvestigator: "Mike",
      status: "Open",
      tat: "5",
    },
  ]);
  const [filters, setFilters] = useState({});
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
            <td>{inc.code}</td>
            <td>
              <Moment format="DD/MM/YYYY hh:mm">{inc.reportedAt}</Moment>
            </td>
            <td>
              <Moment format="DD/MM/YYYY hh:mm">{inc.incidentTime}</Moment>
            </td>
            <td>{inc.location}</td>
            <td>{inc.category}</td>
            <td>{inc.subCategory}</td>
            <td>{inc.incidentType}</td>
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
