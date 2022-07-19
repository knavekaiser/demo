import { useEffect, useState, useCallback, useContext, useRef } from "react";
import s from "./style.module.scss";
import { Box } from "../../incidentReport";
import { InvestigationContext } from "../InvestigationContext";
import { SiteContext, IrDashboardContext } from "../../../SiteContext";
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
import { wait } from "../../../helpers";
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
  const { user } = useContext(SiteContext);
  const { ir, setIr } = useContext(InvestigationContext);
  const { irInvestigationDetails } = useContext(IrDashboardContext);
  const [parameters, setParameters] = useState({
    severity: [],
    likelihood: [],
    users: [],
    departments: [],
    roles: permissions.map((p) => ({ value: p.id, label: p.label })),
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
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const methods = useForm();

  const { post: saveIrDetail, put: updateIrDetail, savingIrDetail } = useFetch(
    defaultEndpoints.irInvestigation +
      (ir.irInvestigation?.length ? `/${ir.irInvestigation[0].id}` : "")
  );
  const { post: addEvent, loading: addingEvent } = useFetch(
    defaultEndpoints.investigationEvents
  );
  const {
    patch: updateEvent,
    remove: deleteEvent,
    loading: updatingEvent,
  } = useFetch(defaultEndpoints.investigationEvents + `/{ID}`);
  const { post: addNote, loading: addingNote } = useFetch(
    defaultEndpoints.investigationNotes
  );
  const {
    put: updateNote,
    remove: deleteNote,
    loading: updatingNote,
  } = useFetch(defaultEndpoints.investigationNotes + `/{ID}`);

  const submitMainForm = useCallback(
    async (values) => {
      const irDetail = ir.irInvestigation[0];
      await Promise.all([
        ...events
          .filter((ev) => ev.__status === "pending")
          .map((ev) => {
            const edit = typeof ev.id === "number";
            return (edit ? updateEvent : addEvent)(
              {
                ...ev,
                ...(!edit && { irInvestigation: { id: irDetail.id } }),
                irId: ir.id,
                id: undefined,
                __status: undefined,
              },
              { params: { "{ID}": ev.id } }
            );
          }),
        ...events
          .filter((ev) => ev.__status === "delete")
          .map((ev) => deleteEvent(null, { params: { "{ID}": ev.id } })),

        ...notes
          .filter((note) => note.__status === "pending")
          .map((note) => {
            const edit = typeof note.id === "number";
            return (edit ? updateNote : addNote)(
              {
                ...note,
                irId: ir.id,
                irInvestigation: { id: irDetail.id },
                id: undefined,
                __status: undefined,
              },
              { params: { "{ID}": note.id } }
            );
          }),
        ...notes
          .filter((note) => note.__status === "delete")
          .map((note) => deleteNote(null, { params: { "{ID}": note.id } })),
      ]);
      updateIrDetail({
        ...irDetail,
        ...values,
        events: events
          .filter((item) => item.__status !== "delete")
          .map((ev) => ({
            ...ev,
            id: undefined,
            __status: undefined,
          })),
        notes: notes
          .filter((item) => item.__status !== "delete")
          .map((note) => ({
            ...note,
            id: undefined,
            __status: undefined,
          })),
        incidentReport: { id: ir.id },
      }).then(async ({ data }) => {
        if (data.id) {
          setIr((prev) => ({
            ...prev,
            irInvestigation: [
              {
                ...data,
                events:
                  data.events?.sort((a, b) =>
                    a.sequence > b.sequence ? 1 : -1
                  ) || [],
              },
            ],
          }));
          Prompt({
            type: "success",
            message: "Investigation detail has been successfully saved.",
          });
        }
      });
    },
    [ir, events, notes]
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
            role: user.role
              .split(",")
              .map((role) => +role)
              .filter((item) => item),
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

  useEffect(async () => {
    if (ir.irInvestigation?.length) {
      const investigation = ir.irInvestigation[0];
      setEvents(
        (investigation.events || []).sort((a, b) =>
          a.sequence > b.sequence ? 1 : -1
        )
      );
      setNotes(investigation.notes || []);
      methods.reset({
        ...investigation,
        riskSeverity: investigation.riskSeverity || "",
        riskLikeliHood: investigation.riskLikeliHood || "",
        ipsg: investigation.ipsg || "",
        name: investigation.name || "",
        dept: investigation.dept || "",
        prevSimilar: investigation.prevSimilar.toString(),
        riskIncluded: investigation.riskIncluded.toString(),
        selfRep: investigation.selfRep.toString(),
        ipsgBreach: investigation.ipsgBreach.toString(),
      });
    } else if (ir.irInvestigation && !ir.irInvestigation.length) {
      const irDetail = await saveIrDetail({
        incidentReport: { id: ir.id },
      }).then(async ({ data }) => data);
      setIr((prev) => ({ ...prev, irInvestigation: [irDetail] }));
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
          <Events events={events} setEvents={setEvents} />
          <div className={s.legend}>
            <FaFlag className={s.problem} /> Potential problem areas
          </div>
        </Box>
        {irInvestigationDetails.find((item) => item.id === 7)?.enable && (
          <Box collapsable label="RISK ASSESSMENT">
            <RiskAssessment
              methods={methods}
              investigationDetails={ir.irInvestigation && ir.irInvestigation[0]}
              parameters={parameters}
              submitMainForm={submitMainForm}
            />
          </Box>
        )}
        <Box label="NOTES" collapsable>
          <Notes
            parameters={parameters}
            methods={methods}
            notes={notes}
            setNotes={setNotes}
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
          {
            // <button onClick={() => {}} className="btn secondary wd-100">
            //   Save
            // </button>
          }
          <button className="btn wd-100">Submit</button>
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
        const riskIncluded = watch("riskIncluded");
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
              // {...register("riskCateg")}
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

            <div className={s.riskId}>
              <section className={s.riskIncluded}>
                <label>Risk inlcuded in Risk Register?</label>
                <Radio
                  register={register}
                  name="riskIncluded"
                  options={[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ]}
                />
              </section>
              <Input
                label={<>Risk ID {riskIncluded === "true" && "*"}</>}
                {...register("riskId", {
                  required: riskIncluded === "true" ? "Enter risk ID" : false,
                })}
                error={errors.riskId}
              />
            </div>
          </div>
        );
      }}
    </ConnectForm>
  );
};

const Events = ({ events, setEvents }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEv) => {
    setEdit(null);
  }, []);

  const { remove: deleteEvent, put: updateEvent, loading } = useFetch(
    defaultEndpoints.investigationEvents + "/{ID}"
  );

  return (
    <Table
      className={s.tableOfEvents}
      key={Math.random()}
      sortable={{
        handle: ".handle",
        removeCloneOnHide: true,
        onEnd: (e) => {
          const itemEl = e.item;
          const { oldIndex, newIndex } = e;
          if (oldIndex !== newIndex) {
            let newEvents = [
              ...events.filter((item) => item.__status !== "delete"),
            ];

            const targetItem = events.find((evt, i) => i === oldIndex - 1);

            let targetIndex = events.findIndex(
              (evt) => evt.id === targetItem.id
            );

            if (newIndex > oldIndex) {
              // swap with next as long as targetIndex is smaller than newIndex
              while (targetIndex < newIndex - 1) {
                newEvents = newEvents.swap(targetIndex, targetIndex + 1);
                targetIndex = newEvents.findIndex(
                  (evt) => evt.id === targetItem.id
                );
              }
            } else if (newIndex < oldIndex) {
              // swap with previous as long as targetIndex is greater than newIndex
              while (targetIndex > newIndex - 1) {
                newEvents = newEvents.swap(targetIndex, targetIndex - 1);
                targetIndex = newEvents.findIndex(
                  (evt) => evt.id === targetItem.id
                );
              }
            }

            newEvents = newEvents.map((item, i) => ({
              ...item,
              sequence: i + 1,
              __status: "pending",
            }));

            setEvents(newEvents);
          }
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
              if (edit) {
                setEvents((prev) =>
                  prev.map((item) =>
                    item.id === newEvent.id ? newEvent : item
                  )
                );

                setEdit(null);
              } else {
                setEvents((prev) => [
                  ...prev.filter((item) => item.id !== newEvent.id),
                  newEvent,
                ]);
              }
            }}
            clearForm={() => setEdit(null)}
          />
        </td>
      </tr>
      {events
        .filter((item) => item.__status !== "delete")
        .map((ev, i) => (
          <tr key={i}>
            <td className={`handle ${s.handle}`}>
              <FaEllipsisV /> {i + 1}
            </td>
            <td className={s.dscr}>
              <span className={`${s.flag} ${ev.problem ? s.problem : ""}`}>
                <button
                  className="btn clear"
                  style={{ padding: 0, margin: 0 }}
                  disabled={loading}
                  onClick={() => {
                    setEvents((prev) =>
                      prev.map((item) =>
                        item.id === ev.id
                          ? { ...ev, problem: !ev.problem }
                          : item
                      )
                    );
                  }}
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
                        setEvents((prev) =>
                          typeof ev.id === "string"
                            ? prev.filter((item) => item.id !== ev.id)
                            : prev.map((item) =>
                                item.id === ev.id
                                  ? { ...item, __status: "delete" }
                                  : item
                              )
                        );
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
  const { user } = useContext(SiteContext);
  const { ir, setIr, updateIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveIrDetail, loading: savingIrDetail } = useFetch(
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

        const newSequence =
          irDetail.events?.sort((a, b) => (a.sequence > b.sequence ? 1 : -1))[
            irDetail.events.length - 1
          ]?.sequence + 1 || 1;

        onSuccess({
          id: Math.random().toString(36),
          ...values,
          ...(!edit && {
            sequence: newSequence,
            irInvestigation: { id: irDetail.id },
          }),
          irId: ir.id,
          __status: "pending",
        });
        return reset();
      })}
    >
      <Input
        className={s.detail}
        {...register("details", { required: "Please enter Detail" })}
        error={errors.details}
      />
      <Input
        type="datetime-local"
        {...register("dateTime", {
          required: "Please enter Date & Time",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
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

const Notes = ({ notes, setNotes, parameters }) => {
  const { user } = useContext(SiteContext);
  const { ir, setIr } = useContext(InvestigationContext);
  const { irInvestigationDetails } = useContext(IrDashboardContext);
  const [edit, setEdit] = useState(null);

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
          const selfReporting = watch("selfRep");
          const name = watch("name");
          const ipsgBreach = watch("ipsgBreach");
          if (selfReporting === "true" && name !== user.id) {
            setValue("dept", user.department);
            setValue("name", user.id);
            setValue(
              "designaion",
              user.role
                .map(
                  (role) =>
                    parameters.roles.find((r) => r.value === role)?.label ||
                    role
                )
                .join(", ")
            );
          }
          return (
            <>
              {irInvestigationDetails.find((item) => item.id === 8)?.enable && (
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
                    readOnly={selfReporting === "true"}
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
                    value={
                      parameters.departments.find(
                        (dpt) => dpt.value.toString() === dept?.toString()
                      )?.label || ""
                    }
                    readOnly
                  />
                  <Input
                    label="Designation"
                    {...register("designaion")}
                    readOnly
                  />
                </div>
              )}
              {irInvestigationDetails.find((item) => item.id === 9)?.enable && (
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
                    readOnly={ipsgBreach === "false"}
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
              )}
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
                setNotes((prev) => [
                  ...prev.filter((item) => item.id !== newNote.id),
                  newNote,
                ]);
                setEdit(null);
              }}
              clearForm={() => setEdit(null)}
            />
          </td>
        </tr>
        {notes
          .filter((ev) => ev.__status !== "delete")
          .map((note) => (
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
                          setNotes((prev) =>
                            typeof note.id === "string"
                              ? prev.filter((item) => item.id !== note.id)
                              : prev.map((item) =>
                                  item.id === note.id
                                    ? { ...item, __status: "delete" }
                                    : item
                                )
                          );
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
  const { user } = useContext(SiteContext);
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { post: saveIrDetail, loading: savingIrDetail } = useFetch(
    defaultEndpoints.irInvestigation
  );

  useEffect(() => {
    reset({
      ...edit,
      dateTime: moment({
        time: edit?.dateTime || new Date(),
        format: "YYYY-MM-DDThh:mm",
      }),
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let irDetail = ir.irInvestigation[0];
        onSuccess({
          id: Math.random().toString(36),
          ...values,
          irId: ir.id,
          irInvestigation: { id: irDetail.id },
          __status: "pending",
        });
        return reset();

        // (edit ? updateNote : saveNote)({
        //   ...edit,
        //   ...values,
        //   irId: ir.id,
        //   irInvestigation: { id: irDetail.id },
        // })
        //   .then(({ data }) => {
        //     if (data?.id) {
        //       onSuccess(data);
        //       reset();
        //     }
        //   })
        //   .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        {...register("notes", { required: "Please enter Detail" })}
        error={errors.notes}
      />
      <Input
        type="datetime-local"
        {...register("dateTime", {
          required: "Please enter Date & Time",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
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
