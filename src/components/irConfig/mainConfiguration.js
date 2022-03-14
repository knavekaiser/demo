import { useState, useEffect, useRef } from "react";
import {
  FaInfoCircle,
  FaPlus,
  FaRegTrashAlt,
  FaUndo,
  FaPlayCircle,
  FaStopCircle,
  FaCheck,
} from "react-icons/fa";
import { Routes, Route } from "react-router-dom";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  Input,
  MobileNumberInput,
  CustomRadio,
  Combobox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { Modal, Prompt } from "../modal";
import { useForm } from "react-hook-form";
import paths from "../path";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./config.module.scss";

const IrScreen = () => {
  const [screens, setScreens] = useState([
    {
      option: "Location one",
      status: true,
      rules: "2021-12-21T15:56:09.153Z",
    },
    {
      option: "Location two",
      status: true,
      rules: null,
    },
    {
      option: "Location two",
      status: false,
      rules: "2021-12-21T15:56:09.153Z",
    },
    { option: "Location two", status: true, rules: "2021-12-21T15:56:09.153Z" },
  ]);
  return (
    <Box label="INCIDENT REPORTING SCREEN" collapsable={true}>
      <Table
        className={s.reportScreen}
        columns={[
          { label: "Option" },
          { label: "Enable/Disable" },
          { label: "Rules" },
        ]}
      >
        {screens.map((scr, i) => (
          <tr key={i}>
            <td>{scr.option}</td>
            <td>
              <Toggle readOnly={true} defaultValues={scr.status} />
            </td>
            <td>{scr.rules}</td>
          </tr>
        ))}
      </Table>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const TypesOfIncident = () => {
  const [typesOfIncident, setTypesOfIncident] = useState([]);
  const [edit, setEdit] = useState(null);

  const { get: getTypesOfIncidents } = useFetch(
    defaultEndpoints.typesOfIncident
  );

  useEffect(() => {
    getTypesOfIncidents().then((data) => {
      if (data?._embedded?.configTypeOfIncident) {
        setTypesOfIncident(data?._embedded?.configTypeOfIncident);
      }
    });
  }, []);
  return (
    <Box label="TYPE OF INCIDENT" collapsable={true}>
      <Table
        className={s.typeOfIncident}
        columns={[
          { label: "Option" },
          { label: "Definition" },
          { label: "Reporting Screen Template" },
          { label: "Enable RCA" },
          { label: "RCA Template" },
          { label: "Actions" },
        ]}
      >
        <tr>
          <td className={s.inlineForm}>
            <IncidentReportForm
              key={edit ? "edit" : "add"}
              edit={edit}
              clearForm={() => {
                setEdit(null);
              }}
              typesOfIncident={typesOfIncident}
              onSuccess={(newCat) => {
                console.log(newCat);
                setTypesOfIncident((prev) => {
                  return prev.find((c) => c.id === newCat.id)
                    ? prev.map((c) => (c.id === newCat.id ? newCat : c))
                    : [...prev, newCat];
                });
                setEdit(null);
              }}
            />
          </td>
        </tr>
        {typesOfIncident.map((inc, i) => (
          <tr key={i}>
            <td>
              {
                // <input type="checkbox" />
              }{" "}
              {inc.type}
            </td>
            <td className={s.definition}>{inc.definition}</td>
            <td>{inc.reportingTemplate}</td>
            <td>
              <Toggle readOnly={true} defaultValue={inc.enableRca} />
            </td>
            <td>{inc.rcaTemplate}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => setEdit(inc),
                },
                {
                  icon: <FaUndo />,
                  label: "Undo",
                  callBack: () => {},
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <div className={s.infoForm}>
        <Input label="Information for type of incident" />
        <section>
          <input type="checkbox" id="sendThank" />
          <label htmlFor="sendThank">
            Send thank you notification to RCA team members.
          </label>
        </section>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};
const IncidentReportForm = ({
  edit,
  typesOfIncident,
  onSuccess,
  clearForm,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ ...edit });
  const [loading, setLoading] = useState(false);

  const { post: postType, put: updateType } = useFetch(
    defaultEndpoints.typesOfIncident + `/${edit?.id || ""}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          typesOfIncident?.some(
            (item) => +item.type === +data.type && item.id !== data.id
          )
        ) {
          Prompt({
            type: "information",
            message: `${data.type} already exists.`,
          });
          return;
        }
        setLoading(true);
        (edit ? updateType : postType)(data)
          .then((data) => {
            setLoading(false);
            if (data.id) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => {
            setLoading(false);
            Prompt({ type: "error", message: err.message });
          });
      })}
    >
      <Input
        {...register("type", {
          required: "Please enter a Option",
        })}
        error={errors.type}
      />
      <Input
        {...register("definition", {
          required: "Please enter a Deffination",
        })}
        error={errors.definition}
      />
      <Input
        {...register("reportingTemplate", {
          required: "Please enter a Rerpoting Template",
        })}
        error={errors.reportingTemplate}
      />
      <Toggle
        register={register}
        name="enableRca"
        required={true}
        watch={watch}
        setValue={setValue}
      />
      <Input
        {...register("rcaTemplate", {
          required: "Please enter a RCA Template",
        })}
        error={errors.rcaTemplate}
      />
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? (
            <FaCheck />
          ) : (
            <>
              <FaPlus /> Add
            </>
          )}
        </button>
        {edit && (
          <button
            type="button"
            onClick={() => {
              clearForm();
            }}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

const SentinelEventNotification = () => {
  const [sentinelNotification, setSentinelNotification] = useState([
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
    {
      id: "user123",
      department: "Department name one",
      designation: "designation",
      phone: "+902415151515",
      email: "some@email.com",
    },
  ]);
  return (
    <Box label="SENTINEL EVENT NOTIFICATION" collapsable={true}>
      <div className={s.sentinelNotificationHead}>
        <p>Notify to:</p>
        <section className={s.notificationOptions}>
          <p>Notify Through:</p>
          <section>
            <input type="checkbox" id="notifyThrough-email" />
            <label htmlFor="notifyThrough-email">Email</label>
          </section>
          <section>
            <input type="checkbox" id="notifyThrough-phone" />
            <label htmlFor="notifyThrough-phone">Phone</label>
          </section>
        </section>
      </div>
      <Table
        className={s.sentinelNotification}
        columns={[
          { label: "User" },
          { label: "Department" },
          { label: "Designation" },
          { label: "Mobile Number" },
          { label: "Email" },
          { label: "Action" },
        ]}
      >
        <tr>
          <td className={s.inlineForm}>
            <NotifyForm />
          </td>
        </tr>
        {sentinelNotification.map((user, i) => (
          <tr key={i}>
            <td>{user.id}</td>
            <td>{user.department}</td>
            <td>{user.designation}</td>
            <td>{user.phone}</td>
            <td>{user.email}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {},
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () => {},
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <div className={s.sentinelNotificationContent}>
        <h4>E-mail/SMS Notification Content</h4>
        <p>
          <strong>Subject</strong>: Sentinel Event reported.
          <br />
          Please find below details for the sentinel event reported.
        </p>
        <section className={s.checkboxes}>
          <section>
            <input type="checkbox" id="notiContent-irCode" />
            <label htmlFor="notiContent-irCode">IR code</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-category" />
            <label htmlFor="notiContent-category">Category</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-subCategory" />
            <label htmlFor="notiContent-subCategory">Subcategory</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-incidentLocation" />
            <label htmlFor="notiContent-incidentLocation">
              Incident Location
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-name" />
            <label htmlFor="notiContent-name">Reported by name</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-department" />
            <label htmlFor="notiContent-department">
              Reported by department
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-IncidentDatetime" />
            <label htmlFor="notiContent-IncidentDatetime">
              Date & time of incident
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-reportDatetime" />
            <label htmlFor="notiContent-reportDatetime">
              Reporting date & time
            </label>
          </section>
        </section>
        <p>Please contact IR manager for further information.</p>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};
const NotifyForm = ({ edit, onChange }) => {
  const { register, watch } = useForm();
  return (
    <form>
      <Input required={true} name="name" placeholder="Enter" />
      <Input required={true} name="dob" placeholder="Enter" />
      <Input required={true} name="employeeId" placeholder="Enter" />
      <MobileNumberInput
        register={register}
        required={true}
        name="contact"
        placeholder="Enter"
        watch={watch}
      />
      <Input required={true} email="email" placeholder="Enter" />
      <button className="btn secondary">
        <FaPlus /> Add
      </button>
    </form>
  );
};

const HodApprovalProcess = () => {
  return (
    <Box label="HOD APPROVAL PROCESS" collapsable={true}>
      <Table className={s.hodApproval} columns={[{ label: "Select" }]}>
        <tr>
          <td>
            <input
              type="checkbox"
              id="hodApproval-required"
              onChange={() => {}}
            />
            <label htmlFor="hodApproval-required">
              <strong>
                HOD approval required - IR team can start investigation only
                after IS is approved
              </strong>
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <input
              type="checkbox"
              id="hodApproval-acknowledgement"
              onChange={() => {}}
            />
            <label htmlFor="hodApproval-acknowledgement">
              <strong>HOD acknowledgement</strong> - IR is sent to HOD for
              acknowledgement, however, the step has no dependency on further
              actions.
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="checkbox" id="hodApproval-none" onChange={() => {}} />
            <label htmlFor="hodApproval-none">
              <strong>None</strong> - HOD is not notified of the reported IR.
              HOD dashboard will be disabled.
            </label>
          </td>
        </tr>
      </Table>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const DashboardDataElements = () => {
  const dataElementRef = useRef([]);
  const [dashboardDataElements, setDashboardDataElements] = useState([]);
  const [update, setUpdate] = useState([]);
  const { get: getDashboardElements } = useFetch(
    defaultEndpoints.dashboardElements
  );
  const { patch: updateOption } = useFetch(
    defaultEndpoints.dashboardElements + `/{ID}`,
    { headers: { "Content-Type": "application/json" } }
  );
  useEffect(() => {
    getDashboardElements().then((data) => {
      if (data._embedded.dashboardElements) {
        const _data = data._embedded.dashboardElements.map((item) => {
          delete item._links;
          return item;
        });
        setDashboardDataElements(_data);
        dataElementRef.current = _data;
      }
    });
  }, []);
  useEffect(() => {
    setUpdate(
      dashboardDataElements.filter((newItem) => {
        const oldItem = dataElementRef.current.find(
          (old) => old.statusOption === newItem.statusOption
        );
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
    );
  }, [dashboardDataElements]);
  return (
    <Box label="DASHBOARD DATA ELEMENT" collapsable={true}>
      <i>
        Configure the data elements to show in the left menu for specified user
        roles.
      </i>
      <div className={s.dashboardDataElement}>
        <div>
          <Table
            columns={[
              { label: "Status Option" },
              { label: "IR Manager" },
              { label: "IR Investigator" },
            ]}
          >
            {dashboardDataElements.map((item, i) => (
              <tr key={i}>
                <td>{item.statusOption}</td>
                <td>
                  <section>
                    <input
                      type="checkbox"
                      id={`dashboardDataElements-${item.statusOption}-irMgr`}
                      checked={item.irMgr}
                      onChange={() => {
                        setDashboardDataElements((prev) =>
                          prev.map((op) =>
                            op.statusOption === item.statusOption
                              ? { ...op, irMgr: !item.irMgr }
                              : op
                          )
                        );
                      }}
                    />
                    <label
                      htmlFor={`dashboardDataElements-${item.statusOption}-irMgr`}
                    >
                      Visible
                    </label>
                  </section>
                </td>
                <td>
                  <section>
                    <input
                      type="checkbox"
                      id={`dashboardDataElements-${item.statusOption}-irInvestigator`}
                      checked={item.irInvestigator}
                      onChange={() => {
                        setDashboardDataElements((prev) =>
                          prev.map((op) =>
                            op.statusOption === item.statusOption
                              ? { ...op, irInvestigator: !item.irInvestigator }
                              : op
                          )
                        );
                      }}
                    />
                    <label
                      htmlFor={`dashboardDataElements-${item.statusOption}-irInvestigator`}
                    >
                      Visible
                    </label>
                  </section>
                </td>
              </tr>
            ))}
          </Table>
          <section className={s.enableIR}>
            <label>Enable cancel IR function</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
        </div>
        {
          //   <div>
          //   <Table
          //     columns={[
          //       { label: "Statistics Option" },
          //       { label: "IR Manager" },
          //       { label: "IR Investigator" },
          //     ]}
          //   >
          //     {dashboardDataElements.map((item, i) => (
          //       <tr key={i}>
          //         <td>{item.statusOption}</td>
          //         <td>
          //           <section>
          //             <input
          //               type="checkbox"
          //               id={`dashboardDataElements-${item.option}-manager`}
          //               checked={item.irMgr}
          //               onChange={() => {}}
          //             />
          //             <label
          //               htmlFor={`dashboardDataElements-${item.option}-manager`}
          //             >
          //               Visible
          //             </label>
          //           </section>
          //         </td>
          //         <td>
          //           <section>
          //             <input
          //               type="checkbox"
          //               id={`dashboardDataElements-${item.option}-investigator`}
          //               checked={item.irInvestigator}
          //               onChange={() => {}}
          //             />
          //             <label
          //               htmlFor={`dashboardDataElements-${item.option}-investigator`}
          //             >
          //               Visible
          //             </label>
          //           </section>
          //         </td>
          //       </tr>
          //     ))}
          //   </Table>
          //   <section className={s.enableIR}>
          //     <label>Enable cancel IR function</label>
          //     <Toggle readOnly={true} defaultValue={true} />
          //   </section>
          // </div>
        }
      </div>
      <div className={s.btns}>
        <button
          disabled={!update.length}
          onClick={() => {
            Promise.all(
              update.map((item) =>
                updateOption(item, { params: { "{ID}": item.id } })
              )
            )
              .then((resp) => {
                if (resp?.length) {
                  dataElementRef.current = [
                    ...dashboardDataElements.filter(
                      (item) =>
                        !resp.some(
                          (op) => op.statusOption === item.statusOption
                        )
                    ),
                    ...resp,
                  ];
                  setDashboardDataElements((prev) =>
                    prev.map(
                      (item) =>
                        resp.find(
                          (op) => op.statusOption === item.statusOption
                        ) || item
                    )
                  );
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }}
          className="btn w-100"
        >
          Save
        </button>
      </div>
    </Box>
  );
};

const IncidentClosure = () => {
  return (
    <Box label="INCIDENT CLOSURE" collapsable={true}>
      <div className={s.incidentClosure}>
        <p>IR closure format to include</p>
        <section className={s.checkboxes}>
          <section>
            <input type="checkbox" id="notiContent-irCode" />
            <label htmlFor="notiContent-irCode">IR code</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-category" />
            <label htmlFor="notiContent-category">Category</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-subCategory" />
            <label htmlFor="notiContent-subCategory">Subcategory</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-incidentLocation" />
            <label htmlFor="notiContent-incidentLocation">
              Incident Location
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-name" />
            <label htmlFor="notiContent-name">Reported by name</label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-department" />
            <label htmlFor="notiContent-department">
              Reported by department
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-IncidentDatetime" />
            <label htmlFor="notiContent-IncidentDatetime">
              Date & time of incident
            </label>
          </section>
          <section>
            <input type="checkbox" id="notiContent-reportDatetime" />
            <label htmlFor="notiContent-reportDatetime">
              Reporting date & time
            </label>
          </section>
        </section>
        <div className={s.capaClosure}>
          <section>
            <label>Enable CAPA effectiveness monitoring</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Send CAPA closure report</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <input type="checkbox" id="sendThank-2" />
            <label htmlFor="sendThank-2">
              Send thank you notification to RCA team members
            </label>
          </section>
        </div>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

const AcceptableTat = () => {
  const { handleSubmit, register, reset, watch, setValue } = useForm();
  const [tat, setTat] = useState(null);
  const { get: getTat } = useFetch(defaultEndpoints.configTat);
  const { put: updateTat } = useFetch(
    defaultEndpoints.configTat + `/${tat?.id}`,
    { headers: { "Content-Type": "application/json" } }
  );
  useEffect(() => {
    getTat().then((data) => {
      if (data?._embedded?.configAcceptableTAT[0]) {
        const _tat = data?._embedded?.configAcceptableTAT[0];
        setTat({
          ..._tat,
          excludeWeek: _tat.excludeWeek.split(","),
          sentinelExcludeWeek: _tat.sentinelExcludeWeek.split(","),
        });
        reset({
          start: _tat.start,
          endValue: _tat.endValue,
          acceptableTAT: _tat.acceptableTAT,
          acceptableTatSentinel: _tat.acceptableTatSentinel,
          excludeWeek: _tat.excludeWeek.split(","),
          sentinelExcludeWeek: _tat.sentinelExcludeWeek.split(","),
        });
      }
    });
  }, []);
  return (
    <Box label="ACCEPTABLE TAT" collapsable={true}>
      <form
        onSubmit={handleSubmit((data) => {
          updateTat({
            start: data.start,
            endValue: data.endValue,
            acceptableTAT: data.acceptableTAT,
            acceptableTatSentinel: data.acceptableTatSentinel,
            excludeWeek: data.excludeWeek.join(","),
            sentinelExcludeWeek: data.sentinelExcludeWeek.join(","),
          }).then((data) => {
            if (data?.id) {
              Prompt({
                type: "information",
                message: "Acceptable TAT has been updated.",
              });
              setTat({
                ...data,
                excludeWeek: data.excludeWeek.split(","),
                sentinelExcludeWeek: data.sentinelExcludeWeek.split(","),
              });
              reset({
                start: data.start,
                endValue: data.endValue,
                acceptableTAT: data.acceptableTAT,
                acceptableTatSentinel: data.acceptableTatSentinel,
                excludeWeek: data.excludeWeek.split(","),
                sentinelExcludeWeek: data.sentinelExcludeWeek.split(","),
              });
            }
          });
        })}
      >
        <div className={s.acceptableTat}>
          <p>IR closure TAT monitoring</p>
          <div className={s.tatMonitoring}>
            <Input
              label={
                <>
                  <FaPlayCircle /> Start:
                </>
              }
              className={s.start}
              {...register("start")}
              readOnly={true}
            />
            <Input
              label={<FaStopCircle />}
              className={s.stop}
              {...register("endValue")}
              readOnly={true}
            />
          </div>
          <p>Acceptable TAT</p>
          <div className={s.tatDays}>
            <div className={s.days}>
              <Input
                className={`flex ${s.numberOfDays}`}
                label="Acceptable TAT"
                {...register("acceptableTAT")}
              />{" "}
              days <span className={s.divider}>|</span>
              <CustomRadio
                label="Exclude Days of week:"
                options={[
                  { label: "M", value: "monday" },
                  { label: "T", value: "tuesday" },
                  { label: "W", value: "wednesday" },
                  { label: "T", value: "thursday" },
                  { label: "F", value: "friday" },
                  { label: "S", value: "saturday" },
                ]}
                name="excludeWeek"
                multiple={true}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            </div>
            <div className={s.days}>
              <Input
                className={`flex ${s.numberOfDays}`}
                label="Acceptable TAT for sentinel event"
                {...register("acceptableTatSentinel")}
              />{" "}
              days <span className={s.divider}>|</span>
              <CustomRadio
                label="Exclude Days of week:"
                options={[
                  { label: "M", value: "monday" },
                  { label: "T", value: "tuesday" },
                  { label: "W", value: "wednesday" },
                  { label: "T", value: "thursday" },
                  { label: "F", value: "friday" },
                  { label: "S", value: "saturday" },
                ]}
                name="sentinelExcludeWeek"
                multiple={true}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            </div>
          </div>
        </div>
        <div className={s.btns}>
          <button className="btn w-100">Save</button>
        </div>
      </form>
    </Box>
  );
};

const IrInvestigationDetails = () => {
  return (
    <Box label="IR INVESTIGATION-DETAILS" collapsable={true}>
      <div className={s.irInvestigationDetail}>
        <section className={s.section_1}>
          <section>
            <label>View related incidents</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
        </section>
        <section className={s.section_2}>
          <label>Criteria for automated similar incident alert</label>
          <div className={s.checkboxes}>
            <span>Show IR's of:</span>
            <section>
              <input type="checkbox" id="ir-alert-sameCategory" />
              <label htmlFor="ir-alert-sameCategory">Same category</label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-sameSubcategory" />
              <label htmlFor="ir-alert-sameSubcategory">
                Same Sub-category
              </label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-typeOfIncident" />
              <label htmlFor="ir-alert-typeOfIncident">Type of incident</label>
            </section>
            <section>
              <input type="checkbox" id="ir-alert-sameLocation" />
              <label htmlFor="ir-alert-sameLocation">Same Location type</label>
            </section>
            <Combobox
              className={s.duration}
              label="Duration"
              options={[
                { value: 1, label: "Last one year" },
                { value: 2, label: "Last two years" },
                { value: 3, label: "Last three years" },
              ]}
            />
          </div>
        </section>
        <section className={s.section_3}>
          <section>
            <label>View related incidents</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Mark self reporting IRs</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <label>Mark IPSG Type</label>
            <Toggle readOnly={true} defaultValue={true} />
          </section>
          <section>
            <input type="checkbox" id="irInvestigationDetail-sendThank" />
            <label htmlFor="irInvestigationDetail-sendThank">
              Send thank you notification for self-Reorting IR
            </label>
          </section>
        </section>
      </div>
      <div className={s.btns}>
        <button className="btn w-100">Save</button>
      </div>
    </Box>
  );
};

export default function MainConfig() {
  const [notifyThrough, setNotifyThrough] = useState(["email", "sms"]);

  return (
    <div className={s.container} data-testid="mainConfig">
      <header>
        <h3>IR CONFIGURATION</h3>
      </header>
      <IrScreen />
      <TypesOfIncident />
      <SentinelEventNotification />
      <HodApprovalProcess />
      <DashboardDataElements />
      <IncidentClosure />
      <AcceptableTat />
      <IrInvestigationDetails />
    </div>
  );
}
