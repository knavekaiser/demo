import React, { useState, useEffect, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Link } from "react-router-dom";
import { FaInfoCircle, FaRegTrashAlt, FaPlus } from "react-icons/fa";
import { BiChevronsDown, BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { BsPencilFill } from "react-icons/bs";
import {
  Input,
  Combobox,
  FileInput,
  Textarea,
  SwitchInput,
  Radio,
  Chip,
  Table,
  TableActions,
  Checkbox,
  moment,
} from "./elements";
import { Prompt } from "./modal";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import s from "./incidentReporting.module.scss";

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();
  return children({ ...methods });
};
export default function IncidentReporting() {
  const { user } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();
  const methods = useForm();
  const [edit, setEdit] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [actionsTaken, setActionsTaken] = useState([
    {
      action:
        "Patient monitored for hour, vitals were stable and informed physician",
      actionTakenBy: {
        name: "Robert",
        id: "asdfasddd",
      },
      date: "2021-12-21T10:17:12.514Z",
    },
  ]);
  const [witnesses, setWitnesses] = useState([
    { name: "Jossi", department: "Nursing" },
  ]);
  const [notified, setNotified] = useState([
    {
      name: "Heilena",
      department: "Nursing",
      date: "2021-12-21T10:17:12.514Z",
    },
  ]);
  const [anonymous, setAnonymous] = useState(false);
  const involvedDept = methods.watch("deptsLookupMultiselect");
  const patientComplaint = methods.watch("patientYesOrNo");
  useEffect(() => {
    if (location.state?.edit) {
      const { edit, readOnly } = location.state;
      if (readOnly) setReadOnly(true);
      setEdit(edit);
    }
  }, [location]);
  useEffect(() => {
    if (edit) {
      const _edit = {
        ...edit,
        incident_Date_Time: moment({
          format: "YYYY-MM-DDThh:mm",
          time: edit.incident_Date_Time,
        }),
        complaIntegerDatetime: moment({
          format: "YYYY-MM-DDThh:mm",
          time: edit.complaIntegerDatetime,
        }),
        preventability: edit.preventability?.toString() || "",
        typeofInci: edit.typeofInci?.toString() || "",
        deptsLookupMultiselect:
          edit.deptsLookupMultiselect?.split(",").map((item) => +item) || "",
      };
      methods.reset(_edit);
    }
  }, [edit]);
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/location`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/department`).then((res) =>
        res.json()
      ),
      fetch(`${process.env.REACT_APP_HOST}/user`).then((res) => res.json()),
    ]).then(([location, department, users]) => {
      const _parameters = { ...parameters };
      if (location?._embedded.location) {
        _parameters.locations = location._embedded.location.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      }
      if (department?._embedded.department) {
        _parameters.departments = department._embedded.department.map(
          (item) => ({
            label: item.name,
            value: item.id,
          })
        );
      }
      if (users?._embedded.user) {
        _parameters.hods = users._embedded.user
          .filter((u) => u.role === 12 && u.department === user.department)
          .map((item) => ({
            label: item.name,
            value: item.id,
          }));
      }
      setParameters(_parameters);
    });
  }, []);
  return (
    <div className={s.container} data-testid="incidentReportingForm">
      <header>
        <h3>REPORT AN INCIDENT {readOnly && <span>(View)</span>}</h3>
        <span className={s.subHead}>
          <span className={s.note}>
            <FaInfoCircle /> There is a blame free reporting culture. No
            punitive measure will be taken against any staff reporting any
            incident.
          </span>
          <section>
            <input
              type="checkbox"
              id="anonymous"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(!anonymous)}
            />
            <label htmlFor="anonymous">Report Anonymously</label>
          </section>
        </span>
      </header>
      <FormProvider {...methods}>
        <form
          className={s.content}
          style={readOnly ? { pointerEvents: "none" } : {}}
          onSubmit={methods.handleSubmit((data) => {
            const postData = () => {
              fetch(
                `${process.env.REACT_APP_HOST}/IncidentReport${
                  edit ? `/${edit.id}` : ""
                }`,
                {
                  method: edit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contribFactorYesOrNo: true,
                    contribFactor: 3,
                    template: "52121",
                    ...data,
                    deptsLookupMultiselect:
                      data.deptsLookupMultiselect?.join(",") || "",
                    ...(anonymous
                      ? {
                          userId: undefined,
                          department: undefined,
                        }
                      : {
                          userId: user.id,
                          department: user.department,
                        }),
                    headofDepart: "123",
                    incidentReportedDept: "1212",
                  }),
                }
              )
                .then((res) => res.json())
                .then((data) => {
                  if (data.id) {
                    if (edit) {
                      navigate(location.state.from, {
                        state: { focus: location.state.focus },
                      });
                      return;
                    }
                    Prompt({
                      type: "success",
                      message: "Incident was successfully reported.",
                    });
                    methods.reset();
                  }
                  if (data.cause) {
                    Prompt({
                      type: "error",
                      message: data.message,
                    });
                  }
                })
                .catch((err) => {
                  Prompt({
                    type: "error",
                    message: err.message,
                  });
                });
            };
            if (data.status === "Submitted") {
              Prompt({
                type: "confirmation",
                message: anonymous
                  ? "This incident will be submitted as Anonymous report. You will not be able to view or track the IR status. Do you wish to continue"
                  : "Once submitted, IR’s cannot be edited. Are you sure you want to continue",
                callback: postData,
              });
            } else {
              postData();
            }
          })}
        >
          <Box label="INCIDENT DETAILS" collapsable={true}>
            <div className={s.boxContent}>
              <Input
                {...methods.register("incident_Date_Time", {
                  required: "Please select Incident Date",
                  validate: (v) =>
                    new Date(v) < new Date() ||
                    "Can not select date from future",
                })}
                error={methods.formState.errors.incident_Date_Time}
                label="Incident Date & Time"
                type="datetime-local"
              />
              <Combobox
                label="Location of incident"
                name="location"
                register={methods.register}
                setValue={methods.setValue}
                watch={methods.watch}
                options={parameters?.locations}
              />
              <Input
                {...methods.register("locationDetailsEntry", {
                  required: "Please enter Location Detail",
                })}
                error={methods.formState.errors.locationDetailsEntry}
                label={
                  <>
                    Location Detail <i>(if any)</i>
                  </>
                }
              />
              <SwitchInput
                name="patientYesOrNo"
                register={methods.register}
                watch={methods.watch}
                setValue={methods.setValue}
                label="Patient Complaint"
              />
              {patientComplaint && (
                <>
                  <Input
                    {...methods.register("patientname", {
                      // required: "Please enter Patient Name",
                    })}
                    error={methods.formState.errors.patientname}
                    label="Patient name / UHID"
                    // icon={<BiSearch />}
                  />
                  <Input
                    {...methods.register("complaIntegerDatetime", {
                      // required: "Please select Complaint Date",
                      // validate: (v) =>
                      //   new Date(v) < new Date() ||
                      //   "Can not select date from future",
                    })}
                    error={methods.formState.errors.complaintDatetime}
                    label="Complaint Date & Time"
                    type="datetime-local"
                  />
                  <Input
                    {...methods.register("complaIntegerIdEntry", {
                      // required: "Please enter Comlient ID",
                    })}
                    error={methods.formState.errors.complaintIdEntry}
                    label="Complaint ID"
                  />
                </>
              )}
            </div>
          </Box>
          <Box label="TYPE OF INCIDENT" collapsable={true}>
            <div className={s.typeOfIncident}>
              <Radio
                register={methods.register}
                formOptions={{
                  required: "Please select a Type of Incident",
                }}
                name="typeofInci"
                options={[
                  {
                    label: "Unsafe condition",
                    value: 1,
                    // hint:
                    //   "Any potential safety event that did not reach the patient.",
                  },
                  {
                    label: "No Harm",
                    value: 2,
                    // hint:
                    //   "Any potential safety event that did not reach the patient.",
                  },
                  {
                    label: "Near Miss",
                    value: 4,
                    // hint:
                    //   "Any potential safety event that did not reach the patient.",
                  },
                  {
                    label: "Adverse Event",
                    value: 7,
                    // hint:
                    //   "Any potential safety event that did not reach the patient.",
                  },
                  {
                    label: "Sentinel Event",
                    value: 0,
                    // hint:
                    //   "Any potential safety event that did not reach the patient.",
                  },
                ]}
                error={methods.formState.errors.typeofInci}
              />
              {
                //   <table className={s.adverseEvent} cellSpacing={0} cellPadding={0}>
                //   <thead>
                //     <tr>
                //       <th>ADVERSE EVENT</th>
                //     </tr>
                //   </thead>
                //   <tbody>
                //     <tr>
                //       <td className={s.label}>
                //         Degree of harm to the patient / resident
                //       </td>
                //       <td>
                //         <Radio
                //           options={[
                //             {
                //               label: "Unsafe condition",
                //               value: "unsafeCondtion",
                //             },
                //             {
                //               label: "No Harm",
                //               value: "noHarm",
                //             },
                //             {
                //               label: "Near Miss",
                //               value: "nearMiss",
                //             },
                //             {
                //               label: "Adverse Event",
                //               value: "adverseEvent",
                //             },
                //             {
                //               label: "Sentinel Event",
                //               value: "sentinelEvent",
                //             },
                //           ]}
                //         />
                //       </td>
                //     </tr>
                //     <tr>
                //       <td className={s.label}>
                //         Duration of harm to the patient / resident
                //       </td>
                //       <td>
                //         <Radio
                //           options={[
                //             {
                //               label:
                //                 "Permanent: Not expected to revert to approximately normal. (ie. patient's baseline)",
                //               value: "parmanent",
                //               disabled: true,
                //             },
                //             {
                //               label:
                //                 "Temporary: Expected to revert to approximately normal. (ie. patient's baseline)",
                //               value: "temporary",
                //             },
                //           ]}
                //         />
                //       </td>
                //     </tr>
                //     <tr>
                //       <td className={s.label}>
                //         Notification of the patient / resident
                //       </td>
                //       <td>
                //         <Radio
                //           options={[
                //             {
                //               label: "Was notified",
                //               value: "notified",
                //             },
                //             {
                //               label: "Not notified",
                //               value: "notNotified",
                //             },
                //           ]}
                //         />
                //       </td>
                //     </tr>
                //     <tr>
                //       <td className={s.label}>
                //         Increased length of stay expected due to incident
                //       </td>
                //       <td>
                //         <Radio
                //           options={[
                //             {
                //               label: "Yes",
                //               value: "yes",
                //             },
                //             {
                //               label: "No",
                //               value: "no",
                //             },
                //           ]}
                //         />
                //       </td>
                //     </tr>
                //   </tbody>
                // </table>
              }
              <div className={s.placeholder}>Placeholder</div>
            </div>
          </Box>
          <Box label="INCIDENT CATEGORY" collapsable={true}>
            <IncidentCategory />
          </Box>
          <Box label="PERSON AFFECTED" collapsable={true}>
            <div className={s.placeholder}>Placeholder</div>
          </Box>
          <Box label="INCIDENT DESCRIPTION" collapsable={true}>
            <div className={s.incidentDescription}>
              <Textarea
                {...methods.register("inciDescription", {
                  required: "Please enter Incident Description",
                })}
                error={methods.formState.errors.inciDescription}
                label="Incident Description"
                className={s.description}
              />
              <section className={s.departments}>
                <Combobox
                  label="Department Involved"
                  name="deptsLookupMultiselect"
                  register={methods.register}
                  watch={methods.watch}
                  setValue={methods.setValue}
                  multiple={true}
                  options={parameters?.departments || []}
                  className={s.search}
                />
                {involvedDept?.map &&
                  involvedDept.map((department) => (
                    <Chip
                      key={department}
                      label={
                        parameters?.departments.find(
                          (dept) => dept.value === +department
                        )?.label || department
                      }
                      remove={() => {
                        methods.setValue(
                          "deptsLookupMultiselect",
                          involvedDept.filter(
                            (item) => item.toString() !== department.toString()
                          )
                        );
                      }}
                    />
                  ))}
              </section>
            </div>
          </Box>
          <Box label="CONTRIBUTING FACTORS" collapsable={true}>
            <div className={s.contributingFactor}>
              <div className={s.placeholder}>Placeholder</div>
              <div
                className={`${s.preventabilityWrapper} ${
                  methods.formState.errors.preventability ? s.err : ""
                }`}
              >
                <Table
                  className={s.preventability}
                  columns={[{ label: "Preventability of incident" }]}
                >
                  {[
                    { value: 1, label: "Likely could have been prevented" },
                    { value: 2, label: "Likely could not have been prevented" },
                    { value: 3, label: "Not assessed" },
                  ].map((item) => (
                    <tr key={item.label}>
                      <td>
                        <input
                          id={"preventability" + item.value}
                          type="radio"
                          {...methods.register("preventability", {
                            required: "Please select one",
                          })}
                          value={item.value}
                        />{" "}
                        <label htmlFor={"preventability" + item.value}>
                          {item.label}
                        </label>
                      </td>
                    </tr>
                  ))}
                </Table>
                {methods.formState.errors.preventability && (
                  <span className={s.errMsg}>
                    {methods.formState.errors.preventability.message}
                  </span>
                )}
              </div>
              <div className={s.actionWrapper}>
                <h4>Immediate Action taken</h4>
                <Table
                  columns={[
                    { label: "Action taken" },
                    { label: "Action Taken By" },
                    { label: "Date & Time" },
                    { label: "Action" },
                  ]}
                  className={s.actionTaken}
                >
                  <tr>
                    <td className={s.inlineForm}>
                      <div>
                        <Textarea placeholder="Enter" />
                        <Input placeholder="Enter" icon={<BiSearch />} />
                        <Input
                          type="datetime-local"
                          max={new Date().toISOString().slice(0, 16)}
                        />
                        <button className="btn secondary">
                          <AiOutlinePlus />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {actionsTaken.map((action, i) => (
                    <tr key={i}>
                      <td>{action.action}</td>
                      <td>{action.actionTakenBy.name}</td>
                      <td>{action.date}</td>
                      <TableActions
                        actions={[
                          {
                            icon: <BsPencilFill />,
                            label: "Edit",
                            callBack: () => console.log("edit", action.code),
                          },
                          {
                            icon: <FaRegTrashAlt />,
                            label: "Delete",
                            callBack: () => console.log("delete", action.code),
                          },
                        ]}
                      />
                    </tr>
                  ))}
                </Table>
              </div>
              <div>
                <h4>Incident witnessed by</h4>
                <Table
                  className={s.witnesses}
                  columns={[
                    { label: "Name" },
                    { label: "Department" },
                    { label: "Action" },
                  ]}
                >
                  <tr>
                    <td className={s.inlineForm}>
                      <div>
                        <Input placeholder="Search" icon={<BiSearch />} />
                        <Input placeholder="Enter" icon={<BiSearch />} />
                        <button className="btn secondary">
                          <AiOutlinePlus />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {witnesses.map((witness, i) => (
                    <tr key={i}>
                      <td>{witness.name}</td>
                      <td>{witness.department}</td>
                      <TableActions
                        actions={[
                          {
                            icon: <BsPencilFill />,
                            label: "Edit",
                            callBack: () => console.log("edit", witness.code),
                          },
                          {
                            icon: <FaRegTrashAlt />,
                            label: "Delete",
                            callBack: () => console.log("delete", witness.code),
                          },
                        ]}
                      />
                    </tr>
                  ))}
                </Table>
              </div>
              <div>
                <h4>Incident notified to</h4>
                <Table
                  className={s.notified}
                  columns={[
                    { label: "Name" },
                    { label: "Department" },
                    { label: "Date & Time" },
                    { label: "Action" },
                  ]}
                >
                  <tr>
                    <td className={s.inlineForm}>
                      <div>
                        <Input placeholder="Search" icon={<BiSearch />} />
                        <Input placeholder="Enter" icon={<BiSearch />} />
                        <Input type="datetime-local" placeholder="Enter" />
                        <button className="btn secondary">
                          <AiOutlinePlus />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {notified.map((person, i) => (
                    <tr key={i}>
                      <td>{person.name}</td>
                      <td>{person.department}</td>
                      <td>{person.date}</td>
                      <TableActions
                        actions={[
                          {
                            icon: <BsPencilFill />,
                            label: "Edit",
                            callBack: () => console.log("edit", person.code),
                          },
                          {
                            icon: <FaRegTrashAlt />,
                            label: "Delete",
                            callBack: () => console.log("delete", person.code),
                          },
                        ]}
                      />
                    </tr>
                  ))}
                </Table>
              </div>
              <div className={s.fieldWrapper}>
                <FileInput label="Upload" />
                {!anonymous && (
                  <>
                    <Input
                      label="Incident Reported by"
                      value={user.name}
                      readOnly={true}
                    />
                    <Input
                      label="Department"
                      value={user.department}
                      readOnly={true}
                    />
                    <Combobox
                      label="Head of the department"
                      placeholder="Enter"
                      name="headofDepart"
                      register={methods.register}
                      formOptions={{
                        required: "Please select a Head of the Department",
                      }}
                      options={parameters?.hods}
                      watch={methods.watch}
                      setValue={methods.setValue}
                      error={methods.formState.errors.headofDepart}
                      clearErrors={methods.clearErrors}
                    />
                  </>
                )}
              </div>
              <input
                style={{ display: "none" }}
                {...methods.register("status")}
              />
              <div className={s.btns}>
                <button
                  className="btn secondary w-100"
                  type="button"
                  onClick={() => {
                    setEdit(null);
                    methods.reset({
                      id: "",
                      action: "",
                      witness: "",
                      status: "",
                      department: "",
                      userDept: "",
                      reportingDate: "",
                      location: "",
                      sequence: "",
                      template: "",
                      incident_Date_Time: "",
                      locationDetailsEntry: "",
                      patientYesOrNo: "",
                      patientname: "",
                      complaintDatetime: "",
                      complaintIdEntry: "",
                      typeofInci: "",
                      inciCateg: "",
                      inciSubCat: "",
                      personAffected: "",
                      inciDescription: "",
                      deptsLookupMultiselect: "",
                      contribFactorYesOrNo: "",
                      contribFactor: "",
                      preventability: "",
                      incidentNotification: "",
                      upload: "",
                      incidentReportedDept: "",
                      headofDepart: "",
                      userId: "",
                    });
                    methods.clearErrors();
                  }}
                  disabled={readOnly}
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    methods.setValue("status", "Saved");
                  }}
                  className="btn secondary w-100"
                  disabled={readOnly || anonymous}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    methods.setValue("status", "Submitted");
                  }}
                  className="btn w-100"
                  disabled={readOnly}
                >
                  Submit
                </button>
              </div>
            </div>
          </Box>
        </form>
      </FormProvider>
    </div>
  );
}
export const IncidentCategory = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/category`)
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded.category) {
          setCategories(data._embedded.category);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <ConnectForm>
      {({ register, setValue, watch, formState: { errors }, clearErrors }) => {
        const cat = watch("inciCateg");
        return (
          <div
            className={s.incidentCategory}
            data-testid="incident-category-form"
          >
            <div className={s.form}>
              <Combobox
                label="Incident Category"
                name="inciCateg"
                register={register}
                formOptions={{
                  required: "Please select a Category",
                }}
                setValue={setValue}
                watch={watch}
                options={categories.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
                onChange={({ value }) => {
                  setValue("inciSubCat", "");
                }}
                error={errors.inciCateg}
                clearErrors={clearErrors}
              />
              <Combobox
                label="Incident Sub-category"
                name="inciSubCat"
                register={register}
                watch={watch}
                setValue={setValue}
                options={
                  categories
                    ?.find((c) => c.id === cat)
                    ?.subCategorys?.map(({ id, name }) => ({
                      value: id,
                      label: name,
                    })) || null
                }
                formOptions={{
                  required: "Please select a Subcategory",
                }}
                error={errors.inciSubCat}
                clearErrors={clearErrors}
              />
              <button className="btn secondary">
                <FaPlus /> Add Row
              </button>
            </div>
            <div className={s.placeholder}>Placeholder</div>
          </div>
        );
      }}
    </ConnectForm>
  );
};
export const Box = ({ label, children, className, collapsable }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={s.box} data-testid="box">
      <div className={s.head}>
        <h4>{label}</h4>
        {collapsable && (
          <button
            type="button"
            style
            className="clear"
            style={open ? { transform: `rotate(180deg)` } : {}}
            onClick={() => setOpen(!open)}
          >
            <BiChevronsDown />
          </button>
        )}
      </div>
      {open && <>{children}</>}
    </div>
  );
};
