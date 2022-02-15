import React, { useState, useEffect, useContext, useCallback } from "react";
import { SiteContext } from "../SiteContext";
import { FaInfoCircle, FaRegTrashAlt, FaPlus, FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BiChevronsDown } from "react-icons/bi";
import { BsPencilFill } from "react-icons/bs";
import {
  Input,
  SearchField,
  Combobox,
  FileInput,
  Textarea,
  SwitchInput,
  Radio,
  Chip,
  Table,
  TableActions,
  moment,
  Moment,
} from "./elements";
import { Prompt } from "./modal";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useHisFetch } from "../hooks";
import { incidentTypes } from "../config";
import defaultEndpoints from "../config/endpoints";
import s from "./incidentReporting.module.scss";

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();
  return children({ ...methods });
};
export default function IncidentReporting() {
  const { user, endpoints } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();
  const methods = useForm();
  const [edit, setEdit] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [users, setUsers] = useState(null);
  const [anonymous, setAnonymous] = useState(false);
  const involvedDept = methods.watch("deptsLookupMultiselect");
  const patientComplaint = methods.watch("patientYesOrNo");
  const uploads = methods.watch("upload");
  const submitForm = useCallback(
    (data) => {
      const postData = async () => {
        if (edit) {
          await fetch(
            `${process.env.REACT_APP_HOST}/IncidentReport/${edit.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                upload: [],
                witness: [],
                actionTaken: [],
                notification: [],
              }),
            }
          )
            .then((res) => res.json())
            .then((data) => {})
            .catch((err) => {
              console.log(err);
            });
        }
        fetch(
          `${process.env.REACT_APP_HOST}/IncidentReport${
            edit ? `/${edit.id}` : ""
          }`,
          {
            method: edit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              actionTakens: undefined,
              deptsLookupMultiselect:
                data.deptsLookupMultiselect?.join?.(",") || "",
              ...(anonymous
                ? {
                    userId: undefined,
                    department: undefined,
                  }
                : {
                    userId: user.id,
                    department: user.department,
                  }),
              ...(data.status === 2 && {
                irStatusDetails: [
                  {
                    status: 2,
                    dateTime: new Date().toISOString(),
                    ...(!anonymous && { userid: user.id }),
                  },
                ],
              }),
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
                message: (
                  <>
                    Incident was successfully reported.
                    <br />
                    IR Code: {data.sequence}
                  </>
                ),
              });
              resetForm();
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
      if (+data.status === 2) {
        Prompt({
          type: "confirmation",
          message:
            "Once submitted, IR’s cannot be edited. Are you sure you want to continue",
          callback: postData,
        });
      } else {
        postData();
      }
    },
    [edit, user, anonymous]
  );
  const resetForm = useCallback(() => {
    methods.reset({
      id: "",
      action: "",
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
      incidentReportedDept: "",
      headofDepart:
        parameters?.hods?.length === 1 ? parameters.hods[0].value : "",
      userId: "",
      upload: [],
      witness: [],
      actionTaken: [],
      notification: [],
    });
    setAnonymous(false);
  }, [parameters]);
  const witnesses = methods.watch("witness");
  const actions = methods.watch("actionTaken");
  const notifications = methods.watch("notification");

  const { get: getLocations } = useHisFetch(endpoints.locations);
  const { get: getDepartments } = useHisFetch(endpoints.departments);
  const { get: getUsersWithRoles } = useHisFetch(defaultEndpoints.users);
  const { get: getUsers } = useHisFetch(endpoints.users);

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
          edit.deptsLookupMultiselect
            ?.split(",")
            .filter((item) => item)
            .map((item) => +item) || [],
      };
      methods.reset(_edit);
    }
  }, [edit]);
  useEffect(() => {
    Promise.all([
      getLocations(),
      getDepartments(),
      getUsers(),
      getUsersWithRoles(),
    ]).then(([location, department, users, usersWithRoles]) => {
      const _parameters = { ...parameters };
      const userDetails = (usersWithRoles?._embedded?.user || []).map(
        (user) => {
          user.role = user.role.split(",");
          return user;
        }
      );

      if (Array.isArray(location)) {
        _parameters.locations = location
          .filter((item) => +item.status)
          .map((item) => ({
            label: item.locationName,
            value: item.locationID,
          }));
      } else if (location?._embedded?.location) {
        _parameters.locations = location._embedded.location
          .filter((item) => item.status)
          .map((item) => ({
            label: item.name,
            value: item.id,
          }));
      }
      if (Array.isArray(department)) {
        _parameters.departments = department.map((dept) => ({
          label: dept.description,
          value: dept.code,
        }));
      } else if (department?._embedded?.department) {
        _parameters.departments = department._embedded.department.map(
          (item) => ({
            label: item.name,
            value: item.id,
          })
        );
      }
      if (users?.userViewList) {
        const _users = users.userViewList.map((user) => {
          const userDetail = userDetails.find((u) =>
            new RegExp(u.name, "i").test(user.userId)
          );
          if (userDetail) {
            user.id = userDetail.id;
            user.role = userDetail.role;
            user.department = userDetail.department.toString();
          }
          return user;
        });
        _parameters.hods = _users
          .filter(
            (u) =>
              u.role?.includes("hod") &&
              u.department.toString() === user.department.toString()
          )
          .map((item) => ({
            label: item.userId,
            value: item.id,
          }));
        _parameters.users = _users.map((item) => ({
          label: item.userId,
          value: item.id,
          department: item.department,
        }));
      } else if (users?._embedded?.user) {
        _parameters.hods = users._embedded.user
          .map((user) => ({
            ...user,
            role: user.role.split(",").filter((r) => r),
          }))
          .filter(
            (u) => u.role.includes("hod") && u.department === user.department
          )
          .map((item) => ({
            label: item.name,
            value: item.id,
          }));
        _parameters.users = users._embedded.user.map((item) => ({
          label: item.name,
          value: item.id,
          department: item.department,
        }));
        if (!edit && _parameters.hods?.length === 1) {
          methods.setValue("headofDepart", _parameters.hods[0].value);
        }
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
              onChange={(e) => {
                if (!anonymous) {
                  Prompt({
                    type: "confirmation",
                    message:
                      "This incident will be submitted as Anonymous report. You will not be able to view or track the IR status. Do you wish to continue",
                    callback: () => setAnonymous(true),
                  });
                } else {
                  setAnonymous(!anonymous);
                }
              }}
            />
            <label htmlFor="anonymous">Report Anonymously</label>
          </section>
        </span>
      </header>
      <FormProvider {...methods}>
        <div
          className={s.content}
          style={readOnly ? { pointerEvents: "none" } : {}}
        >
          <Box label="INCIDENT DETAILS" collapsable={true}>
            <form
              className={s.boxContent}
              onSubmit={methods.handleSubmit(submitForm)}
            >
              <Input
                {...methods.register("incident_Date_Time", {
                  validate: (v) => {
                    if (v) {
                      if (
                        new Date(v) >
                        (edit?.reportingDate
                          ? new Date(edit.reportingDate)
                          : new Date())
                      ) {
                        return edit?.reportingDate
                          ? "Incident date can't not be leter than reporting date"
                          : "Can not select date from future";
                      }
                    } else {
                      return "Please select Incident Date";
                    }
                  },
                })}
                error={methods.formState.errors.incident_Date_Time}
                max={new Date().toISOString().slice(0, 16)}
                label="Incident Date & Time *"
                type="datetime-local"
              />
              <Combobox
                label="Location of incident *"
                name="location"
                register={methods.register}
                formOptions={{
                  validate: (v) => {
                    return (
                      +methods.getValues("status") === 1 ||
                      v ||
                      "Please select a location"
                    );
                  },
                }}
                onChange={() => {
                  methods.clearErrors("locationDetailsEntry");
                }}
                setValue={methods.setValue}
                watch={methods.watch}
                error={methods.formState.errors.location}
                options={parameters?.locations}
                clearErrors={methods.clearErrors}
              />
              <Input
                {...methods.register("locationDetailsEntry", {
                  validate: (v) => {
                    if (v) return true;
                    if (
                      methods.getValues("status") === 2 &&
                      parameters?.locations
                        ?.find(
                          (loc) => loc.value === methods.getValues("location")
                        )
                        ?.label.toLowerCase() === "others"
                    ) {
                      return "Please enter Location Detail";
                    }
                  },
                })}
                error={methods.formState.errors.locationDetailsEntry}
                label={
                  <>
                    Location Detail <i>(if any)</i>{" "}
                    {parameters?.locations
                      ?.find(
                        (loc) => loc.value === methods.getValues("location")
                      )
                      ?.label.toLowerCase() === "others" && "*"}
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
                  {
                    //   <Input
                    //   {...methods.register("patientname", {
                    //     validate: (v) => {
                    //       if (
                    //         methods.getValues("patientYesOrNo") &&
                    //         +methods.getValues("status") === 2
                    //       ) {
                    //         return "Please enter Patient Name";
                    //       }
                    //       return true;
                    //     },
                    //   })}
                    //   error={methods.formState.errors.patientname}
                    //   label="Patient Name / UHID"
                    // />
                  }
                  <SearchField
                    url={endpoints.patients}
                    label="Patient Name / UHID"
                    processData={(data, value) => {
                      if (Array.isArray(data)) {
                        return data
                          .filter(
                            (p) =>
                              new RegExp(value, "i").test(p.name) ||
                              new RegExp(value, "i").test(p.uhid)
                          )
                          .map((p) => ({
                            value: p.id,
                            label: p.name,
                            data: p,
                          }));
                      } else if (data?._embedded?.patients) {
                        return data._embedded.patients
                          .filter(
                            (p) =>
                              new RegExp(value, "i").test(p.name) ||
                              new RegExp(value, "i").test(p.uhid)
                          )
                          .map((p) => ({
                            value: p.id,
                            label: p.name,
                            data: p,
                          }));
                      }
                      return [];
                    }}
                    register={methods.register}
                    name="patientname"
                    formOptions={{
                      required: "Please Paitent Name",
                    }}
                    renderListItem={(p) => <>{p.label}</>}
                    watch={methods.watch}
                    setValue={methods.setValue}
                    onChange={(item) => {
                      if (typeof item === "string") {
                        methods.setValue("patientname", item);
                      } else {
                        methods.setValue("patientname", item.name);
                      }
                    }}
                    error={methods.formState.errors.patientname}
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
              <button style={{ display: "none" }}>submit</button>
            </form>
          </Box>
          <Box label="TYPE OF INCIDENT *" collapsable={true}>
            <div className={s.typeOfIncident}>
              <Radio
                register={methods.register}
                formOptions={{
                  validate: (v) => {
                    if (v) return true;
                    return (
                      +methods.getValues("status") === 1 ||
                      "Please select a Type of Incident"
                    );
                  },
                }}
                name="typeofInci"
                options={incidentTypes}
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
            <form
              className={s.incidentDescription}
              onSubmit={methods.handleSubmit(submitForm)}
            >
              <Textarea
                {...methods.register("inciDescription", {
                  validate: (v) => {
                    if (v) return true;
                    return (
                      +methods.getValues("status") === 1 ||
                      "Please enter Incident Description"
                    );
                  },
                })}
                error={methods.formState.errors.inciDescription}
                label="Incident Description *"
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
                          (dept) =>
                            dept.value.toString() === department.toString()
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
              <button style={{ display: "none" }}>submit</button>
            </form>
          </Box>
          <Box label="CONTRIBUTING FACTORS" collapsable={true}>
            <div className={s.contributingFactor}>
              <div className={s.placeholder}>Placeholder</div>
              <input
                style={{ display: "none" }}
                {...methods.register("status")}
              />
            </div>
          </Box>
          <form
            className={`${s.preventabilityWrapper} ${
              methods.formState.errors.preventability ? s.err : ""
            }`}
            onSubmit={methods.handleSubmit(submitForm)}
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
                      {...methods.register("preventability")}
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
          </form>
          <div className={s.tables}>
            <div className={s.actionWrapper}>
              <h4>Immediate Action taken</h4>
              <ActionTaken
                users={parameters?.users}
                setValue={methods.setValue}
                actions={actions || []}
              />
            </div>
            <div>
              <h4>Incident witnessed by</h4>
              <Witnesses
                users={parameters?.users}
                witnesses={witnesses || []}
                departments={parameters?.departments}
                setValue={methods.setValue}
              />
            </div>
            <div>
              <h4>Incident notified to</h4>
              <Notifications
                users={parameters?.users}
                departments={parameters?.departments}
                notifications={notifications || []}
                setValue={methods.setValue}
              />
            </div>
          </div>
          <div className={s.fieldWrapper}>
            <FileInput
              label="Upload"
              multiple={true}
              prefill={uploads}
              onChange={(files) => {
                methods.setValue(
                  "upload",
                  files.map((file) => ({
                    upload: true,
                    uploadFilePath: file.name,
                  }))
                );
              }}
            />
            <Input
              label="Incident Reported by"
              value={!anonymous ? user.name : "Anonymous"}
              readOnly={true}
            />
            {!anonymous && (
              <>
                <Input
                  label="Department"
                  value={
                    parameters?.departments?.find(
                      (item) =>
                        item.value.toString() === user.department.toString()
                    )?.label || ""
                  }
                  readOnly={true}
                />
                <Combobox
                  label="Head of the department"
                  placeholder="Enter"
                  name="headofDepart"
                  register={methods.register}
                  options={parameters?.hods}
                  watch={methods.watch}
                  setValue={methods.setValue}
                  error={methods.formState.errors.headofDepart}
                  clearErrors={methods.clearErrors}
                />
              </>
            )}
          </div>
          <form className={s.btns} onSubmit={methods.handleSubmit(submitForm)}>
            <button
              className="btn secondary w-100"
              type="button"
              onClick={() => {
                setEdit(null);
                resetForm();
                methods.clearErrors();
              }}
              disabled={readOnly}
            >
              Clear
            </button>
            <button
              onClick={() => {
                methods.setValue("status", 1);
                methods.clearErrors();
              }}
              className="btn secondary w-100"
              disabled={readOnly || anonymous}
            >
              Save
            </button>
            <button
              onClick={() => {
                methods.setValue("status", 2);
              }}
              className="btn w-100"
              disabled={readOnly}
            >
              Submit
            </button>
          </form>
        </div>
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
      {({
        register,
        setValue,
        watch,
        getValues,
        formState: { errors },
        clearErrors,
      }) => {
        const cat = watch("inciCateg");
        return (
          <div
            className={s.incidentCategory}
            data-testid="incident-category-form"
          >
            <div className={s.form}>
              <Combobox
                label="Incident Category *"
                name="inciCateg"
                register={register}
                formOptions={{
                  validate: (v) => {
                    return (
                      +getValues("status") === 1 ||
                      v ||
                      "Please select a Please select a Category"
                    );
                  },
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
                label="Incident Sub-category *"
                name="inciSubCat"
                register={register}
                watch={watch}
                setValue={setValue}
                options={
                  categories
                    ?.find((c) => c.id === cat)
                    ?.subCategorys?.filter((c) => c.status)
                    .filter((item) => item.status)
                    .map(({ id, name }) => ({
                      value: id,
                      label: name,
                    })) || null
                }
                formOptions={{
                  validate: (v) => {
                    return (
                      +getValues("status") === 1 ||
                      v ||
                      "Please select a Please select a Subcategory"
                    );
                  },
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

export const ActionTaken = ({ actions, users, setValue }) => {
  const [edit, setEdit] = useState(null);
  return (
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
          <ActionTakenForm
            {...(edit && { edit })}
            key={edit ? "edit" : "add"}
            onSuccess={(newAction) => {
              const newAcitons = actions.find(
                (ac) =>
                  ac.immedActionTaken?.trim().toLowerCase() ===
                  newAction.immedActionTaken?.trim().toLowerCase()
              )
                ? actions.map((ac) =>
                    ac.immedActionTaken?.trim().toLowerCase() ===
                    newAction.immedActionTaken?.trim().toLowerCase()
                      ? newAction
                      : ac
                  )
                : [...actions, newAction];
              setValue("actionTaken", newAcitons);
              setEdit(null);
            }}
            clearForm={() => setEdit(null)}
            actions={actions}
            users={users}
            setValue={setValue}
          />
        </td>
      </tr>
      {actions.map((action, i) => (
        <tr key={i}>
          <td>{action.immedActionTaken}</td>
          <td>
            {users?.find((user) => user.value === action.accessTakenBy)
              ?.label || action.accessTakenBy}
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{action.accessDateTime}</Moment>
          </td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(action),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove Action?`,
                    callback: () => {
                      const newAcitons = actions.filter(
                        (ac) =>
                          ac.immedActionTaken.trim().toLowerCase() !==
                          action.immedActionTaken.trim().toLowerCase()
                      );
                      setValue("actionTaken", newAcitons);
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
const ActionTakenForm = ({ edit, onSuccess, actions, users, clearForm }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm();
  useEffect(() => reset({ ...edit }), [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          !edit &&
          actions?.some(
            (act) =>
              act.immedActionTaken.trim().toLowerCase() ===
              data.immedActionTaken.trim().toLowerCase()
          )
        ) {
          Prompt({
            type: "information",
            message: `Action already exists.`,
          });
          return;
        }
        onSuccess(data);
        reset();
      })}
    >
      <Textarea
        placeholder="Enter"
        {...register("immedActionTaken", { required: "Describe the Action" })}
        error={errors.immedActionTaken}
      />
      <Combobox
        options={users}
        name="accessTakenBy"
        register={register}
        formOptions={{
          required: "Action Taken By",
        }}
        setValue={setValue}
        watch={watch}
        error={errors.accessTakenBy}
        clearErrors={clearErrors}
      />
      <Input
        type="datetime-local"
        {...register("accessDateTime", {
          required: "Select Date & Time",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        error={errors.accessDateTime}
      />
      <div className={s.btns} data-testid="actionTakenBtns">
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

// Remove everyting related to Edit
export const Witnesses = ({ users, departments, witnesses, setValue }) => {
  const [edit, setEdit] = useState(null);
  return (
    <Table
      columns={[
        { label: "Name" },
        { label: "Department" },
        { label: "Action" },
      ]}
      className={s.witnesses}
    >
      <tr>
        <td className={s.inlineForm}>
          <WitnessesForm
            {...(edit && { edit })}
            key={edit ? "edit" : "add"}
            onSuccess={(newWitness) => {
              const newWitnesses = witnesses.find(
                (wt) => wt.witnessName === newWitness.witnessName
              )
                ? witnesses.map((wt) =>
                    wt.witnessName === newWitness.witnessName ? newWitness : wt
                  )
                : [...witnesses, newWitness];
              setValue("witness", newWitnesses);
              setEdit(null);
            }}
            clearForm={() => setEdit(null)}
            witnesses={witnesses}
            users={users}
            departments={departments}
          />
        </td>
      </tr>
      {witnesses.map((witness, i) => (
        <tr key={i}>
          <td>
            {users?.find((u) => u.value === witness.witnessName)?.label ||
              witness.witnessName}
          </td>
          <td>
            {departments?.find((dept) => dept.value === witness.witnessDept)
              ?.label || witness.witnessDept}
          </td>
          <TableActions
            actions={[
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove this witness?`,
                    callback: () => {
                      const newWitnesses = witnesses.filter(
                        (wt) => wt.witnessName !== witness.witnessName
                      );
                      setValue("witness", newWitnesses);
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
const WitnessesForm = ({
  edit,
  onSuccess,
  witnesses,
  users,
  departments,
  clearForm,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm();
  useEffect(() => reset({ ...edit }), [edit]);
  const dept = watch("witnessDept");
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          !edit &&
          witnesses?.some((witness) => witness.witnessName === data.witnessName)
        ) {
          Prompt({
            type: "information",
            message: `Winess already selected.`,
          });
          return;
        }
        onSuccess(data);
        reset();
      })}
    >
      <Combobox
        options={
          users?.filter(
            (user) => !witnesses.some((u) => u.witnessName === user.value)
          ) || []
        }
        name="witnessName"
        register={register}
        formOptions={{
          required: "Select a Witness",
        }}
        setValue={setValue}
        watch={watch}
        error={errors.witnessName}
        clearErrors={clearErrors}
        onChange={({ department }) => setValue("witnessDept", department)}
      />
      <Input
        value={
          departments?.find((dep) => dep.value === dept)?.label || dept || ""
        }
        readOnly={true}
      />
      <div className={s.btns} data-testid="witnessBtns">
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

export const Notifications = ({
  notifications,
  users,
  departments,
  setValue,
}) => {
  const [edit, setEdit] = useState(null);
  return (
    <Table
      columns={[
        { label: "Name" },
        { label: "Department" },
        { label: "Date & Time" },
        { label: "Action" },
      ]}
      className={s.notified}
    >
      <tr>
        <td className={s.inlineForm}>
          <NotificationForm
            {...(edit && { edit })}
            key={edit ? "edit" : "add"}
            onSuccess={(newNotification) => {
              const newNotifications = notifications.find(
                (nt) => nt.name === newNotification.name
              )
                ? notifications.map((nt) =>
                    nt.name === newNotification.name ? newNotification : nt
                  )
                : [...notifications, newNotification];
              setValue("notification", newNotifications);
              setEdit(null);
            }}
            clearForm={() => setEdit(null)}
            notifications={notifications}
            users={users}
            departments={departments}
            setValue={setValue}
          />
        </td>
      </tr>
      {notifications.map((noti, i) => (
        <tr key={i}>
          <td>
            {users?.find((u) => u.value === noti.name)?.label || noti.name}
          </td>
          <td>
            {departments?.find((dept) => dept.value === noti.dept)?.label ||
              noti.dept}
          </td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">
              {noti.notificationDateTime}
            </Moment>
          </td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(noti),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove this notification?`,
                    callback: () => {
                      const newNotifications = notifications.filter(
                        (nt) => nt.name !== noti.name
                      );
                      setValue("notification", newNotifications);
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
const NotificationForm = ({
  edit,
  onSuccess,
  notifications,
  users,
  departments,
  clearForm,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm();
  const dept = watch("dept");
  useEffect(() => reset({ ...edit }), [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (!edit && notifications?.some((noti) => noti.name === data.name)) {
          Prompt({
            type: "information",
            message: `Person already selected.`,
          });
          return;
        }
        onSuccess(data);
        reset();
      })}
    >
      <Combobox
        options={users}
        name="name"
        register={register}
        formOptions={{
          required: "Select a Person",
        }}
        setValue={setValue}
        watch={watch}
        error={errors.name}
        clearErrors={clearErrors}
        onChange={({ department }) => setValue("dept", department)}
      />
      <Input
        value={
          departments?.find((dep) => dep.value === dept)?.label || dept || ""
        }
        readOnly={true}
      />
      <Input
        type="datetime-local"
        {...register("notificationDateTime", {
          required: "Select Date & Time",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        error={errors.notificationDateTime}
      />
      <div className={s.btns} data-testid="notificationBtns">
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
