import { useEffect, useState, useCallback, useContext } from "react";
import s from "./style.module.scss";
import { Box } from "../../incidentReport";
import { SiteContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import {
  Select,
  Table,
  TableActions,
  Combobox,
  Input,
  Textarea,
  Moment,
  moment,
  Toggle,
} from "../../elements";
import { FaRegTrashAlt, FaCheck, FaPlus, FaHeartbeat } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { useFetch } from "../../../hooks";
import { endpoints as defaultEndpoints, permissions } from "../../../config";
import { Prompt, Modal } from "../../modal";
import { useForm } from "react-hook-form";

const Capa = () => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [parameters, setParameters] = useState({
    users: [],
    departments: [],
    roles: permissions.map((p) => ({ value: p.id, label: p.label })),
  });
  const [requestInput, setRequestInput] = useState(false);
  const { handleSubmit } = useForm();

  const {
    post: saveIrDetail,
    put: updateIrDetail,
    savingIrDetail,
  } = useFetch(
    defaultEndpoints.irInvestigation +
      (ir.irInvestigation?.length ? `/${ir.irInvestigation[0].id}` : ""),
    {
      validator: { sequence: /^.+$/gi },
    }
  );

  const { get: getUsers } = useFetch(defaultEndpoints.users + `?size=10000`);
  const { get: getDepartments } = useFetch(
    defaultEndpoints.departments + `?size=10000`
  );
  const { get: getCapaPlanCategories } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10012"
  );
  const { get: getMethodoloy } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10013"
  );
  const { get: getFrequency } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10014"
  );
  const { get: getToolUsed } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10015"
  );
  const { get: getCapaPlanStatus } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10016"
  );

  useEffect(() => {
    Promise.all([
      getUsers(),
      getDepartments(),
      getCapaPlanCategories(),
      getMethodoloy(),
      getFrequency(),
      getToolUsed(),
      getCapaPlanStatus(),
    ]).then(
      ([
        { data: users },
        { data: departments },
        { data: capaPlanCategories },
        { data: methodologies },
        { data: frequencies },
        { data: toolUsed },
        { data: capaPlanStatus },
      ]) => {
        const _parameters = {};

        if (users?._embedded.user) {
          _parameters.users = users._embedded.user.map((user) => ({
            label: user.name,
            value: user.id,
            department: user.department,
            designation: user.designation,
            role: [...user.role].map((role) => +role).filter((item) => item),
          }));
        }

        if (departments?._embedded?.department) {
          _parameters.departments = departments._embedded.department.map(
            (dept) => ({ label: dept.name, value: dept.id })
          );
        }

        if (capaPlanCategories?.twoFieldMasterDetails) {
          _parameters.capaPlanCategories =
            capaPlanCategories.twoFieldMasterDetails.filter(
              (item) => item.showToggle
            );
        }

        if (methodologies?.twoFieldMasterDetails) {
          _parameters.methodologies =
            methodologies.twoFieldMasterDetails.filter(
              (item) => item.showToggle
            );
        }

        if (frequencies?.twoFieldMasterDetails) {
          _parameters.frequencies = frequencies.twoFieldMasterDetails.filter(
            (item) => item.showToggle
          );
        }

        if (toolUsed?.twoFieldMasterDetails) {
          _parameters.toolUsed = toolUsed.twoFieldMasterDetails.filter(
            (item) => item.showToggle
          );
        }

        if (capaPlanStatus?.twoFieldMasterDetails) {
          _parameters.capaPlanStatus =
            capaPlanStatus.twoFieldMasterDetails.filter(
              (item) => item.showToggle
            );
        }

        setParameters((prev) => ({ ...prev, ..._parameters }));
      }
    );
  }, []);

  const [capaPlan, setCapaPlan] = useState(ir.capaPlan || []);
  const [rcaTeam, setRcaTeam] = useState(ir.rcaTeam || []);

  const {
    post: saveRcaTeam,
    put: updateRcaTeam,
    remove: deleteRcaTeam,
    loading: loadingRcaTeam,
  } = useFetch(defaultEndpoints.rcaTeam + `/{ID}`);
  const {
    post: saveCapaPlan,
    put: updateCapaPlan,
    remove: deleteCapaPlan,
    loading: laodingCalaPlan,
  } = useFetch(defaultEndpoints.capaPlan + `/{ID}`);
  const {
    post: saveCapaMonitoringPlan,
    put: updateCapaMonitoringPlan,
    loading: loadingCapaMonitoringPlan,
  } = useFetch(defaultEndpoints.capaMonitoringPlan + `/{ID}`);

  const submitMainForm = useCallback(
    (values) => {
      const capaMonitoringPlan = capaPlan
        .map((item) =>
          item.capaMonitoringPlan?.[0]?.action
            ? item.capaMonitoringPlan[0]
            : null
        )
        .filter((item) => item);
      Promise.all([
        ...rcaTeam
          .filter((item) => ["delete", "edit", "add"].includes(item.action))
          .map((item) => {
            if (item.action === "delete") {
              return deleteRcaTeam(null, { params: { "{ID}": item.id } });
            }
            if (item.action === "add") {
              return saveRcaTeam(
                { ...item, incidentReport: { id: ir.id }, id: undefined },
                { params: { "{ID}": "" } }
              );
            }
            if (item.action === "edit") {
              return updateRcaTeam(
                { ...item, incidentReport: { id: ir.id }, id: undefined },
                { params: { "{ID}": item.id } }
              );
            }
          }),
        ...capaPlan
          .filter((item) => ["delete", "edit", "add"].includes(item.action))
          .map((item) => {
            if (item.action === "delete") {
              return deleteCapaPlan(null, { params: { "{ID}": item.id } });
            }

            return (item.action === "add" ? saveCapaPlan : updateCapaPlan)(
              {
                ...item,
                incidentReport: { id: ir.id },
                ir_id: ir.id,
                id: undefined,
                capaMonitoringPlan: undefined,
                capaMonitoring: undefined,
              },
              {
                params: { "{ID}": item.action === "add" ? "" : item.id },
              }
            ).then(async (resp) => {
              if (resp.data?.id) {
                if (item.capaMonitoringPlan?.length) {
                  const _capaMonitoringPlan = item.capaMonitoringPlan[0];
                  const { data: monitoringPlan } =
                    await (_capaMonitoringPlan.action === "add"
                      ? saveCapaMonitoringPlan
                      : updateCapaMonitoringPlan)(
                      {
                        ..._capaMonitoringPlan,
                        id: undefined,
                        incidentReport: { id: ir.id },
                        capaPlan: { id: resp.data.id },
                      },
                      {
                        params: {
                          "{ID}":
                            _capaMonitoringPlan.action === "add"
                              ? ""
                              : _capaMonitoringPlan.id,
                        },
                      }
                    );

                  if (monitoringPlan?.id) {
                    resp.data.capaMonitoringPlan = [monitoringPlan];
                  }
                }
              }
              return resp;
            });
          }),
      ])
        .then((resps) => {
          const _rcaTeam = resps
            .filter((item) => item?.data?.designation)
            .map((item) => item.data);
          const _capaPlan = resps
            .filter((item) => item?.data?.actionPlan)
            .map((item) => item.data);
          setIr((prev) => ({
            ...prev,
            rcaTeam: [..._rcaTeam, ...rcaTeam.filter((item) => !item.action)],
            capaPlan: [
              ..._capaPlan,
              ...capaPlan.filter((item) => !item.action),
            ],
          }));
          Prompt({
            type: "success",
            message: "Updates have been saved.",
          });
        })
        .catch((err) =>
          Prompt({
            type: "error",
            message: err.message,
          })
        );
    },
    [ir, rcaTeam, capaPlan]
  );

  useEffect(() => {
    setCapaPlan(ir.capaPlan || []);
  }, [ir.capaPlan]);
  useEffect(() => {
    setRcaTeam(ir.rcaTeam || []);
  }, [ir.rcaTeam]);

  return (
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
        <RootCause />
      </Box>

      <Box label="CORRECT & PREVENTIVE ACTION PLANS" collapsable>
        <PreventiveActionPlans
          capaPlan={capaPlan}
          setCapaPlan={setCapaPlan}
          parameters={parameters}
        />
      </Box>

      <Box label="IR TEAM MEMBERS" collapsable>
        <RcaTeamMembers
          rcaTeam={rcaTeam}
          setRcaTeam={setRcaTeam}
          parameters={parameters}
        />
      </Box>

      <form className={s.btns} onSubmit={handleSubmit(submitMainForm)}>
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
  );
};

