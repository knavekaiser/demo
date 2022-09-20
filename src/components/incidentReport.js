import React, { useState, useEffect, useContext, useCallback } from "react";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import { FaInfoCircle, FaRegTrashAlt, FaPlus, FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BiChevronsDown } from "react-icons/bi";
import { BsPencilFill } from "react-icons/bs";
import {
  Input,
  SearchField,
  Select,
  FileInput,
  Textarea,
  SwitchInput,
  Radio,
  Chip,
  Table,
  TableActions,
  moment,
  Moment,
  uploadFiles,
} from "./elements";
import { Prompt, Modal } from "./modal";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useHisFetch, useFetch } from "../hooks";
import { endpoints as defaultEndpoints, preventability } from "../config";
import s from "./incidentReporting.module.scss";

const defaultFormValues = {
  id: "",
  action: "",
  status: "",
  department: "",
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
  headofDepart: "",
  userId: "",
  upload: [],
  witness: [],
  actionTaken: [],
  notification: [],
};

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();
  return children({ ...methods });
};
export default function IncidentReporting() {
  const { user, endpoints, irTypes } = useContext(SiteContext);
  const { irScreenDetails } = useContext(IrDashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const methods = useForm({ defaultValues: defaultFormValues });
  const [edit, setEdit] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [anonymous, setAnonymous] = useState(false);
  const patientComplaint = methods.watch("patientYesOrNo");
  const uploads = methods.watch("upload");
  const [detailValues, setDetailValues] = useState({});
  const [allowAnonymous, setAllowAnonymous] = useState(false);

  const { post: upload, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );
  const { post: postIr, put: updateIr, loading } = useFetch(
    `${defaultEndpoints.incidentReport}${edit ? `/${edit.id}` : ""}`
  );

  const submitForm = useCallback(
    (data) => {
      const postData = async () => {
        if (data.upload?.length) {
          const { links, error: uploadError } = await uploadFiles({
            files: data.upload,
            uploadFiles: upload,
          });
          if (uploadError) {
            return Prompt({ type: "error", message: uploadError.message });
          }

          data.upload = links.map((item, i) => ({
            upload: true,
            uploadFilePath: item.uploadFilePath || item.uri,
            fileName: item.name || item.fileName,
          }));
        }
        (edit ? updateIr : postIr)({
          ...data,
          actionTakens: undefined,
          deptsLookupMultiselect:
            data.deptsLookupMultiselect?.join?.(",") || "",
          ...(allowAnonymous &&
            anonymous && {
              userId: undefined,
              department: undefined,
            }),
          ...(data.status === 2 && {
            irStatusDetails: [
              {
                status: 2,
                dateTime: new Date().toISOString(),
                userid: user.id,
                ...(allowAnonymous && anonymous && { userid: undefined }),
              },
            ],
          }),
        })
          .then((data) => {
            if (data.id) {
              Prompt({
                type: "success",
                message: (
                  <>
                    Incident was successfully{" "}
                    {+data.status === 1 ? "Saved" : "Submitted"}.
                    {data.sequence && (
                      <>
                        <br />
                        IR Code: <span id="irCode">{data.sequence}</span>
                      </>
                    )}
                  </>
                ),
                callback: () =>
                  edit &&
                  navigate(location.state?.from, {
                    state: { focus: location.state.focus },
                  }),
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
          .catch((err) =>
            Prompt({
              type: "error",
              message: err.message,
            })
          );
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
    [edit, user, anonymous, allowAnonymous]
  );
  const resetForm = useCallback(() => {
    setDetailValues({ value: Math.random() });
    methods.reset({
      ...defaultFormValues,
      incident_Date_Time: "",
      userId: user.id,
      department: user.department,
      headofDepart:
        parameters?.hods?.length === 1 ? parameters.hods[0].value : "",
    });
    setAnonymous(false);
  }, [parameters]);

  const incidentDateTime = methods.watch("incident_Date_Time");
  const witnesses = methods.watch("witness");
  const actions = methods.watch("actionTaken");
  const notifications = methods.watch("notification");
  const department = methods.watch("department");

  const { get: getLocations } = useFetch(
    endpoints?.locations.url || defaultEndpoints.locations,
    { his: endpoints?.locations.url }
  );
  const { get: getDepartments } = useFetch(
    endpoints?.departments?.url || defaultEndpoints.departments,
    { his: endpoints?.departments?.url }
  );
  const { get: getUsersWithRoles } = useFetch(
    defaultEndpoints.users + `?size=10000`
  );
  const { get: getAllPatients } = useFetch(endpoints?.patients?.url || "", {
    his: endpoints?.patients?.url,
  });
  const { get: getUsers } = useFetch(endpoints?.users?.url || "", {
    his: true,
  });
  const { get: getAnonymousCount } = useFetch(
    defaultEndpoints.countAnonymousIr
  );

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
        upload: edit.upload,
        deptsLookupMultiselect: [...(edit.deptsLookupMultiselect || "")]
          .map((item) => +item)
          .filter((item) => item),
      };
      methods.reset(_edit);
    } else {
      resetForm();
    }
  }, [edit]);
  useEffect(() => {
    let active = true;
    Promise.all([
      getLocations(),
      getDepartments(null, {
        ...(endpoints?.departments?.url && {
          query: {
            departmentName: "",
            departmentCode: "",
            facilityId: 2,
            status: 1,
          },
        }),
      }),
      ...[
        (endpoints?.users?.url &&
          getUsers(null, {
            query: {
              userName: "",
              status: 1,
            },
          })) ||
          {},
      ],
      getUsersWithRoles(),
      ...[(endpoints?.patients?.url && getAllPatients()) || {}],
    ])
      .then(
        ([
          { data: location },
          { data: departments },
          { data: users },
          { data: usersWithRoles },
          { data: patients },
        ]) => {
          const _parameters = {};
          const userDetails = (usersWithRoles?._embedded?.user || []).map(
            (user) => {
              user.role = [...user.role];
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

          if (
            Array.isArray(
              departments && departments[endpoints?.departments.key1]
            )
          ) {
            _parameters.departments = departments[
              endpoints?.departments.key1
            ].map(({ departmentId, departmentName }) => ({
              value: departmentId.toString(),
              label: departmentName,
            }));
          } else if (Array.isArray(departments)) {
            _parameters.departments = departments.map((dept) => ({
              label: dept.description,
              value: dept.code,
            }));
          } else if (departments?._embedded?.department) {
            _parameters.departments = departments._embedded.department.map(
              (item) => ({
                label: item.name,
                value: item.id,
              })
            );
          }

          if ((users && users[endpoints?.users.key1]?.join) || users?.join) {
            const dataField = endpoints.users.key1;
            const nameField = endpoints.users.key2;
            const hisUser = users[dataField] || users;

            const _users = hisUser
              .map((user) => {
                const userDetail = userDetails.find(
                  (u) =>
                    // need looup when integrating ILTS
                    u.username === user.userId
                );
                if (userDetail) {
                  user.id = userDetail.id;
                  user.role = userDetail.role;
                  user.department = userDetail.department.toString();
                  return user;
                }
                return null;
              })
              .filter((user) => user);

            // if (_users.length < hisUser.length) {
            //   Prompt({
            //     type: "information",
            //     message: `${
            //       hisUser.length - _users.length
            //     } users does not have id. Please sync in the User Master.`,
            //   });
            // }

            _parameters.users = _users.map((item) => ({
              label: item[nameField],
              value: item.id,
              department:
                _parameters.departments
                  .find((dept) => dept.value === item.department)
                  ?.value.toString() || "",
            }));

            _parameters.hods = _users
              .filter(
                (u) =>
                  u.role?.includes(9) &&
                  u.department.toString() === user.department.toString()
              )
              .map((item) => ({
                label: item[nameField],
                value: item.id,
              }));
          } else {
            _parameters.hods = userDetails
              .filter(
                (u) => u.role.includes(9) && u.department === user.department
              )
              .map((item) => ({
                label: item.name,
                value: item.id,
              }));
            _parameters.users = userDetails.map((item) => ({
              label: item.name,
              value: item.id,
              department: item.department,
            }));
            if (!edit && _parameters.hods?.length === 1) {
              methods.setValue("headofDepart", _parameters.hods[0].value);
            }
          }

          if (Array.isArray(patients)) {
            _parameters.patients = patients.map((patient) => ({
              value: patient.uhid,
              label: patient.name,
            }));
          } else if (
            patients &&
            Array.isArray(patients[endpoints?.patients.key1])
          ) {
            _parameters.patients = patients[endpoints?.patients.key1].map(
              (patient) => ({
                value: patient.uhid,
                label: patient.name,
              })
            );
          }

          active && setParameters((prev) => ({ ...prev, ..._parameters }));
        }
      )
      .catch((err) => {
        Prompt({
          type: "error",
          message: err.message,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const config = irScreenDetails.find((el) => el.id === 5);
    if (config && incidentDateTime) {
      if (!config.enableDisable) {
        return setAllowAnonymous(false);
      }
      const fullYear = new Date(incidentDateTime).getFullYear();
      const month = new Date(incidentDateTime).getMonth() + 1;
      const date = new Date(incidentDateTime).getDate();
      const day = new Date(incidentDateTime).getDay();

      let startDate = new Date(incidentDateTime);
      let endDate = new Date(incidentDateTime);
      switch (config.rulesPeriod) {
        case "day":
          // do nothing
          break;
        case "week":
          if (day === 0) {
            startDate = new Date(fullYear, month - 1, date - 6);
            endDate = new Date(fullYear, month - 1, date);
          } else {
            startDate = new Date(fullYear, month - 1, date - day + 1);
            endDate = new Date(fullYear, month - 1, date - day + 7);
          }
          break;
        case "month":
          startDate = new Date(fullYear, month - 1, 1);
          endDate = new Date(fullYear, month, 0);
          break;
        case "year":
          startDate = new Date(fullYear, 0, 1);
          endDate = new Date(fullYear, 11, 31);
          break;
      }

      getAnonymousCount(null, {
        query: {
          fromreportingDate:
            moment({
              time: new Date(startDate),
              format: "YYYY-MM-DD",
            }) + "T00:00:00Z",
          toreportingDate:
            moment({
              time: new Date(endDate),
              format: "YYYY-MM-DD",
            }) + "T23:59:59Z",
        },
      }).then(({ data: irCount }) => {
        setAllowAnonymous(irCount < config.rulesCount);
      });
    }
  }, [incidentDateTime, irScreenDetails]);
  return (
    <div className={s.container} data-testid="incidentReportingForm">
      <header>
        <h3>
          REPORT AN INCIDENT{" "}
          {readOnly && (
            <span>
              (View){" "}
              <button
                className="clear"
                onClick={() => {
                  navigate(location.state.from, {
                    state: { focus: location.state.focus },
                  });
                }}
              >
                Back to Dashboard
              </button>
            </span>
          )}
        </h3>
        <span className={s.subHead}>
          <span className={s.note}>
            <FaInfoCircle /> There is a blame free reporting culture. No
            punitive measure will be taken against any staff reporting any
            incident.
          </span>
          {allowAnonymous && (
            <section style={readOnly ? { pointerEvents: "none" } : {}}>
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
          )}
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
                max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
                label="Incident Date & Time *"
                type="datetime-local"
              />
              <Select
                control={methods.control}
                name="location"
                options={parameters?.locations}
                label="Location of Incident *"
                formOptions={{
                  validate: (v) => {
                    if (v) return true;
                    return (
                      +methods.getValues("status") === 1 ||
                      "Please Select a Location"
                    );
                  },
                }}
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
                  <Select
                    label="Patient Name / UHID *"
                    options={parameters?.patients}
                    name="patientname"
                    control={methods.control}
                    formOptions={{
                      required: "Please enter Patient Name",
                    }}
                  />
                  <Input
                    {...methods.register("complaIntegerDatetime", {
                      validate: (v) => {
                        if (v) {
                          return (
                            new Date(v) < new Date() ||
                            "Can not select date from future"
                          );
                        }
                        if (
                          methods.getValues("patientYesOrNo") &&
                          +methods.getValues("status") === 2
                        ) {
                          return "Please select Complaint Date & Time";
                        }
                      },
                    })}
                    error={methods.formState.errors.complaIntegerDatetime}
                    label="Complaint Date & Time *"
                    type="datetime-local"
                    max={moment({
                      time: new Date(),
                      format: "YYYY-MM-DDThh:mm",
                    })}
                  />
                  <Input
                    {...methods.register("complaIntegerIdEntry", {
                      validate: (v) => {
                        if (
                          methods.getValues("patientYesOrNo") &&
                          +methods.getValues("status") === 2 &&
                          !v
                        ) {
                          return "Please enter Complaint ID";
                        }
                        return true;
                      },
                    })}
                    error={methods.formState.errors.complaIntegerIdEntry}
                    label="Complaint ID *"
                  />
                </>
              )}
              <button
                style={{ display: "none" }}
                className="incident-details-submit"
              >
                submit
              </button>
            </form>
          </Box>
          <Box label="TYPE OF INCIDENT *" collapsable={true}>
            <div className={s.typeOfIncident}>
              <div className={s.radio}>
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
                  options={irTypes || []}
                  error={methods.formState.errors.typeofInci}
                />
                <button className={`clear ${s.info}`}>
                  <FaInfoCircle />
                </button>
              </div>
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
                <Select
                  className={s.select}
                  label="Department Involved"
                  name="deptsLookupMultiselect"
                  control={methods.control}
                  multiple={true}
                  renderMultipleValue={true}
                  setValue={methods.setValue}
                  options={parameters?.departments}
                />
              </section>
              <button style={{ display: "none" }}>submit</button>
            </form>
          </Box>
          {irScreenDetails.find((el) => el.id === 3)?.enableDisable && (
            <Box label="CONTRIBUTING FACTORS" collapsable={true}>
              <div className={s.contributingFactor}>
                <div className={s.placeholder}>Placeholder</div>
                <input
                  style={{ display: "none" }}
                  {...methods.register("status")}
                />
              </div>
            </Box>
          )}
          {irScreenDetails.find((el) => el.id === 2)?.enableDisable && (
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
                {preventability.map((item) => (
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
          )}
          <div className={s.tables}>
            <div className={s.actionWrapper}>
              <h4>Immediate Action Taken</h4>
              <ActionTaken
                users={parameters?.users}
                setValue={methods.setValue}
                actions={actions || []}
                detailValues={detailValues}
              />
            </div>
            <div>
              <h4>Incident witnessed by</h4>
              <Witnesses
                users={parameters?.users}
                witnesses={witnesses || []}
                departments={parameters?.departments}
                setValue={methods.setValue}
                detailValues={detailValues}
              />
            </div>
            <div>
              <h4>Incident notified to</h4>
              <Notifications
                users={parameters?.users}
                departments={parameters?.departments}
                notifications={notifications || []}
                setValue={methods.setValue}
                detailValues={detailValues}
              />
            </div>
          </div>
          <div className={s.fieldWrapper}>
            <FileInput
              label="Upload"
              multiple={true}
              prefill={uploads}
              onChange={(files) => {
                methods.setValue("upload", files);
              }}
            />
            <Select
              readOnly={
                !irScreenDetails.find((el) => el.id === 4)?.enableDisable
              }
              label="Incident Reported by"
              name="userId"
              control={methods.control}
              onChange={(opt) => {
                methods.setValue("department", opt.department);
              }}
              options={parameters?.users}
            />
            {!anonymous && (
              <>
                <Input
                  label="Department"
                  value={
                    parameters?.departments?.find(
                      (dept) => dept.value.toString() === department.toString()
                    )?.label || department
                  }
                  readOnly={true}
                />
                <Select
                  label="Head of the department"
                  name="headofDepart"
                  control={methods.control}
                  options={parameters?.hods}
                />
              </>
            )}
          </div>
          <form
            className={s.btns}
            onSubmit={methods.handleSubmit(submitForm)}
            data-testid="irFormActions"
          >
            <button
              className="btn secondary wd-100"
              type="button"
              onClick={() => {
                setEdit(null);
                resetForm();
                methods.clearErrors();
              }}
              disabled={loading || uploadingFiles || readOnly}
            >
              Clear
            </button>
            <button
              onClick={() => {
                methods.setValue("status", 1);
                methods.clearErrors();
              }}
              className="btn secondary wd-100"
              disabled={loading || uploadingFiles || readOnly || anonymous}
            >
              Save
            </button>
            <button
              onClick={() => {
                methods.setValue("status", 2);
              }}
              className="btn wd-100 ir-form-submit"
              disabled={loading || uploadingFiles || readOnly}
            >
              Submit
            </button>
          </form>
        </div>
      </FormProvider>
    </div>
  );
}

export const IncidentCategory = ({}) => {
  const [categories, setCategories] = useState([]);
  const [showCategoryTable, setShowCategoryTable] = useState(false);
  const [rows, setRows] = useState([]);
  const [tableValues, setTableValues] = useState({});
  const { get: getCategories } = useFetch(defaultEndpoints.categories);

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        if (data?._embedded.category) {
          setCategories(data._embedded.category);
          const maxSubCategory = [...data._embedded.category].sort((a, b) =>
            a.subCategorys.length > b.subCategorys.length ? -1 : 1
          )[0].subCategorys.length;

          const rows = data._embedded.category.map((cat) => {
            const row = [];
            for (var i = 0; i < maxSubCategory; i++) {
              row.push(cat.subCategorys[i] || null);
            }
            return row;
          });
          setRows(rows);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
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
        control,
      }) => {
        const cat = watch("inciCateg");
        const subCat = watch("inciSubCat");
        return (
          <div
            className={s.incidentCategory}
            data-testid="incident-category-form"
          >
            <div className={s.form}>
              <Select
                control={control}
                name="inciCateg"
                label="Incident Category *"
                formOptions={{
                  validate: (v) => {
                    return (
                      +getValues("status") === 1 ||
                      v ||
                      "Please select a Category"
                    );
                  },
                }}
                options={categories.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
                onChange={({ value }) => {
                  setValue("inciSubCat", "");
                  setTableValues({ category: value });
                }}
              />
              <Select
                control={control}
                name="inciSubCat"
                label="Incident Sub-category *"
                options={
                  categories
                    ?.find((c) => c.id === cat)
                    ?.subCategorys?.filter((c) => c.status)
                    .filter((item) => item.status)
                    .map(({ id, name, template }) => ({
                      value: id,
                      label: name,
                      template: template,
                    })) || null
                }
                formOptions={{
                  validate: (v) => {
                    return (
                      +getValues("status") === 1 ||
                      v ||
                      "Please select a Subcategory"
                    );
                  },
                }}
                onChange={({ value, template }) => {
                  setTableValues((prev) => ({ ...prev, subCat: value }));
                }}
              />
              <button
                className={`clear ${s.info}`}
                onClick={() => {
                  setShowCategoryTable(true);
                }}
              >
                <FaInfoCircle />
              </button>
              <button className={`btn secondary ${s.addRow}`}>
                <FaPlus /> Add Row
              </button>
            </div>
            <Modal
              head={true}
              open={showCategoryTable}
              setOpen={() => {
                setShowCategoryTable();
                setTableValues({
                  category: getValues("inciCateg"),
                  subCat: getValues("inciSubCat"),
                });
              }}
              label="SELECT SUB-CATEGORY"
              className={s.categoryTable}
            >
              <div className={s.container}>
                <Table
                  columns={categories.map((category) => ({
                    label: category.name,
                  }))}
                >
                  {rows[0]?.map((col, i, arr) => (
                    <tr key={i}>
                      {rows?.map((subCat, j) =>
                        subCat[i] ? (
                          <td key={j}>
                            <label htmlFor={`subCat-${subCat[i]?.id}`}>
                              <input
                                name="subcategory"
                                type="radio"
                                id={`subCat-${subCat[i]?.id}`}
                                className="label"
                                checked={
                                  categories[j]?.id === tableValues.category &&
                                  subCat[i].id === tableValues.subCat
                                }
                                onChange={() => {
                                  setTableValues({
                                    category: categories[j]?.id,
                                    subCat: subCat[i].id,
                                  });
                                }}
                              />
                              {subCat[i]?.name}
                            </label>
                          </td>
                        ) : (
                          <td key={j} />
                        )
                      )}
                    </tr>
                  ))}
                </Table>
                <section className={s.btns}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryTable(false);
                      setTableValues({
                        category: getValues("inciCateg"),
                        subCat: getValues("inciSubCat"),
                      });
                    }}
                    className="btn ghost wd-100"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tableValues.category && tableValues.subCat) {
                        setValue("inciCateg", tableValues.category);
                        setValue("inciSubCat", tableValues.subCat);
                      }
                      setShowCategoryTable(false);
                    }}
                    className="btn secondary wd-100"
                    disabled={!tableValues.category || !tableValues.subCat}
                  >
                    Select
                  </button>
                </section>
              </div>
            </Modal>
            <div className={s.placeholder}>Placeholder</div>
          </div>
        );
      }}
    </ConnectForm>
  );
};

export const ActionTaken = ({ actions, users, setValue, detailValues }) => {
  const [edit, setEdit] = useState(null);
  return (
    <Table
      columns={[
        { label: "Action Taken" },
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
            detailValues={detailValues}
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
const ActionTakenForm = ({
  edit,
  onSuccess,
  actions,
  users,
  clearForm,
  detailValues,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useForm();
  useEffect(() => {
    reset({ immedActionTaken: "", accessDateTime: "", ...edit });
  }, [edit, detailValues]);
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
      <Select
        options={users}
        name="accessTakenBy"
        control={control}
        formOptions={{
          required: "Action Taken By",
        }}
      />
      <Input
        type="datetime-local"
        {...register("accessDateTime", {
          validate: (v) => {
            if (v) {
              return (
                new Date(v) < new Date() || "Can not select date from future"
              );
            }
            return "Select Date & Time";
          },
        })}
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
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

export const Witnesses = ({
  users,
  departments,
  witnesses,
  setValue,
  detailValues,
}) => {
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
            onSuccess={(newWitness) => {
              const newWitnesses = witnesses.find(
                (wt) => wt.witnessName === newWitness.witnessName
              )
                ? witnesses.map((wt) =>
                    wt.witnessName === newWitness.witnessName ? newWitness : wt
                  )
                : [...witnesses, newWitness];
              setValue("witness", newWitnesses);
            }}
            witnesses={witnesses}
            users={users}
            departments={departments}
            detailValues={detailValues}
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
            {departments?.find(
              (dept) => dept.value.toString() === witness.witnessDept.toString()
            )?.label || witness.witnessDept}
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
  onSuccess,
  witnesses,
  users,
  departments,
  detailValues,
}) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm();
  useEffect(() => reset(), [detailValues]);
  const dept = watch("witnessDept");
  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSuccess(data);
        reset();
      })}
    >
      <Select
        options={
          users?.filter(
            (user) => !witnesses.some((u) => u.witnessName === user.value)
          ) || []
        }
        control={control}
        name="witnessName"
        formOptions={{
          required: "Select a Witness",
        }}
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
          <FaPlus /> Add
        </button>
      </div>
    </form>
  );
};

export const Notifications = ({
  notifications,
  users,
  departments,
  setValue,
  detailValues,
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
            detailValues={detailValues}
          />
        </td>
      </tr>
      {notifications.map((noti, i) => (
        <tr key={i}>
          <td>
            {users?.find((u) => u.value === noti.name)?.label || noti.name}
          </td>
          <td>
            {departments?.find(
              (dept) => dept.value.toString() === noti.dept.toString()
            )?.label || noti.dept}
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
  detailValues,
}) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm();
  const dept = watch("dept");
  useEffect(() => reset({ notificationDateTime: "", ...edit }), [
    edit,
    detailValues,
  ]);
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
      <Select
        options={users}
        name="name"
        control={control}
        formOptions={{
          required: "Select a Person",
        }}
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
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
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
    <div className={`${s.box} ${className || ""}`} data-testid="box">
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
