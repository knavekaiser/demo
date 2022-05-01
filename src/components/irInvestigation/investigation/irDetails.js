import { useEffect, useState, useCallback, useContext } from "react";
import s from "./style.module.scss";
import { Box } from "../../incidentReport";
import { InvestigationContext } from "../InvestigationContext";
import {
  Select,
  Table,
  TableActions,
  Combobox,
  Input,
  Textarea,
  FileInput,
  Radio,
  Tabs,
  Moment,
  moment,
} from "../../elements";
import { ImEye } from "react-icons/im";
import {
  FaRegTrashAlt,
  FaCheck,
  FaPlus,
  FaPlusCircle,
  FaFlag,
  FaMinusCircle,
  FaEllipsisV,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { useFetch } from "../../../hooks";
import {
  endpoints as defaultEndpoints,
  permissions,
  riskColors,
} from "../../../config";
import { Prompt, Modal } from "../../modal";
import { useForm, FormProvider, useFormContext } from "react-hook-form";

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();
  return children({ ...methods });
};

const IrDetails = () => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [parameters, setParameters] = useState({
    severity: [],
    likelihood: [],
    users: [],
    departments: [],
    roles: permissions.map((p) => ({ value: p.role, label: p.label })),
    risks: [],
    riskStatus: [],
  });
  const [requestInput, setRequestInput] = useState(false);
  const [similarIncidents, setSimilarIncidents] = useState([
    {
      id: "23",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "24",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "25",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "26",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "27",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "28",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "29",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "30",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "31",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
    {
      id: "32",
      sequence: "IR1/2/24",
      location: 1,
      incident_date_time: "2022-01-07T20:23",
    },
  ]);
  const [showSimilarIncidents, setShowSimilarIncidents] = useState(false);
  const methods = useForm();

  const { post: saveIrDetail, put: updateIrDetail, savingIrDetail } = useFetch(
    defaultEndpoints.irInvestigation +
      (ir.irInvestigation?.length ? `/${ir.irInvestigation[0].id}` : "")
  );

  const submitMainForm = useCallback(
    (values) => {
      console.log(ir.irInvestigation);
      (ir.irInvestigation?.length ? updateIrDetail : saveIrDetail)({
        ...(ir.irInvestigation.length ?? ir.irInvestigation[0]),
        ...values,
        incidentReport: { id: ir.id },
      }).then(({ data }) => {
        if (data.id) {
          setIr((prev) => ({ ...prev, irInvestigation: [data] }));
        }
      });
      console.log(values);
    },
    [ir]
  );

  const { get: getSeverity } = useFetch(
    defaultEndpoints.twoFieldMasters + "/2"
  );
  const { get: getLikelihood } = useFetch(
    defaultEndpoints.twoFieldMasters + "/9"
  );
  const { get: getRiskStatus } = useFetch(
    defaultEndpoints.twoFieldMasters + "/4"
  );
  const { get: getUsers } = useFetch(defaultEndpoints.users + `?size=10000`);
  const { get: getDepartments } = useFetch(
    defaultEndpoints.departments + `?size=10000`
  );
  const { get: getRisks } = useFetch(defaultEndpoints.riskAssessments);

  useEffect(() => {
    Promise.all([
      getSeverity(),
      getLikelihood(),
      getRiskStatus(),
      getUsers(),
      getDepartments(),
      getRisks(),
    ]).then(
      ([
        { data: severity },
        { data: likelihood },
        { data: riskStatus },
        { data: users },
        { data: departments },
        { data: risks },
      ]) => {
        const _parameters = {};

        if (severity?.twoFieldMasterDetails) {
          _parameters.severity = severity.twoFieldMasterDetails.map((item) => ({
            value: item.id,
            label: item.name,
          }));
        }

        if (likelihood?.twoFieldMasterDetails) {
          _parameters.likelihood = likelihood.twoFieldMasterDetails.map(
            (item) => ({ label: item.name, value: item.id })
          );
        }

        if (riskStatus?.twoFieldMasterDetails) {
          _parameters.riskStatus = riskStatus.twoFieldMasterDetails.map(
            (item) => ({ label: item.name, value: item.id })
          );
        }

        if (users?._embedded.user) {
          _parameters.users = users._embedded.user.map((user) => ({
            label: user.name,
            value: user.id,
            department: user.department,
            role: user.role.split(",").filter((item) => item),
          }));
        }

        if (departments?._embedded?.department) {
          _parameters.departments = departments._embedded.department.map(
            (dept) => ({ label: dept.name, value: dept.id })
          );
        }

        if (risks?._embedded?.riskAssement) {
          _parameters.risks = risks._embedded.riskAssement;
        }

        setParameters((prev) => ({ ...prev, ..._parameters }));
      }
    );
  }, []);

  useEffect(() => {
    if (ir.irInvestigation?.length) {
      methods.reset({
        ...ir.irInvestigation[0],
        riskSeverity: ir.irInvestigation[0].riskSeverity || "",
        riskLikeliHood: ir.irInvestigation[0].riskLikeliHood || "",
        ipsg: ir.irInvestigation[0].ipsg || "",
        name: ir.irInvestigation[0].name || "",
        dept: ir.irInvestigation[0].dept || "",
        prevSimilar: ir.irInvestigation[0].prevSimilar.toString(),
        riskIncluded: ir.irInvestigation[0].riskIncluded.toString(),
        selfRep: ir.irInvestigation[0].selfRep.toString(),
        ipsgBreach: ir.irInvestigation[0].ipsgBreach.toString(),
      });
    }
  }, [ir.irInvestigation]);

  return (
    <FormProvider {...methods}>
      <div className={s.irDetails}>
        <form
          onSubmit={methods.handleSubmit(submitMainForm)}
          className={s.similarIncidents}
        >
          <section className={s.similarInput}>
            <label>Previous Similar Incidents:</label>
            <Radio
              register={methods.register}
              name="prevSimilar"
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
            />
          </section>
          <a onClick={() => setShowSimilarIncidents(true)}>
            {similarIncidents.length} Incidents
          </a>
        </form>
        <Box collapsable label="TABLE OF EVENTS">
          <Events
            events={(ir.irInvestigation && ir.irInvestigation[0]?.events) || []}
          />
          <div className={s.legend}>
            <FaFlag className={s.problem} /> Potential problem areas
          </div>
        </Box>
        <Box collapsable label="RISK ASSESSMENT">
          <RiskAssessment
            methods={methods}
            investigationDetails={ir.irInvestigation && ir.irInvestigation[0]}
            parameters={parameters}
            submitMainForm={submitMainForm}
          />
        </Box>
        <Box label="NOTES" collapsable>
          <Notes
            parameters={parameters}
            methods={methods}
            notes={(ir.irInvestigation && ir.irInvestigation[0]?.notes) || []}
          />
        </Box>
        <Modal
          head
          label="RECORD INPUTS"
          open={showSimilarIncidents}
          setOpen={setShowSimilarIncidents}
          className={s.similarIncidentsModal}
        >
          <SimilarIncidents similarIncidents={similarIncidents} />
        </Modal>
        <form
          className={s.btns}
          onSubmit={methods.handleSubmit(submitMainForm)}
        >
          <button
            className="btn secondary wd-100"
            type="button"
            onClick={() => {}}
          >
            Close
          </button>
          <button onClick={() => {}} className="btn secondary wd-100">
            Save
          </button>
          <button onClick={() => {}} className="btn wd-100">
            Submit
          </button>
        </form>
      </div>
    </FormProvider>
  );
};
const RiskAssessment = ({
  methods,
  invitationDetails,
  parameters,
  submitMainForm,
}) => {
  const [risk, setRisk] = useState({});
  const severity = methods.watch("riskSeverity");
  const likelihood = methods.watch("riskLikeliHood");
  useEffect(() => {
    const selectedRisk = parameters.risks.find(
      (r) => r.likelihood === likelihood && r.serverity === severity
    );

    if (selectedRisk) {
      setRisk((prev) => ({ ...prev, riskDetail: selectedRisk }));
      methods.setValue(
        "riskCateg",
        parameters.riskStatus.find(
          (item) => item.value.toString() === selectedRisk.riskstatus.toString()
        )?.label || ""
      );
    } else {
      setRisk((prev) => ({ ...prev, riskDetail: null }));
    }
  }, [likelihood, severity, parameters.risks]);
  return (
    <ConnectForm>
      {({
        register,
        setValue,
        watch,
        getValues,
        formState: { errors },
        clearErrors,
        control,
      }) => {
        return (
          <div className={s.riskAssessment}>
            <Combobox
              label="Severity"
              name="riskSeverity"
              watch={watch}
              register={register}
              setValue={setValue}
              options={parameters.severity}
            />
            <Combobox
              label="Likelihood"
              name="riskLikeliHood"
              watch={watch}
              register={register}
              setValue={setValue}
              options={parameters.likelihood}
            />
            <Input
              label="Risk Category"
              {...register("riskCateg")}
              value={
                parameters.riskStatus.find(
                  (item) =>
                    item.value.toString() ===
                    risk.riskDetail?.riskstatus.toString()
                )?.label || ""
              }
              style={
                risk.riskDetail
                  ? {
                      background: riskColors.find(
                        (item) =>
                          item.value.toString() ===
                          risk.riskDetail.color.toString()
                      )?.hex,
                    }
                  : {}
              }
              readOnly
            />
            <section className={s.riskIncluded}>
              <label>Risk inlcuded in Risk Register</label>
              <Radio
                register={register}
                name="riskIncluded"
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
            </section>
            <Input label="Risk ID" {...register("riskId")} />
          </div>
        );
      }}
    </ConnectForm>
  );
};

