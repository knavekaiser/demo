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
  TableActions,
  Moment,
  moment,
  Textarea,
  FileInput,
  uploadFiles,
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

function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

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

  const { get: searchIrs, loading } = useFetch(defaultEndpoints.irQuerySearch, {
    validator: { irCode: /^.+$/gi },
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
    if (_filters.fromQueryDateTime) {
      _filters.fromQueryDateTime = _filters.fromQueryDateTime + " 00:00:00";
    }
    if (_filters.toQueryDateTime) {
      _filters.toQueryDateTime = _filters.toQueryDateTime + " 23:59:59";
    }

    _filters.userId = user.id;

    searchIrs(null, { query: _filters })
      .then(({ data }) => {
        setIncidents(
          data.map((ir) => ({ ...ir, response: ir.responseIrInput }))
        );
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [location.search]);
  return (
    <>
      <header>
        <h3>IR QUERY DASHBOARD</h3>
      </header>
      <div key="myDashboard" className={`${s.myDashboard} ${s.queryDashboard}`}>
        <div className={s.reportCounts}>
          <ReportCount
            className="open"
            label="OPEN IRS"
            irs={[
              { label: "My IRs", count: count.myIr },
              ...((checkPermission({ roleId: 9 }) && [
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
          className={s.irQueries}
          columns={[
            { label: "IR Code" },
            { label: "Reporting Date & Time" },
            { label: "Incident Date & Time" },
            { label: "Incident Location" },
            { label: "Category" },
            { label: "Subcategory" },
            { label: "Query raised by" },
            { label: "Query Date Time" },
            { label: "Actions" },
          ]}
          actions
          loading={loading}
        >
          {incidents
            .sort((a, b) =>
              new Date(a.queryDateTime) > new Date(b.queryDateTime) ? -1 : 1
            )
            .map((inc, i) => (
              <SingleIr
                focus={focus}
                setFocus={setFocus}
                key={i}
                ir={inc}
                parameters={parameters}
                setIncidents={setIncidents}
              />
            ))}
        </Table>
      </div>
    </>
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
  ({ ir, focus, setFocus, className, parameters, setIncidents }) => {
    const [showResForm, setShowResForm] = useState(false);
    return (
      <>
        <tr
          className={`${ir.typeofInci === 8 ? s.sentinel : ""} ${
            focus === ir.id ? s.focus : ""
          } ${className || ""}`}
          // onClick={() => {
          //   setFocus && setFocus(ir.id);
          // }}
        >
          <td className={s.sequence}>{ir.sequence}</td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ir.reportingDate}</Moment>
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ir.incident_Date_Time}</Moment>
          </td>
          <td>
            {parameters?.locations?.find(
              (item) => item.id?.toString() === ir.location?.toString()
            )?.name || ir.location}
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
            {parameters?.users?.find(({ value }) => value === ir.queryRaisedBy)
              ?.label || ir.queryRaisedBy}
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ir.queryDateTime}</Moment>
          </td>
          <TableActions
            actions={[
              {
                icon: <FaExternalLinkAlt />,
                label: "Response",
                callBack: () => setShowResForm(true),
              },
            ]}
          />
        </tr>
        <Modal
          open={showResForm}
          setOpen={setShowResForm}
          head={true}
          label="SUBMIT IR INPUT"
          className={s.responseForm}
        >
          <ResponseForm
            ir={ir}
            parameters={parameters}
            setShowResForm={setShowResForm}
            onSuccess={(newRes) => {
              setIncidents((prev) =>
                prev.map((ir) =>
                  ir.reqInputId === newRes.reqId
                    ? {
                        ...ir,
                        response: newRes,
                      }
                    : ir
                )
              );
              setShowResForm(false);
            }}
          />
        </Modal>
      </>
    );
  }
);
const ResponseForm = ({ ir, parameters, setShowResForm, onSuccess }) => {
  const { user } = useContext(SiteContext);
  const { irTypes } = useContext(SiteContext);
  const { tatConfig } = useContext(IrDashboardContext);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      responseBy: user.id,
      responseOn: new Date(),
      deptId: user.department,
      response: ir.response?.response || "",
    },
  });
  const uploads = watch("upload");

  const { post: saveResponse } = useFetch(defaultEndpoints.responseInputs, {
    validator: { upload: /^.+$/gi },
  });
  const { post: upload, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );
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
      <p className={s.queryBy}>
        <strong>Query Raised by</strong> -{" "}
        {parameters?.users?.find(({ value }) => value === ir.queryRaisedBy)
          ?.label || ir.queryRaisedBy}{" "}
        on <Moment format="DD/MM/YYYY">{ir.queryDateTime}</Moment> at{" "}
        <Moment format="hh:mm">{ir.queryDateTime}</Moment>
      </p>
      <form
        onSubmit={handleSubmit(async (values) => {
          if (values.upload?.filter((item) => !item.uploadFilePath).length) {
            const { links, error: uploadError } = await uploadFiles({
              files: values.upload,
              uploadFiles: upload,
            });
            if (uploadError) {
              return Prompt({ type: "error", message: uploadError.message });
            }

            values.upload = links[0].uri;
            values.fileName = links[0].name;
          } else if (values.upload?.length) {
            const _file = values.upload[0];
            values.fileName = _file.fileName;
            values.upload = _file.uploadFilePath;
          } else {
            values.upload = "";
            values.fileName = "";
          }

          saveResponse({
            ...values,
            reqId: ir.reqInputId,
            incidentReport: { id: ir.id },
          })
            .then(({ data }) => {
              if (data?.id) {
                Prompt({
                  type: "success",
                  message: "Response submitted successfully.",
                });
                return onSuccess(data);
              }
              Prompt({
                type: "error",
                message: data.message,
              });
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        })}
      >
        <div className={s.innerWrapper}>
          <p>{ir.query}</p>
          <p>Please provide inputs on this incident.</p>
          <Textarea
            className={s.response}
            {...register("response", { required: "Please provide a response" })}
            label="Response"
            error={errors.response}
            readOnly={ir?.response}
          />
          <FileInput
            label="Upload"
            prefill={uploads}
            onChange={(files) => setValue("upload", files)}
          />
          <section className={s.pair}>
            <Input label="Response by" value={user.name || ""} readOnly />
            <Input
              label="Response On"
              value={
                moment({ format: "DD-MM-YYYY hh:mm", time: new Date() }) || ""
              }
              readOnly
            />
          </section>
        </div>
        <section className={s.btns}>
          <button
            type="button"
            className={`btn secondary wd-100`}
            onClick={() => setShowResForm(false)}
          >
            Close
          </button>
          {!ir.response && (
            <button className={`btn primary wd-100`}>Submit</button>
          )}
        </section>
      </form>
    </div>
  );
};
const Filters = ({ onSubmit, qualityDashboard }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPermission, irTypes } = useContext(SiteContext);
  const { parameters } = useContext(IrDashboardContext);
  const defaultView = user?.role?.includes?.(7) ? "all" : "assigned";
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    getValues,
    control,
  } = useForm({
    defaultValues: {
      status: "",
    },
  });
  const [categories, setCategories] = useState([]);
  const fromIncidentDateTime = watch("fromIncidentDateTime");
  const fromQueryDateTime = watch("fromQueryDateTime");
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
      irCode: "",
      fromQueryDateTime: "",
      toQueryDateTime: "",
      fromIncidentDateTime: "",
      toIncidentDateTime: "",
      ..._filters,
      queryRaisedBy: _filters.queryRaisedBy?.split(",").map((c) => +c) || "",
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
      <Input label="IR Code" {...register("irCode")} />
      <section className={s.pair}>
        <label>Qurey Date Range</label>
        <Input
          type="date"
          placeholder="From"
          {...register("fromQueryDateTime")}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
        <Input
          type="date"
          placeholder="To"
          {...register("toQueryDateTime")}
          min={moment({
            format: "YYYY-MM-DD",
            time: new Date(fromQueryDateTime),
          })}
          max={moment({ format: "YYYY-MM-DD", time: new Date() })}
        />
      </section>
      <section className={s.pair}>
        <label>IR Date Range</label>
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
      <Select
        label="Query Raised by"
        options={parameters.users}
        name="queryRaisedBy"
        control={control}
      />
      <section className={s.btns}>
        <button className="btn secondary">
          <BiSearch /> Search
        </button>
        <button
          type="button"
          className={`btn clear ${s.clear}`}
          onClick={() => {
            reset();
            navigate({
              pathname: location?.pathname,
            });
            onSubmit({});
          }}
        >
          Clear
        </button>
      </section>
    </form>
  );
};

export default IrDashboard;
