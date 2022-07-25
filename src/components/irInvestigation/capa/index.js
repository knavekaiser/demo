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
  Toggle,
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

const Capa = () => {
  const { ir, setIr } = useContext(InvestigationContext);
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
      <div className={s.mainContainer}>
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
            causes={[
              {
                no: 1,
                rootCause: "No policy for handling oursources work",
                category: "Policy update",
                detail: 'Facility policy "Maintenance & PPM" to be updated',
              },
              {
                no: 1,
                rootCause: "New equipment brought without labeling critical",
                category: "Equipment management",
                detail: "Equipment validation process to be checked",
              },
              {
                no: 1,
                rootCause: "Allowed work without permission",
                category: "Staff negligence",
                detail:
                  "Lab safety office was infomed but did not act reponsibly",
              },
            ]}
          />
        </Box>

        <Box label="CORRECT & PREVENTIVE ACTION PLANS" collapsable>
          <PreventiveActionPlans
            parameters={parameters}
            methods={methods}
            actionPlans={[
              {
                id: 2,
                plan: "Labe safety officer to be counselled",
                detail:
                  "Counselling to be done to ensure facility team is informed for any outsources work",
                category: "Staff counselling",
                monitoring: "No",
                responsiblities: "Henry\nHead of the Department\nLeboratary",
                status: "In-Progress",
                deadline: "2022-07-31",
              },
              {
                id: 2,
                plan: "Identify list of critical equipments",
                detail: "Indentity list of critical equipments",
                category: "Equipment Management",
                monitoring: "Yes",
                responsiblities: "Henry\nHead of the Department\nLeboratary",
                status: "Completed",
                deadline: "2022-07-31",
              },
            ]}
          />
        </Box>

        <Box label="IR TEAM MEMBERS" collapsable>
          <IrTeamMembers
            parameters={parameters}
            methods={methods}
            members={[
              {
                id: 2,
                name: "Joseph",
                department: "Laboratory",
                designation: "Lab technician",
              },
              {
                id: 2,
                name: "Williams",
                department: "Laboratory",
                designation: "Lab technician",
              },
            ]}
          />
        </Box>

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

const ProblemAreas = ({ events }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEv) => {
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

const RootCause = ({ causes }) => {
  return (
    <Table
      className={s.rootCauses}
      key={Math.random()}
      columns={[
        { label: "S.No." },
        { label: "Identified root cause" },
        { label: "Category" },
        { label: "Details" },
      ]}
    >
      {causes.map((cz, i) => (
        <tr key={i}>
          <td>{cz.no}</td>
          <td>{cz.rootCause}</td>
          <td>{cz.category}</td>
          <td>{cz.detail}</td>
        </tr>
      ))}
    </Table>
  );
};

const PreventiveActionPlans = ({ actionPlans, parameters }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);
  const { remove: deleteNote } = useFetch(
    defaultEndpoints.investigationNotes + "/{ID}"
  );
  return (
    <>
      <Table
        columns={[
          { label: "Action plans" },
          { label: "Details" },
          { label: "Category" },
          { label: "Monitor Effectiveness" },
          { label: "Responsibility" },
          { label: "Deadline" },
          { label: "Status" },
          { label: "Actions" },
        ]}
        className={s.preventiveActionPlans}
      >
        <tr>
          <td className={s.inlineForm}>
            <PreventiveActionPlansForm
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
        {actionPlans.map((plan) => (
          <tr key={plan.id}>
            <td>{plan.plan}</td>
            <td>{plan.detail}</td>
            <td>{plan.category}</td>
            <td>{plan.monitoring}</td>
            <td>{plan.responsiblities}</td>
            <td>{plan.deadline}</td>
            <td>{plan.status}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(plan);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Action Plan?`,
                      callback: () => {
                        // deleteNote(null, {
                        //   params: { "{ID}": member.id },
                        // }).then(({ res }) => {
                        //   if (res.status === 204) {
                        //     setIr((prev) => ({
                        //       ...prev,
                        //       irInvestigation: [
                        //         {
                        //           ...prev.irInvestigation[0],
                        //           notes: [
                        //             ...prev.irInvestigation[0].notes.filter(
                        //               (item) => item.id !== member.id
                        //             ),
                        //           ],
                        //         },
                        //       ],
                        //     }));
                        //   }
                        // });
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      <p>CAPA monitoring responsiblities: IR investigator 2</p>
    </>
  );
};
const PreventiveActionPlansForm = ({
  edit,
  onSuccess,
  parameters,
  clearForm,
}) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
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
      <Input
        {...register("plan", { required: "Field is required" })}
        error={errors.plan}
      />
      <Input
        {...register("detail", { required: "Field is required" })}
        error={errors.detail}
      />
      <Combobox
        name="category"
        watch={watch}
        register={register}
        setValue={setValue}
        placeholder="Select"
        options={[
          { value: "description", label: "Description" },
          { value: "deptInv", label: "Departments Involved" },
          { value: "personAff", label: "Person Affected" },
          { value: "categoryTemplate", label: "Category Template" },
        ]}
      />
      <Toggle
        name="monitor"
        register={register}
        required
        watch={watch}
        setValue={setValue}
      />
      <Select
        options={parameters.responsiblities}
        name="responsiblities"
        multiple
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Input
        type="datetime-local"
        {...register("deadline", { required: "Field is required" })}
        error={errors.deadline}
      />
      <span />
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

const IrTeamMembers = ({ members, parameters }) => {
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
      className={s.irTeamMembers}
    >
      <tr>
        <td className={s.inlineForm}>
          <IrTeamMembersForm
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
          <td>{member.name}</td>
          <td>{member.department}</td>
          <td>{member.designation}</td>
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
                    message: `Are you sure you want to remove this Member?`,
                    callback: () => {
                      // deleteNote(null, {
                      //   params: { "{ID}": member.id },
                      // }).then(({ res }) => {
                      //   if (res.status === 204) {
                      //     setIr((prev) => ({
                      //       ...prev,
                      //       irInvestigation: [
                      //         {
                      //           ...prev.irInvestigation[0],
                      //           notes: [
                      //             ...prev.irInvestigation[0].notes.filter(
                      //               (item) => item.id !== member.id
                      //             ),
                      //           ],
                      //         },
                      //       ],
                      //     }));
                      //   }
                      // });
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
const IrTeamMembersForm = ({ edit, onSuccess, parameters, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
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
        name="name"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Select
        options={parameters.departments}
        name="department"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Input
        {...register("designation", { required: "Field is required" })}
        error={errors.designation}
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

export default Capa;