const Events = ({ events }) => {
  const { setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEv) => {
    // setEvents((prev) => {
    //   return prev.find((c) => c.id === newEv.id)
    //     ? prev.map((c) => (c.id === newEv.id ? newEv : c))
    //     : [...prev, newEv];
    // });
    setEdit(null);
  }, []);

  const { remove: deleteEvent, put: updateEvent, loading } = useFetch(
    defaultEndpoints.investigationEvents + "/{ID}"
  );

  return (
    <Table
      className={s.tableOfEvents}
      sortable={{
        handle: ".handle",
        removeCloneOnHide: true,
        onEnd: (e) => {
          // const itemEl = e.item;
          // const { oldIndex, newIndex } = e;
          // if (oldIndex !== newIndex) {
          //   setCodeConfig((prev) => {
          //     const videos = [
          //       ...prev.filter((item, i) => i !== oldIndex),
          //     ];
          //     videos.splice(newIndex, 0, prev[oldIndex]);
          //     return videos;
          //   });
          // }
        },
      }}
      columns={[
        { label: "S.No." },
        { label: "Details" },
        { label: "Date & Time" },
        { label: "Actions" },
      ]}
    >
      <tr>
        <td className={s.inlineForm}>
          <EventForm
            key={edit ? "edit" : "add"}
            edit={edit}
            onSuccess={(newEvent) => {
              setIr((prev) => ({
                ...prev,
                irInvestigation: [
                  {
                    ...prev.irInvestigation[0],
                    events: [
                      ...(prev.irInvestigation[0].events || []).filter(
                        (item) => item.id !== newEvent.id
                      ),
                      newEvent,
                    ],
                  },
                ],
              }));
              setEdit(null);
            }}
            clearForm={() => setEdit(null)}
          />
        </td>
      </tr>
      {events.map((ev, i) => (
        <tr key={i}>
          <td className="handle">
            {" "}
            <FaEllipsisV /> {ev.no}
          </td>
          <td className={s.dscr}>
            <span className={`${s.flag} ${ev.problem ? s.problem : ""}`}>
              <button
                className="btn clear"
                style={{ padding: 0, margin: 0 }}
                disabled={loading}
                onClick={() =>
                  updateEvent(
                    { ...ev, problem: !ev.problem },
                    { params: { "{ID}": ev.id } }
                  ).then(({ data }) => {
                    if (!data?.id) {
                      return Prompt({
                        type: "error",
                        message: "Something went wrong",
                      });
                    }
                    setIr((prev) => ({
                      ...prev,
                      irInvestigation: [
                        {
                          ...prev.irInvestigation[0],
                          events: (
                            prev.irInvestigation[0].events || []
                          ).map((item) => (item.id === data.id ? data : item)),
                        },
                      ],
                    }));
                  })
                }
              >
                <FaFlag />
              </button>
            </span>
            {ev.details}
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{ev.dateTime}</Moment>
          </td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(ev),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove this event?`,
                    callback: () => {
                      deleteEvent(null, {
                        params: { "{ID}": ev.id },
                      }).then(({ res }) => {
                        if (res.status === 204) {
                          setIr((prev) => ({
                            ...prev,
                            irInvestigation: [
                              {
                                ...prev.irInvestigation[0],
                                events: [
                                  ...prev.irInvestigation[0].events.filter(
                                    (item) => item.id !== ev.id
                                  ),
                                ],
                              },
                            ],
                          }));
                        }
                      });
                    },
                  }),
              },
            ]}
          />
        </tr>
      ))}
    </Table>
  );
};
const EventForm = ({ edit, onSuccess, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveEvent, put: updateEvent, loading } = useFetch(
    defaultEndpoints.investigationEvents + `/${edit?.id || ""}`
  );
  const { post: saveIrDetail, savingIrDetail } = useFetch(
    defaultEndpoints.irInvestigation
  );

  useEffect(() => {
    reset({
      ...edit,
      dateTime: edit
        ? moment({ time: edit.dateTime, format: "YYYY-MM-DDThh:mm" })
        : "",
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let irDetail = ir.irInvestigation[0];
        if (!irDetail) {
          irDetail = await saveIrDetail({ incidentReport: { id: ir.id } }).then(
            ({ data }) => {
              setIr((prev) => ({ ...prev, irInvestigation: [data] }));
              return data;
            }
          );
        }

        if (!irDetail) {
          return Prompt({
            type: "error",
            message: "Please save IR Investigation before saving notes.",
          });
        }

        (edit ? updateEvent : saveEvent)({
          ...values,
          // notes: "notes",
          // problem: true,
          // sequence: 1,
          irId: ir.id,
          irInvestigation: { id: irDetail.id },
        })
          .then(({ data }) => {
            if (data.id) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <span />
      <Input
        {...register("details", { required: "Please enter Detail" })}
        error={errors.details}
      />
      <Input
        type="datetime-local"
        {...register("dateTime", { required: "Please enter Date & Time" })}
        error={errors.dateTime}
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
            onClick={() => clearForm(null)}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

const Notes = ({ notes, parameters }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);
  const { remove: deleteNote } = useFetch(
    defaultEndpoints.investigationNotes + "/{ID}"
  );
  return (
    <div className={s.notesWrapper}>
      <ConnectForm>
        {({
          register,
          setValue,
          watch,
          getValues,
          formState: { errors },
          clearErrors,
          control,
        }) => {
          const dept = watch("dept");

          return (
            <>
              <div className={s.selfReporting}>
                <section className={s.radio}>
                  <label>Self reporting</label>
                  <Radio
                    register={register}
                    name="selfRep"
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                  />
                </section>
                <Select
                  control={control}
                  name="name"
                  label="Name"
                  options={parameters.users}
                  onChange={(option) => {
                    setValue("dept", option.department);
                    setValue(
                      "designaion",
                      option.role
                        .map(
                          (role) =>
                            parameters.roles.find((r) => r.value === role)
                              ?.label || role
                        )
                        .join(", ")
                    );
                  }}
                />
                <Input
                  label="Department"
                  {...register("dept")}
                  value={
                    parameters.departments.find(
                      (dpt) => dpt.value.toString() === dept?.toString()
                    )?.label || ""
                  }
                  readOnly
                />
                {
                  //   <Select
                  //   control={control}
                  //   name="dept"
                  //   label="Department"
                  //   options={parameters.departments}
                  // />
                }
                <Input
                  label="Designation"
                  {...register("designaion")}
                  readOnly
                />
              </div>
              <div className={s.ipsg}>
                <section className={s.radio}>
                  <label>IPSG Breach</label>
                  <Radio
                    register={register}
                    name="ipsgBreach"
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                  />
                </section>
                <Combobox
                  label="Select"
                  name="ipsg"
                  watch={watch}
                  register={register}
                  setValue={setValue}
                  options={[
                    {
                      label: "IPSG 1 patient identification error",
                      value: "1",
                    },
                  ]}
                />
              </div>
            </>
          );
        }}
      </ConnectForm>

      <Table
        columns={[
          { label: "Notes" },
          { label: "Date & Time" },
          { label: "Actions" },
        ]}
        className={s.notes}
      >
        <tr>
          <td className={s.inlineForm}>
            <NoteForm
              key={edit ? "edit" : "add"}
              edit={edit}
              onSuccess={(newNote) => {
                setIr((prev) => ({
                  ...prev,
                  irInvestigation: [
                    {
                      ...prev.irInvestigation[0],
                      notes: [
                        ...(prev.irInvestigation[0].notes || []).filter(
                          (item) => item.id !== newNote.id
                        ),
                        newNote,
                      ],
                    },
                  ],
                }));
                setEdit(null);
              }}
              clearForm={() => setEdit(null)}
            />
          </td>
        </tr>
        {notes.map((note) => (
          <tr key={note.id}>
            <td>{note.notes}</td>
            <td>
              <Moment format="DD/MM/YYYY hh:mm">{note.dateTime}</Moment>
            </td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(note);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this note?`,
                      callback: () => {
                        deleteNote(null, {
                          params: { "{ID}": note.id },
                        }).then(({ res }) => {
                          if (res.status === 204) {
                            setIr((prev) => ({
                              ...prev,
                              irInvestigation: [
                                {
                                  ...prev.irInvestigation[0],
                                  notes: [
                                    ...prev.irInvestigation[0].notes.filter(
                                      (item) => item.id !== note.id
                                    ),
                                  ],
                                },
                              ],
                            }));
                          }
                        });
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>
    </div>
  );
};
const NoteForm = ({ edit, onSuccess, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveNote, put: updateNote, loading } = useFetch(
    defaultEndpoints.investigationNotes + `/${edit?.id || ""}`
  );
  const { post: saveIrDetail, savingIrDetail } = useFetch(
    defaultEndpoints.irInvestigation
  );

  useEffect(() => {
    reset({
      ...edit,
      dateTime: edit
        ? moment({ time: edit.dateTime, format: "YYYY-MM-DDThh:mm" })
        : "",
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let irDetail = ir.irInvestigation[0];
        if (!irDetail) {
          irDetail = await saveIrDetail({ incidentReport: { id: ir.id } }).then(
            ({ data }) => {
              setIr((prev) => ({ ...prev, irInvestigation: [data] }));
              return data;
            }
          );
        }

        if (!irDetail) {
          return Prompt({
            type: "error",
            message: "Please save IR Investigation before saving notes.",
          });
        }

        (edit ? updateNote : saveNote)({
          ...edit,
          ...values,
          irId: ir.id,
          irInvestigation: { id: irDetail.id },
        })
          .then(({ data }) => {
            if (data.id) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        {...register("notes", { required: "Please enter Detail" })}
        error={errors.notes}
      />
      <Input
        type="datetime-local"
        {...register("dateTime", { required: "Please enter Date & Time" })}
        error={errors.dateTime}
      />
      <div className={s.btns}>
        <button className="btn secondary" type="submit">
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
            onClick={() => clearForm(null)}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

const SimilarIncidents = ({ similarIncidents }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [ir, setIr] = useState(similarIncidents[0]);
  const [search, setSearch] = useState("");
  const [irs, setIrs] = useState([
    {
      id: "1",
      sequence: "IR1/2/25",
      rootCause: "Policy to be updated",
      actionPlan: "Policy to be updated",
      category: "Medicine",
      status: "Accepted",
      actionTaken: "Policy approved in medication review.",
      details:
        "Meical administration policy does not inlcude medication transportation",
      dateTime: "2021-08-01T15:03",
    },
    {
      id: "2",
      sequence: "IR1/2/25",
      rootCause: "Policy to be updated",
      actionPlan: "Policy to be updated",
      category: "Medicine",
      status: "Accepted",
      actionTaken: "Policy approved in medication review.",
      details:
        "Meical administration policy does not inlcude medication transportation",
      dateTime: "2021-08-01T15:03",
    },
  ]);
  return (
    <div className={s.similarIncidents}>
      <Tabs
        secondary
        tabs={[
          { label: "INCIDENT DETAILS", value: "details" },
          { label: "SUMMARY", value: "summary" },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab.value);
        }}
      />
      <div className={`${s.incidents} ${s[activeTab]}`}>
        {activeTab === "details" && (
          <>
            <div className={s.sidebar}>
              <Input
                label="Add similar incident"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ul>
                {similarIncidents.map((ir) => (
                  <li key={ir.id}>
                    <div className={s.detail}>
                      <p className={s.sequence}>{ir.sequence}</p>
                      <p>{ir.location}</p>
                      <p>
                        <Moment format="DD/MM/YYYY hh:mm">
                          {ir.incident_date_time}
                        </Moment>
                      </p>
                    </div>
                    <button className="btn clear" onClick={() => {}}>
                      <FaRegTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.irView}>
              {ir ? "Preview IR" : "No IR selected"}
            </div>
          </>
        )}
        {activeTab === "summary" && (
          <>
            <section className={s.location}>
              <h4>Summary</h4>
              <section>
                <span className={s.label}>Location: </span>
                <p>
                  Nursing Station : 3 | Pediatric ward : 1 | Surgical ward : 1
                </p>
              </section>
              <section>
                <span className={s.label}>Incident Type: </span>
                <p>Near Miss : 3 | No Harm : 1 | Adverse : 1</p>
              </section>
            </section>
            <section>
              <h4>Root Cause Analysis - Category</h4>
              <Section label="Policy not available">
                <Table
                  className={s.policy}
                  columns={[
                    { label: "IR Code" },
                    { label: "Incident Date & Time" },
                    { label: "Root Cause" },
                    { label: "Details" },
                  ]}
                >
                  {irs.map((ir) => (
                    <tr key={ir.id}>
                      <td>{ir.sequence}</td>
                      <td>
                        <Moment format="DD/MM/YYYY hh:mm">{ir.dateTime}</Moment>
                      </td>
                      <td>{ir.rootCause}</td>
                      <td>{ir.details}</td>
                    </tr>
                  ))}
                </Table>
              </Section>
            </section>
            <section>
              <h4>Correct & Preventative Action plans</h4>
              <Table
                className={s.actionPlan}
                columns={[
                  { label: "IR Code" },
                  { label: "Incident Date & Time" },
                  { label: "Action Plan" },
                  { label: "Details" },
                  { label: "Category" },
                  { label: "Status" },
                  { label: "Action Taken" },
                ]}
              >
                {irs.map((ir) => (
                  <tr key={ir.id}>
                    <td>{ir.sequence}</td>
                    <td>
                      <Moment format="DD/MM/YYYY hh:mm">{ir.dateTime}</Moment>
                    </td>
                    <td>{ir.actionPlan}</td>
                    <td>{ir.details}</td>
                    <td>{ir.category}</td>
                    <td>{ir.status}</td>
                    <td>{ir.actionTaken}</td>
                  </tr>
                ))}
              </Table>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const Section = ({ label, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <section className={s.collapsableSection}>
      <button
        className={`btn clear ${s.header}`}
        onClick={() => setOpen(!open)}
      >
        {open ? <FaMinusCircle /> : <FaPlusCircle />} {label}
      </button>
      {open && <div className={s.content}>{children}</div>}
    </section>
  );
};

export default IrDetails;
