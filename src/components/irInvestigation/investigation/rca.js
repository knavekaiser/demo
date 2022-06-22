import { useEffect, useState, useCallback, useContext, useRef } from "react";
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
  CustomRadio,
  FishboneDiagram,
} from "../../elements";
import { ImEye } from "react-icons/im";
import {
  FaRegTrashAlt,
  FaCheck,
  FaPlus,
  FaPlusCircle,
  FaPencilAlt,
  FaFlag,
  FaMinusCircle,
  FaEllipsisV,
  FaUndo,
  FaExternalLinkAlt,
  FaTimes,
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

const Rca = () => {
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
      (ir.irInvestigation?.length ? updateIrDetail : saveIrDetail)({
        ...(ir.irInvestigation.length ?? ir.irInvestigation[0]),
        ...values,
        incidentReport: { id: ir.id },
      }).then(({ data }) => {
        if (data.id) {
          setIr((prev) => ({ ...prev, irInvestigation: [data] }));
        }
      });
    },
    [ir]
  );

  const { get: getUsers } = useFetch(defaultEndpoints.users + `?size=10000`);
  const { get: getDepartments } = useFetch(
    defaultEndpoints.departments + `?size=10000`
  );

  useEffect(() => {
    Promise.all([getUsers(), getDepartments()]).then(
      ([{ data: users }, { data: departments }]) => {
        const _parameters = {};

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
      <div className={s.rca}>
        <section className={s.rcaDate}>
          <label>Date of conducting Root Cause Analysis:</label>
          <Input
            type="date"
            value={moment({ time: new Date(), format: "YYYY-MM-DD" })}
            readOnly
          />
        </section>
        <Box collapsable label="POTENTIAL PROBLEM AREAS">
          <ProblemAreas
            events={[
              {
                id: 12,
                no: 1,
                details:
                  "The department allowed the compnay staff to work without any official information just because the ousourced people were accoumplained by the security.",
              },
              {
                id: 14,
                no: 2,
                details: "The lab is not connected to the power backup.",
              },
            ]}
          />
        </Box>
        <Box collapsable label="ROOT CAUSE">
          <RootCause
            methods={methods}
            investigationDetails={ir.irInvestigation && ir.irInvestigation[0]}
            parameters={parameters}
            submitMainForm={submitMainForm}
          />
        </Box>
        <Box label="RCA TEAM MEMBERS" collapsable>
          <RcaTeamMembers
            parameters={parameters}
            methods={methods}
            members={[
              {
                id: 2,
                userId: 15,
                deptId: 1,
                designaion: "Lab technician",
              },
              {
                id: 3,
                userId: 20,
                deptId: 4,
                designaion: "Section Incharge",
              },
            ]}
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
const RootCause = ({
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
    <div className={s.rootCause}>
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
            <>
              <div className={s.problemStatement}>
                <Input
                  label="Problem Statement"
                  {...register("problemStatement")}
                />
                <button className={`btn clear ${s.btn}`}>
                  <FaUndo /> Root Causes of similar incidents
                </button>
              </div>
              <CustomRadio
                className={s.customRadio}
                selectedClassName={s.selected}
                name="type"
                register={register}
                setValue={setValue}
                watch={watch}
                options={[
                  { label: "People", value: "people" },
                  { label: "Environments", value: "environments" },
                  { label: "Materals", value: "materals" },
                  { label: "Methods", value: "methods" },
                  { label: "Equipment", value: "equipment" },
                ]}
              />
            </>
          );
        }}
      </ConnectForm>
      <AddCauseFrom onSuccess={() => {}} />
      <Causes />
      <IdentifiedRca
        rcas={[
          {
            id: 2,
            rootCause: "No policy for handling outsource work",
            category: 3,
            details: 'Facility policy "Maintenance & PPM" to be outdated',
          },
          {
            id: 3,
            rootCause: "New equipment brought without labeling critical",
            category: 2,
            details: "Equipment validation process to be checked",
          },
        ]}
        parameters={parameters}
      />
    </div>
  );
};

const AddCauseFrom = ({ onSuccess }) => {
  const {
    handleSubmit,
    register,
    unregister,
    reset,
    formState: { errors },
    clearErrors,
  } = useForm({ shouldUnregister: true });
  const [whyIds, setWhyIds] = useState([Math.random().toString(32).substr(-8)]);

  return (
    <form
      className={s.addCause}
      onSubmit={handleSubmit((values) => {
        //
      })}
    >
      <Input
        label="Cause"
        {...register("cause", { required: "Field is required" })}
        error={errors.cause}
      />
      {whyIds.map((id, i) => (
        <Input
          key={id}
          label={i === 0 ? "Why's" : ""}
          {...register(`why.${id}`)}
          error={errors[`why.${id}`]}
          icon={
            i > 0 ? (
              <FaTimes
                onClick={() => {
                  unregister(`why.${id}`);
                  setWhyIds((prev) => prev.filter((_id) => _id !== id));
                }}
              />
            ) : null
          }
        />
      ))}
      <button
        type="button"
        onClick={() =>
          setWhyIds((prev) => [...prev, Math.random().toString(32).substr(-8)])
        }
        className={`btn clear ${s.addWhy}`}
      >
        <FaPlusCircle />
      </button>
      <button type="submit" className="btn secondary wd-100">
        Save
      </button>
    </form>
  );
};

const ProblemAreas = ({ events }) => {
  const { ir, setIr } = useContext(InvestigationContext);
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
  const { patch: updateSequence, loading: updatingSequence } = useFetch(
    defaultEndpoints.investigationEvents + `/{ID}`
  );

  return (
    <Table
      className={s.problemAreas}
      key={Math.random()}
      columns={[{ label: "S.No." }, { label: "Details" }]}
    >
      {events.map((ev, i) => (
        <tr key={i}>
          <td>{ev.no}</td>
          <td>{ev.details}</td>
        </tr>
      ))}
    </Table>
  );
};

const RcaTeamMembers = ({ members, parameters }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);
  const { remove: deleteNote } = useFetch(
    defaultEndpoints.investigationNotes + "/{ID}"
  );
  return (
    <Table
      columns={[
        { label: "Name" },
        { label: "Department" },
        { label: "Designation" },
        { label: "Actions" },
      ]}
      className={s.rcaTeamMembers}
    >
      <tr>
        <td className={s.inlineForm}>
          <RcaTeamMemberForm
            key={edit ? "edit" : "add"}
            edit={edit}
            parameters={parameters}
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
      {members.map((member) => (
        <tr key={member.id}>
          <td>
            {parameters.users.find((user) => user.value === member.userId)
              ?.label || member.userId}
          </td>
          <td>
            {parameters.departments.find((user) => user.value === member.deptId)
              ?.label || member.deptId}
          </td>
          <td>{member.designaion}</td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => {
                  setEdit(member);
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
                        params: { "{ID}": member.id },
                      }).then(({ res }) => {
                        if (res.status === 204) {
                          setIr((prev) => ({
                            ...prev,
                            irInvestigation: [
                              {
                                ...prev.irInvestigation[0],
                                notes: [
                                  ...prev.irInvestigation[0].notes.filter(
                                    (item) => item.id !== member.id
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
const RcaTeamMemberForm = ({ edit, onSuccess, parameters, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    control,
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
      <Select
        options={parameters.users}
        name="userId"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Select
        options={parameters.departments}
        name="deptId"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Input
        {...register("designaion", { required: "Field is required" })}
        error={errors.designaion}
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

const Causes = ({}) => {
  const [causes, setCauses] = useState({
    People: {
      Secretary: ["Heavy Workload", "Unavailable when", "Lab called"],
      Escort: [],
      Pholebotomist: [],
      Dispather: ["Heavy Workload", "No tracing processes"],
      // "Lab tech": [],
      // asdgasPholebotomist: [],
      // Dispaasasdfdther: ["Heavy Workload", "No tracing processes"],
      // "Lab tasdfech": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboadsftomist: [],
      // Dispatasdfher: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
    },
    Environment: {
      Clocks: ["Inaccurate", "Don't agree"],
      Rounding: [],
    },
    Materials: {
      "Lab Supplies": [
        // "Unavailable",
        "Spoiled",
      ],
      Specimen: [
        // "Unavailable", "Spoiled"
      ],
    },
    Methods: {
      "Too many people Involved": [],
      "Handling in lab": [],
      "Escort Stopped Other places": [],
      "Unnecessary steps": [],
      "Lab not following FIFO": [],
    },
    Equipment: {
      Broken: [],
      asdgasPholebotomist: [],
      Dispaasasdfdther: ["Heavy Workload", "No tracing processes"],
      // "Lab tasdfech": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboadsftomist: [],
      // Dispatasdfher: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // Pholeboasdftomist: [],
      // Dispathasdfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasdfch": [],
      // asdgasPhol23423ebotomist: [],
      // Dispaasasd23423fdther: ["Heavy Workload", "No tracing processes"],
      // "Lab tasdf23423ech": [],
      // Pholeboasdf23423tomist: [],
      // Dispathas23423dfer: ["Heavy Workload", "No tracing processes"],
      // "Lab teas23423dfch": [],
      // Pholeboas23423dftomist: [],
      // Dispathasd23423fer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasd23423fch": [],
      // Pholeboads23423ftomist: [],
      // Dispatasdfh23423er: ["Heavy Workload", "No tracing processes"],
      // "Lab teasd23423fch": [],
      // Pholeboasd23423ftomist: [],
      // Dispathasd23423fer: ["Heavy Workload", "No tracing processes"],
      // "Lab teasd23423fch": [],
      // "Needs to lo23423oked at": [],
    },
  });
  const [showDiagram, setShowDiagram] = useState(false);
  return (
    <div className={s.causeBreakdown}>
      <button
        className={`btn clear ${s.btn}`}
        onClick={() => setShowDiagram(true)}
      >
        <FaExternalLinkAlt /> Generate Fishbone Diagram
      </button>
      <ul className={s.wrapper}>
        {Object.entries(causes).map(([key, value]) => (
          <li key={key}>
            <p className={s.type}>{key}</p>
            <ul className={s.causes}>
              {Object.entries(value).map(([key, value]) => (
                <li key={key} className={s.cause}>
                  <div className={s.causeLabel}>
                    <p>{key}</p>{" "}
                    <button className={`btn clear ${s.btn}`}>
                      <FaPencilAlt />
                    </button>
                    <button className={`btn clear ${s.btn}`}>
                      <FaRegTrashAlt />
                    </button>
                  </div>
                  {value?.length > 0 && (
                    <ul className={s.whys}>
                      {value.map((item, i) => (
                        <li key={i} className={s.why}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Modal
        open={showDiagram}
        setOpen={setShowDiagram}
        head
        label="Fishbone Diagram"
      >
        <FishboneDiagram data={causes} />
      </Modal>
    </div>
  );
};

const IdentifiedRca = ({ rcas, parameters }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);
  const { remove: deleteNote } = useFetch(
    defaultEndpoints.investigationNotes + "/{ID}"
  );
  return (
    <div>
      <p className={s.tableLable}>Identified Root Cause</p>
      <Table
        columns={[
          { label: "Name" },
          { label: "Department" },
          { label: "Designation" },
          { label: "Actions" },
        ]}
        className={s.rcaTeamMembers}
      >
        <tr>
          <td className={s.inlineForm}>
            <RcaTeamMemberForm
              key={edit ? "edit" : "add"}
              edit={edit}
              parameters={parameters}
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
        {rcas.map((member) => (
          <tr key={member.id}>
            <td>{member.rootCause}</td>
            <td>
              {parameters.category?.find(
                (user) => user.value === member.category
              )?.label || member.category}
            </td>
            <td>{member.details}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(member);
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
                          params: { "{ID}": member.id },
                        }).then(({ res }) => {
                          if (res.status === 204) {
                            setIr((prev) => ({
                              ...prev,
                              irInvestigation: [
                                {
                                  ...prev.irInvestigation[0],
                                  notes: [
                                    ...prev.irInvestigation[0].notes.filter(
                                      (item) => item.id !== member.id
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
const IdentifiedRcaForm = ({ edit, onSuccess, parameters, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    control,
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
      <Select
        options={parameters.users}
        name="userId"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Select
        options={parameters.departments}
        name="deptId"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Input
        {...register("designaion", { required: "Field is required" })}
        error={errors.designaion}
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

export default Rca;
