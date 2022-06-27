import { useState, useEffect, useRef, useCallback } from "react";
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
  Checkbox,
  Select,
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
import { endpoints as defaultEndpoints, paths } from "../../config";
import { useFetch } from "../../hooks";
import s from "./config.module.scss";

const IrScreen = () => {
  const { handleSubmit, register, setValue, watch } = useForm();
  const screenRef = useRef([]);
  const [screens, setScreens] = useState([]);
  const [update, setUpdate] = useState([]);
  const { get: getIrScreens } = useFetch(defaultEndpoints.configirscreen);
  const { put: updateScreen } = useFetch(
    defaultEndpoints.configirscreen + "/{ID}"
  );
  useEffect(() => {
    getIrScreens().then((data) => {
      if (data?._embedded?.configirscreen) {
        screenRef.current = data._embedded.configirscreen;
        setScreens(data._embedded.configirscreen);
      }
    });
  }, []);
  useEffect(() => {
    setUpdate(
      screens.filter((newItem) => {
        const oldItem = screenRef.current.find((old) => old.id === newItem.id);
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
    );
  }, [screens]);
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
        {screens.map((scr, i) => {
          return (
            <tr key={i}>
              <td>{scr.optionDescrp}</td>
              <td>
                <Toggle
                  checked={scr.enableDisable || false}
                  onChange={(v) =>
                    setScreens((prev) =>
                      prev.map((item) =>
                        item.id === scr.id
                          ? { ...item, enableDisable: !item.enableDisable }
                          : item
                      )
                    )
                  }
                />
              </td>
              <td>
                {scr.rulesPeriod ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gridGap: "6px",
                    }}
                  >
                    No. of anonymous reporting permitted:{" "}
                    <Input
                      value={scr.rulesCount || ""}
                      onChange={(e) =>
                        setScreens((prev) =>
                          prev.map((s) =>
                            s.id === scr.id
                              ? { ...s, rulesCount: +e.target.value || 0 }
                              : s
                          )
                        )
                      }
                      style={{ width: "2.5rem" }}
                    />{" "}
                    per{" "}
                    <Combobox
                      name="rulesPeriod"
                      options={[
                        { label: "Day", value: "day" },
                        { label: "Week", value: "week" },
                        { label: "Month", value: "month" },
                        { label: "Year", value: "year" },
                      ]}
                      value={scr.rulesPeriod}
                      setValue={(n, value) =>
                        setScreens((prev) =>
                          prev.map((s) =>
                            s.id === scr.id ? { ...s, rulesPeriod: value } : s
                          )
                        )
                      }
                    />
                  </span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          );
        })}
      </Table>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={!update.length}
          onClick={() => {
            Promise.all(
              update.map((item) =>
                updateScreen(item, { params: { "{ID}": item.id } })
              )
            )
              .then((resp) => {
                if (resp?.length) {
                  screenRef.current = [
                    ...screens.filter(
                      (item) => !resp.some((op) => op.id === item.id)
                    ),
                    ...resp,
                  ];
                  setScreens((prev) =>
                    prev.map(
                      (item) => resp.find((op) => op.id === item.id) || item
                    )
                  );
                }
              })
              .catch((err) => {
                Prompt({
                  type: "error",
                  message: err.message,
                });
              });
          }}
        >
          Save
        </button>
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
          { label: "Type Label" },
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
            <td>{inc.type_descrip}</td>
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
        <button className="btn wd-100">Save</button>
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

  const { post: postType, put: updateType, loading } = useFetch(
    defaultEndpoints.typesOfIncident + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          typesOfIncident?.some(
            (item) =>
              (+item.type === +data.type ||
                item.type_descrip?.trim().toLowerCase() ===
                  data.type_descrip?.trim().toLowerCase()) &&
              item.id !== data.id
          )
        ) {
          Prompt({
            type: "information",
            message: `Type already exists.`,
          });
          return;
        }
        (edit ? updateType : postType)(data)
          .then((data) => {
            if (data.id) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        {...register("type", {
          required: "Please enter a Option",
        })}
        error={errors.type}
      />
      <Input
        {...register("type_descrip", {
          required: "Please enter a Type Label",
        })}
        error={errors.type_descrip}
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
  const settingsRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const { put: updateSettings } = useFetch(
    defaultEndpoints.sentinelNotifications + `/${settings?.id || ""}`
  );
  const [sentinelNotifications, setSentinelNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const { get: getDepts } = useFetch(defaultEndpoints.departments);
  const { get: getUsers } = useFetch(defaultEndpoints.users + `?size=10000`);
  const { get: getSentinelNotifications } = useFetch(
    defaultEndpoints.sentinelNotifications
  );
  const { remove: deleteNoti } = useFetch(
    defaultEndpoints.sentinelNotifications + "/{ID}"
  );
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    getUsers().then((data) => {
      if (data?._embedded?.user) {
        setUsers(
          data._embedded?.user.map((user) => {
            user.role = user.role.split(",");
            user.value = user.id;
            user.label = user.username || user.name;
            return user;
          })
        );
      }
    });
    getDepts().then((data) => {
      if (data?._embedded?.department) {
        setDepts(
          data._embedded.department.map((dept) => ({
            value: dept.id,
            label: dept.name,
          }))
        );
      }
    });
    getSentinelNotifications().then((data) => {
      if (data?._embedded?.configSentineLEventNotification) {
        setSentinelNotifications(
          data._embedded.configSentineLEventNotification.filter(
            (item) => item.userId !== 0
          )
        );
        const _settings = data._embedded.configSentineLEventNotification.find(
          (item) => item.userId === 0
        );
        if (_settings) {
          _settings.mobile = _settings.mobile === "true";
          _settings.email = _settings.email === "true";
          _settings.emailContent = _settings.emailContent.split(",");
          settingsRef.current = _settings;
          setSettings(_settings);
        }
      }
    });
  }, []);
  useEffect(() => {
    setSettingsChanged(
      JSON.stringify(settingsRef.current) !== JSON.stringify(settings)
    );
  }, [settings]);
  return (
    <Box label="SENTINEL EVENT NOTIFICATION" collapsable={true}>
      <div className={s.sentinelNotificationHead}>
        <p>Notify to:</p>
        <section className={s.notificationOptions}>
          <p>Notify Through:</p>
          <Checkbox
            checked={settings?.email || false}
            label="Email"
            onChange={() =>
              setSettings((prev) => ({ ...prev, email: !prev.email }))
            }
          />
          <Checkbox
            checked={settings?.mobile || false}
            label="Phone"
            onChange={() =>
              setSettings((prev) => ({ ...prev, mobile: !prev.mobile }))
            }
          />
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
            <NotifyForm
              {...(edit && { edit })}
              setEdit={setEdit}
              key={edit ? "edit" : "add"}
              users={users}
              depts={depts}
              sentinelNotifications={sentinelNotifications}
              onSuccess={(notification) => {
                setSentinelNotifications((prev) => {
                  return prev.find((c) => c.id === notification.id)
                    ? prev.map((c) =>
                        c.id === notification.id ? notification : c
                      )
                    : [...prev, notification];
                });
                setEdit(null);
              }}
              clearForm={setEdit}
            />
          </td>
        </tr>
        {sentinelNotifications.map((noti, i) => (
          <tr key={i}>
            <td>
              {users?.find((u) => u.value === noti.userId)?.username ||
                noti.userId}
            </td>
            <td>
              {depts?.find((u) => u.value.toString() === noti.dept.toString())
                ?.label || noti.dept}
            </td>
            <td>{noti.design}</td>
            <td>{noti.mobile}</td>
            <td>{noti.email}</td>
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
                      message: `Are you sure you want to remove this?`,
                      callback: () => {
                        deleteNoti(null, {
                          params: { "{ID}": noti.id },
                        }).then(({ res }) => {
                          if (res.status === 204) {
                            setSentinelNotifications((prev) =>
                              prev.filter((c) => c.id !== noti.id)
                            );
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
      <div className={s.sentinelNotificationContent}>
        <h4>E-mail/SMS Notification Content</h4>
        <p>
          <strong>Subject</strong>: Sentinel Event reported.
          <br />
          Please find below details for the sentinel event reported.
        </p>
        <section className={s.checkboxes}>
          {[
            "IR code",
            "Category",
            "Subcategory",
            "Incident Location",
            "Reported by name",
            "Reported by department",
            "Date & time of the incident",
            "Reporting date & time",
          ].map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={settings?.emailContent?.includes(item) || false}
              onChange={(e) => {
                setSettings((prev) => ({
                  ...prev,
                  emailContent: !e.target.checked
                    ? prev.emailContent.filter((i) => i !== item)
                    : [...prev.emailContent, item],
                }));
              }}
            />
          ))}
        </section>
        <p>Please contact IR manager for further information.</p>
      </div>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={!settingsChanged}
          onClick={() => {
            updateSettings({
              ...settings,
              emailContent: settings.emailContent
                .filter((item) => item)
                .join(","),
            }).then((data) => {
              if (data?.mobile) {
                data.mobile = data.mobile === "true";
                data.email = data.email === "true";
                data.emailContent = data.emailContent.split(",");
                settingsRef.current = data;
                setSettings(data);
              }
            });
          }}
        >
          Save
        </button>
      </div>
    </Box>
  );
};
const NotifyForm = ({
  edit,
  onChange,
  users,
  depts,
  sentinelNotifications,
  onSuccess,
  clearForm,
}) => {
  const { handleSubmit, register, watch, control, setValue, reset } = useForm();
  const { post: addNotification, put: updateNotification, loading } = useFetch(
    defaultEndpoints.sentinelNotifications
  );
  useEffect(() => reset({ ...edit }), [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          !edit &&
          sentinelNotifications?.some((noti) => noti.userId === data.userId)
        ) {
          Prompt({
            type: "information",
            message: `Person already selected.`,
          });
          return;
        }
        (edit ? updateNotification : addNotification)(data).then((data) => {
          if (data) {
            onSuccess(data);
          }
        });
        reset();
      })}
    >
      <Select
        options={users}
        name="userId"
        control={control}
        formOptions={{
          required: "Select a Person",
        }}
        onChange={({ department, email, contact }) => {
          setValue("dept", department);
          setValue("email", email);
          setValue("mobile", contact);
        }}
      />
      <Select
        options={depts}
        name="dept"
        control={control}
        formOptions={{
          required: "Select a Person",
        }}
      />
      <Input {...register("design")} placeholder="Enter" />
      <MobileNumberInput
        register={register}
        setValue={setValue}
        name="mobile"
        placeholder="Enter"
        watch={watch}
      />
      <Input {...register("email")} placeholder="Enter" />
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

const HodApprovalProcess = () => {
  const hodApprovalRef = useRef([]);
  const [hodApproval, setHodApproval] = useState([]);
  const [update, setUpdate] = useState([]);
  const { get: getHodApproval } = useFetch(defaultEndpoints.hodApproval);
  const { put: updateHodApproval } = useFetch(
    defaultEndpoints.hodApproval + "/{ID}"
  );
  useEffect(() => {
    getHodApproval().then((data) => {
      if (data?._embedded?.configHodapproval) {
        const _data = data._embedded.configHodapproval.map((item) => ({
          id: item.id,
          options: item.options,
        }));
        hodApprovalRef.current = _data;
        setHodApproval(_data);
      }
    });
  }, []);
  useEffect(() => {
    setUpdate(
      hodApproval.filter((newItem) => {
        const oldItem = hodApprovalRef.current.find(
          (old) => old.id === newItem.id
        );
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
    );
  }, [hodApproval]);
  return (
    <Box label="HOD APPROVAL PROCESS" collapsable={true}>
      <Table className={s.hodApproval}>
        <tr>
          <td>
            <input
              type="checkbox"
              id="hodApproval-acknowledgement"
              checked={
                hodApproval.find((item) => item.id === 1)?.options || false
              }
              onChange={() => {
                setHodApproval((prev) =>
                  prev.map((item) =>
                    item.id === 1 ? { ...item, options: !item.options } : item
                  )
                );
              }}
            />
            <label htmlFor="hodApproval-acknowledgement">
              <strong>HOD acknowledgement</strong> - IR is sent to HOD for
              acknowledgement, however, the step has no dependency on further
              actions.
            </label>
          </td>
        </tr>
      </Table>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={!update.length}
          onClick={() => {
            Promise.all(
              update.map((item) =>
                updateHodApproval(item, { params: { "{ID}": item.id } })
              )
            )
              .then((resp) => {
                if (resp?.length) {
                  hodApprovalRef.current = [
                    ...hodApproval.filter(
                      (item) => !resp.some((op) => op.id === item.id)
                    ),
                    ...resp,
                  ];
                  setHodApproval((prev) =>
                    prev.map(
                      (item) => resp.find((op) => op.id === item.id) || item
                    )
                  );
                }
              })
              .catch((err) => {
                Prompt({
                  type: "error",
                  message: err.message,
                });
              });
          }}
        >
          Save
        </button>
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
    defaultEndpoints.dashboardElements + `/{ID}`
  );
  useEffect(() => {
    getDashboardElements().then((data) => {
      if (data?._embedded?.dashboardElements) {
        const _data = data._embedded.dashboardElements.map((item) => {
          delete item._links;
          return item;
        });
        dataElementRef.current = _data;
        setDashboardDataElements(_data);
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
            {dashboardDataElements
              .filter((item) => item.type === 1)
              .map((item, i) => (
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
                                ? {
                                    ...op,
                                    irInvestigator: !item.irInvestigator,
                                  }
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
        </div>
        <div>
          <Table
            columns={[
              { label: "Statistics Option" },
              { label: "IR Manager" },
              { label: "IR Investigator" },
            ]}
          >
            {dashboardDataElements
              .filter((item) => item.type === 2)
              .map((item, i) => (
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
                                ? {
                                    ...op,
                                    irInvestigator: !item.irInvestigator,
                                  }
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
            <Toggle
              checked={
                dashboardDataElements.find(
                  (item) => item.statusOption === "Enable cancel IR function"
                )?.irMgr || false
              }
              onChange={(e) => {
                setDashboardDataElements((prev) =>
                  prev.map((item) =>
                    item.statusOption === "Enable cancel IR function"
                      ? {
                          ...item,
                          irMgr: e.target.checked,
                          irInvestigator: e.target.checked,
                        }
                      : item
                  )
                );
              }}
            />
          </section>
        </div>
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
                Prompt({
                  type: "error",
                  message: err.message,
                });
              });
          }}
          className="btn wd-100"
        >
          Save
        </button>
      </div>
    </Box>
  );
};

const IncidentClosure = () => {
  const elementRef = useRef([]);
  const [elements, setElements] = useState([]);
  const [update, setUpdate] = useState([]);
  const { get: getElements } = useFetch(defaultEndpoints.incidentClosureFields);
  const { put: updateElement } = useFetch(
    defaultEndpoints.incidentClosureFields + "/{ID}"
  );
  useEffect(() => {
    getElements().then((data) => {
      if (data?._embedded?.incidentClosureFields) {
        elementRef.current = data?._embedded?.incidentClosureFields;
        setElements(data._embedded.incidentClosureFields);
      }
    });
  }, []);
  useEffect(() => {
    setUpdate(
      elements.filter((newItem) => {
        const oldItem = elementRef.current.find((old) => old.id === newItem.id);
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
    );
  }, [elements]);
  return (
    <Box label="INCIDENT CLOSURE" collapsable={true}>
      <div className={s.incidentClosure}>
        <p>IR closure format to include</p>
        <section className={s.checkboxes}>
          {elements
            .filter((item) => item.elements !== 2)
            .filter(
              (item) =>
                item.elementsDescrip !==
                "Send thank you notification to RCA team members"
            )
            .map((item) => {
              const Element = item.elements === 1 ? Checkbox : Toggle;
              return (
                <Element
                  key={item.id}
                  label={item.elementsDescrip}
                  checked={item.enable || false}
                  onChange={(v) => {
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === item.id ? { ...el, enable: !el.enable } : el
                      )
                    );
                  }}
                />
              );
            })}
        </section>
        <div className={s.capaClosure}>
          {elements
            .filter(
              (item) =>
                item.elements === 2 ||
                item.elementsDescrip ===
                  "Send thank you notification to RCA team members"
            )
            .map((item) => {
              const Element = item.elements === 1 ? Checkbox : Toggle;
              return item.elements === 2 ? (
                <section key={item.id}>
                  <label>{item.elementsDescrip}</label>
                  <Element
                    checked={item.enable || false}
                    onChange={(v) => {
                      setElements((prev) =>
                        prev.map((el) =>
                          el.id === item.id ? { ...el, enable: !el.enable } : el
                        )
                      );
                    }}
                  />
                </section>
              ) : (
                <Element
                  key={item.id}
                  label={item.elementsDescrip}
                  checked={item.enable || false}
                  onChange={(v) => {
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === item.id ? { ...el, enable: !el.enable } : el
                      )
                    );
                  }}
                />
              );
            })}
        </div>
      </div>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={!update.length}
          onClick={() => {
            Promise.all(
              update.map((item) =>
                updateElement(item, { params: { "{ID}": item.id } })
              )
            )
              .then((resp) => {
                if (resp?.length) {
                  elementRef.current = [
                    ...elements.filter(
                      (item) => !resp.some((op) => op.id === item.id)
                    ),
                    ...resp,
                  ];
                  setElements((prev) =>
                    prev.map(
                      (item) => resp.find((op) => op.id === item.id) || item
                    )
                  );
                }
              })
              .catch((err) => {
                Prompt({
                  type: "error",
                  message: err.message,
                });
              });
          }}
        >
          Save
        </button>
      </div>
    </Box>
  );
};

const AcceptableTat = () => {
  const { handleSubmit, register, reset, watch, setValue } = useForm();
  const tatRef = useRef();
  const [tat, setTat] = useState(null);
  const { get: getTat } = useFetch(defaultEndpoints.configTat);
  const { put: updateTat } = useFetch(
    defaultEndpoints.configTat + `/${tat?.id}`
  );
  useEffect(() => {
    getTat().then((data) => {
      if (data?._embedded?.configAcceptableTAT[0]) {
        const _tat = data?._embedded?.configAcceptableTAT[0];
        tatRef.current = {
          ..._tat,
          excludeWeek: _tat.excludeWeek.split(","),
          sentinelExcludeWeek: _tat.sentinelExcludeWeek.split(","),
        };
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
            excludeWeek: data.excludeWeek.filter((d) => d).join(","),
            sentinelExcludeWeek: data.sentinelExcludeWeek
              .filter((d) => d)
              .join(","),
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
                  { label: "S", value: "0" },
                  { label: "M", value: "1" },
                  { label: "T", value: "2" },
                  { label: "W", value: "3" },
                  { label: "T", value: "4" },
                  { label: "F", value: "5" },
                  { label: "S", value: "6" },
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
                  { label: "S", value: "0" },
                  { label: "M", value: "1" },
                  { label: "T", value: "2" },
                  { label: "W", value: "3" },
                  { label: "T", value: "4" },
                  { label: "F", value: "5" },
                  { label: "S", value: "6" },
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
          <button className="btn wd-100">Save</button>
        </div>
      </form>
    </Box>
  );
};

const IrInvestigationDetails = () => {
  const elementRef = useRef([]);
  const [elements, setElements] = useState([]);
  const [update, setUpdate] = useState([]);
  const { get: getElements } = useFetch(
    defaultEndpoints.irInvestigationDetails
  );
  const { put: updateElement } = useFetch(
    defaultEndpoints.irInvestigationDetails + "/{ID}"
  );
  useEffect(() => {
    getElements().then((data) => {
      if (data?._embedded?.irInvestigationDetails) {
        elementRef.current = data._embedded.irInvestigationDetails;
        setElements(data._embedded.irInvestigationDetails);
      }
    });
  }, []);
  useEffect(() => {
    setUpdate(
      elements.filter((newItem) => {
        const oldItem = elementRef.current.find((old) => old.id === newItem.id);
        return JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
    );
  }, [elements]);
  return (
    <Box label="IR INVESTIGATION-DETAILS" collapsable={true}>
      <div className={s.irInvestigationDetail}>
        <section className={s.section_1}>
          <section>
            <label>View related incidents</label>
            <Toggle
              checked={
                elements.find((el) => el.elements === 1)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 1
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
          </section>
        </section>
        <section className={s.section_2}>
          <label>Criteria for automated similar incident alert</label>
          <div className={s.checkboxes}>
            <span>Show IR's of:</span>
            <Checkbox
              label={elements.find((el) => el.elements === 2)?.element_descrip}
              checked={
                elements.find((el) => el.elements === 2)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 2
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
            <Checkbox
              label={elements.find((el) => el.elements === 3)?.element_descrip}
              checked={
                elements.find((el) => el.elements === 3)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 3
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
            <Checkbox
              label={elements.find((el) => el.elements === 4)?.element_descrip}
              checked={
                elements.find((el) => el.elements === 4)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 4
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
            <Checkbox
              label={elements.find((el) => el.elements === 5)?.element_descrip}
              checked={
                elements.find((el) => el.elements === 5)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 5
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
            <Combobox
              className={s.duration}
              label="Duration"
              value={elements.find((el) => el.elements === 6)?.value || ""}
              options={[
                { value: "oneMonth", label: "Last 1 Month" },
                { value: "threeMonths", label: "Last 3 months" },
                { value: "sixMonths", label: "Last 6 months" },
                { value: "oneYear", label: "Last 1 year" },
                { value: "twoYears", label: "Last 2 years" },
                { value: "threeYears", label: "Last 3 years" },
              ]}
              setValue={(n, value) =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 6 ? { ...item, value } : item
                  )
                )
              }
            />
          </div>
        </section>
        <section className={s.section_3}>
          <section>
            <label>
              {elements.find((el) => el.elements === 7)?.element_descrip}
            </label>
            <Toggle
              checked={
                elements.find((el) => el.elements === 7)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 7
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
          </section>
          <section>
            <label>
              {elements.find((el) => el.elements === 8)?.element_descrip}
            </label>
            <Toggle
              checked={
                elements.find((el) => el.elements === 8)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 8
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
          </section>
          <section>
            <label>
              {elements.find((el) => el.elements === 9)?.element_descrip}
            </label>
            <Toggle
              checked={
                elements.find((el) => el.elements === 9)?.enable || false
              }
              onChange={() =>
                setElements((prev) =>
                  prev.map((item) =>
                    item.elements === 9
                      ? { ...item, enable: !item.enable }
                      : item
                  )
                )
              }
            />
          </section>

          <Checkbox
            label={elements.find((el) => el.elements === 10)?.element_descrip}
            checked={elements.find((el) => el.elements === 10)?.enable || false}
            onChange={() =>
              setElements((prev) =>
                prev.map((item) =>
                  item.elements === 10
                    ? { ...item, enable: !item.enable }
                    : item
                )
              )
            }
          />
        </section>
      </div>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={!update.length}
          onClick={() => {
            Promise.all(
              update.map((item) =>
                updateElement(item, { params: { "{ID}": item.id } })
              )
            )
              .then((resp) => {
                if (resp?.length) {
                  elementRef.current = [
                    ...elements.filter(
                      (item) => !resp.some((op) => op.id === item.id)
                    ),
                    ...resp,
                  ];
                  setElements((prev) =>
                    prev.map(
                      (item) => resp.find((op) => op.id === item.id) || item
                    )
                  );
                }
              })
              .catch((err) => {
                Prompt({
                  type: "error",
                  message: err.message,
                });
              });
          }}
        >
          Save
        </button>
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