const ProblemAreas = ({ events }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEv) => {
    setEdit(null);
  }, []);

  const {
    remove: deleteEvent,
    put: updateEvent,
    loading,
  } = useFetch(defaultEndpoints.investigationEvents + "/{ID}");
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

const RootCause = () => {
  const { ir } = useContext(InvestigationContext);
  const [rcas, setRcas] = useState([]);
  const { get: getRcas } = useFetch(defaultEndpoints.rcas);
  useEffect(() => {
    getRcas().then(({ data }) => {
      if (data?._embedded) {
        setRcas(data._embedded.rca);
      }
    });
  }, []);
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
      {(ir.rcaIdentified || []).map((cz, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{cz.rootCause}</td>
          <td>
            {rcas.find((item) => item.id === cz.rcaCat)?.name || cz.rcaCat}
          </td>
          <td>{cz.details}</td>
        </tr>
      ))}
    </Table>
  );
};

const Data = ({ label, value }) => {
  return (
    <section className={s.data}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </section>
  );
};

const PreventiveActionPlans = ({ capaPlan, setCapaPlan, parameters }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [edit, setEdit] = useState(null);
  const [monitoringPlan, setMonitoringPlan] = useState(null);
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
              onSuccess={(data) => {
                setCapaPlan((prev) =>
                  edit
                    ? prev.map((item) =>
                        item.id === data.id
                          ? {
                              ...data,
                              action:
                                typeof data.id === "string" ? "add" : "edit",
                            }
                          : item
                      )
                    : [{ ...data, action: "add" }, ...prev]
                );
                setEdit(null);
              }}
              clearForm={() => setEdit(null)}
            />
          </td>
        </tr>
        {capaPlan
          .filter((item) => item.action !== "delete")
          .map((plan) => (
            <tr key={plan.id}>
              <td>{plan.actionPlan}</td>
              <td>{plan.details}</td>
              <td>
                {parameters.capaPlanCategories?.find(
                  (item) => item.id === +plan.category
                )?.name || plan.category}
              </td>
              {plan.monitorEff ? (
                <td
                  className={s.planMonitoringYes}
                  onClick={() => setMonitoringPlan(plan)}
                >
                  Yes <FaHeartbeat />
                </td>
              ) : (
                <td>No</td>
              )}
              <td>
                {(() => {
                  const user = parameters.users?.find(
                    (user) => user.value === plan.responsibility
                  );
                  if (user) {
                    return (
                      <>
                        <span>{user.label}</span>
                        <br />
                        {user.designation && (
                          <>
                            <span>{user.designation}</span>
                            <br />
                          </>
                        )}
                        <span>
                          {parameters.departments?.find(
                            (item) => item.value === user.department
                          )?.label || user.department}
                        </span>
                      </>
                    );
                  }
                  return plan.responsibility;
                })()}
              </td>
              <td>
                <Moment format="DD/MM/YYYY">{plan.deadline}</Moment>
              </td>
              <td>
                {parameters.capaPlanStatus?.find(
                  (item) => item.id === plan.status
                )?.name || plan.status}
              </td>
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
                          setCapaPlan((prev) =>
                            prev
                              .map((item) =>
                                item.id === plan.id
                                  ? typeof plan.id === "string"
                                    ? null
                                    : { ...plan, action: "delete" }
                                  : item
                              )
                              .filter((item) => item)
                          );
                        },
                      }),
                  },
                ]}
              />
            </tr>
          ))}
      </Table>
      <p>CAPA monitoring responsiblities: IR investigator 2</p>
      <Modal
        open={monitoringPlan}
        setOpen={() => setMonitoringPlan(null)}
        head
        label="CAPA MONITORING PLAN"
        className={s.monitoringPlanModal}
      >
        <MonitoringPlanModal
          plan={monitoringPlan}
          parameters={parameters}
          onSuccess={(data) => {
            setCapaPlan((prev) =>
              prev.map((item) =>
                item.id === data.capaPlan.id
                  ? {
                      ...item,
                      capaMonitoringPlan: [
                        {
                          ...data,
                          action: typeof data.id === "string" ? "add" : "edit",
                        },
                      ],
                      action: typeof item.id === "string" ? "add" : "edit",
                    }
                  : item
              )
            );
            setMonitoringPlan(null);
          }}
        />
      </Modal>
    </>
  );
};
const MonitoringPlanModal = ({ plan, parameters, onSuccess }) => {
  const { irTypes } = useContext(SiteContext);
  const { ir } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const edit = plan?.capaMonitoringPlan && plan.capaMonitoringPlan[0];
    reset({
      ...edit,
      startDate: edit?.startDate?.substr(0, 10) || "",
      endDate: edit?.endDate?.substr(0, 10) || "",
      deadline: edit?.deadline?.substr(0, 10) || "",
    });
  }, [plan]);
  return (
    <div className={s.monitoringPlanModalContent}>
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
              (item) => item.value?.toString() === ir?.typeofInci?.toString()
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
          label="Sub Category"
          value={
            parameters?.categories
              ?.find(
                (item) => item.id?.toString() === ir?.inciCateg?.toString()
              )
              ?.subCategorys?.find(
                (item) => item.id?.toString() === ir?.inciSubCat?.toString()
              )?.name || ir?.inciSubCat
          }
        />
        <Data
          label="Location"
          value={
            parameters?.locations?.find(
              (item) => item.value?.toString() === ir?.location?.toString()
            )?.label || ir?.location
          }
        />
      </div>

      <form
        onSubmit={handleSubmit((values) => {
          const edit = plan?.capaMonitoringPlan && plan.capaMonitoringPlan[0];
          onSuccess({
            ...values,
            capaPlan: { id: plan.id },
            id: edit?.id || Math.random().toString(32).substr(-8),
          });
        })}
      >
        <Combobox
          label="Methodology"
          name="methodology"
          watch={watch}
          register={register}
          formOptions={{ required: "Field is required" }}
          setValue={setValue}
          placeholder="Select"
          options={parameters.methodologies?.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          error={errors.methodology}
          clearErrors={clearErrors}
        />

        <Input
          label="Title"
          {...register("title", { required: "Field is required" })}
          error={errors.title}
        />

        <Combobox
          label="Frequency"
          name="freq"
          watch={watch}
          register={register}
          setValue={setValue}
          placeholder="Select"
          formOptions={{ required: "Field is required" }}
          options={parameters.frequencies?.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          error={errors.freq}
          clearErrors={clearErrors}
        />

        <Input
          type="date"
          label="Start date for CAPA monitoring"
          {...register("startDate", {
            required: "Field is required",
            // validate: (v) => {
            //   if (v) {
            //     return (
            //       new Date(v) < new Date() || "Can not select date from future"
            //     );
            //   }
            //   return "Select Date & Time";
            // },
          })}
          error={errors.startDate}
        />

        <Input
          type="date"
          label="End date for CAPA monitoring"
          {...register("endDate", {
            required: "Field is required",
            // validate: (v) => {
            //   if (v) {
            //     return (
            //       new Date(v) < new Date() || "Can not select date from future"
            //     );
            //   }
            //   return "Select Date & Time";
            // },
          })}
          error={errors.endDate}
        />

        <Combobox
          label="Tool Used"
          name="toolUsed"
          watch={watch}
          register={register}
          formOptions={{ required: "Field is required" }}
          setValue={setValue}
          placeholder="Select"
          options={parameters.toolUsed?.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          error={errors.toolUsed}
          clearErrors={clearErrors}
        />

        <Input
          label="Sample size"
          {...register("sampleSize", { required: "Field is required" })}
          error={errors.sampleSize}
        />

        <Input
          label="Deadline"
          type="date"
          {...register("deadline", {
            required: "Field is required",
            // validate: (v) => {
            //   if (v) {
            //     return (
            //       new Date(v) < new Date() || "Can not select date from future"
            //     );
            //   }
            //   return "Select Date & Time";
            // },
          })}
          error={errors.deadline}
        />

        <Textarea
          className={s.details}
          label="Details"
          {...register("details", { required: "Field is required" })}
          error={errors.details}
        />

        <div className={s.btns}>
          <button
            className="btn secondary wd-100"
            type="button"
            onClick={() => reset()}
          >
            Clear
          </button>
          <button className="btn primary wd-100" type="submit">
            Sumit
          </button>
        </div>
      </form>
    </div>
  );
};
const PreventiveActionPlansForm = ({
  edit,
  onSuccess,
  parameters,
  clearForm,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset({ ...edit, deadline: edit?.deadline?.substr(0, 10) || "" });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        onSuccess({
          ...edit,
          ...values,
          id: edit?.id || Math.random().toString(32).substr(-8),
        });
        reset({
          actionPlan: "",
          details: "",
          category: "",
          monitorEff: "",
          responsibility: "",
          deadline: "",
          status: "",
        });
      })}
    >
      <Input
        {...register("actionPlan", { required: "Field is required" })}
        error={errors.actionPlan}
      />
      <Input
        {...register("details", { required: "Field is required" })}
        error={errors.details}
      />
      <Combobox
        name="category"
        watch={watch}
        register={register}
        formOptions={{ required: "Field is required" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters.capaPlanCategories?.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        error={errors.category}
        clearErrors={clearErrors}
      />
      <Toggle
        name="monitorEff"
        register={register}
        required
        watch={watch}
        setValue={setValue}
      />
      <Select
        options={parameters.users}
        name="responsibility"
        control={control}
        formOptions={{ required: "Field is required" }}
      />
      <Input
        type="date"
        {...register("deadline", { required: "Field is required" })}
        error={errors.deadline}
      />
      <Combobox
        name="status"
        watch={watch}
        register={register}
        formOptions={{ required: "Field is required" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters.capaPlanStatus?.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        error={errors.status}
        clearErrors={clearErrors}
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

const RcaTeamMembers = ({ rcaTeam, setRcaTeam, parameters }) => {
  const [edit, setEdit] = useState(null);
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
            onSuccess={(data) => {
              setRcaTeam((prev) =>
                edit
                  ? prev.map((item) =>
                      item.id === data.id
                        ? {
                            ...data,
                            action:
                              typeof data.id === "string" ? "add" : "edit",
                          }
                        : item
                    )
                  : [{ ...data, action: "add" }, ...prev]
              );
              setEdit(null);
            }}
            clearForm={() => setEdit(null)}
          />
        </td>
      </tr>
      {rcaTeam
        .filter((item) => item.action !== "delete")
        .map((member) => (
          <tr key={member.id}>
            <td>
              {parameters.users.find((user) => user.value === member.userName)
                ?.label || member.userName}
            </td>
            <td>
              {parameters.departments.find((user) => user.value === member.dept)
                ?.label || member.dept}
            </td>
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
                      message: `Are you sure you want to remove this note?`,
                      callback: () => {
                        setRcaTeam((prev) =>
                          prev
                            .map((item) =>
                              item.id === member.id
                                ? typeof member.id === "string"
                                  ? null
                                  : { ...member, action: "delete" }
                                : item
                            )
                            .filter((item) => item)
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
const RcaTeamMemberForm = ({ edit, onSuccess, parameters, clearForm }) => {
  const { ir, setIr } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [user, setUser] = useState(null);

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        onSuccess({
          ...values,
          id: edit?.id || Math.random().toString(32).substr(-8),
        });
        reset({ userId: "", deptId: "", designation: "" });
      })}
      data-testid="irTeamMemberForm"
    >
      <Select
        options={parameters.users}
        name="userName"
        control={control}
        formOptions={{ required: "Field is required" }}
        onChange={(user) => {
          if (user.department) {
            setValue("dept", user.department);
          }
          if (user.designation) {
            setValue("designation", user.designation);
          }
          setUser(user);
        }}
      />
      <Select
        options={parameters.departments}
        name="dept"
        control={control}
        formOptions={{ required: "Field is required" }}
        readOnly={user?.department}
      />
      <Input
        {...register("designation", { required: "Field is required" })}
        error={errors.designation}
        readOnly={user?.designation}
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
