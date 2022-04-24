import React, { useState, useEffect, useContext, useCallback } from "react";
import { SiteContext } from "../SiteContext";
import { FaInfoCircle, FaRegTrashAlt, FaPlus, FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BiChevronsDown } from "react-icons/bi";
import { BsPencilFill } from "react-icons/bs";
import { Input, Select, Textarea, Table, moment, Moment } from "./elements";
import { Prompt, Modal } from "./modal";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useHisFetch, useFetch } from "../hooks";
import { endpoints as defaultEndpoints, preventability } from "../config";
import s from "./incidentReporting.module.scss";

const Data = ({ label, value, children }) => (
  <section className={`${s.data} ${children ? s.richData : ""}`}>
    <span className={s.label}>{label}:</span>
    {children || (
      <>
        {" "}
        <span className={s.value}>{value || "-"}</span>
      </>
    )}
  </section>
);

export default function IncidentReporting() {
  const { user, endpoints, irTypes } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [ir, setIr] = useState(null);
  const [parameters, setParameters] = useState(null);
  const [showAcknowledgeForm, setShowAcknowledgeForm] = useState(false);

  // const { get: getIr } = useFetch(defaultEndpoints.incidentReport + "/{ID}");
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
  const { get: getCategories } = useFetch(defaultEndpoints.categories);

  const { put: updateStatus } = useFetch(
    defaultEndpoints.incidentReport + `/${ir?.id || ""}`
  );

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
          null,
      ],
      getUsersWithRoles(),
      ...[(endpoints?.patients?.url && getAllPatients()) || null],
      getCategories(),
    ])
      .then(
        ([
          location,
          departments,
          users,
          usersWithRoles,
          patients,
          categories,
        ]) => {
          const _parameters = {};
          const userDetails = (usersWithRoles?._embedded?.user || []).map(
            (user) => {
              user.role = Array.isArray(user.role)
                ? user.role
                : user.role?.split(",") || [];
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

          if (Array.isArray(departments?.[endpoints?.departments.key1])) {
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

          if (Array.isArray(users?.[endpoints?.users.key1])) {
            const _users = users[endpoints?.users.key1].map((user) => {
              const userDetail = userDetails.find((u) =>
                new RegExp(u.name, "i").test(user.userName)
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
                label: item.userName,
                value: item.userId,
              }));
            _parameters.users = _users.map((item) => ({
              label: item.userName,
              value: item.userId,
              department:
                departments?.[endpoints?.departments.key1]
                  .find((dept) => dept.departmentCode === item.departmentCode)
                  ?.departmentId.toString() || "",
            }));
          } else if (users?.[endpoints.users.key1]) {
            const _users = users?.[endpoints.users.key1].map((user) => {
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
              label: item.fullName,
              value: item.id,
              department: item.departmentMaster?.code,
            }));
          } else {
            _parameters.hods = userDetails
              .filter(
                (u) =>
                  u.role.includes("hod") && u.department === user.department
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
          }

          if (Array.isArray(patients)) {
            _parameters.patients = patients.map((patient) => ({
              value: patient.uhid,
              label: patient.name,
            }));
          }

          if (categories?._embedded?.category) {
            _parameters.categories = categories?._embedded?.category;
          }

          active && setParameters((prev) => ({ ...prev, ..._parameters }));
        }
      )
      .catch((err) => {
        console.log(err);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (location.state?.ir) {
      console.log(location.state.ir);
      const { ir, readOnly } = location.state;
      setIr(ir);
    }
  }, [location]);

  return (
    <div
      className={`${s.container} ${s.preview}`}
      data-testid="incidentReportPreview"
    >
      <header>
        <h3>IR REPORT PREVIEW</h3>
        {location.state?.from && (
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
        )}
      </header>
      <div className={s.content}>
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
            label="Location"
            value={
              parameters?.locations?.find(
                (item) => item.value?.toString() === ir?.location?.toString()
              )?.label || ir?.location
            }
          />
          <Data
            label="Reporting Department"
            value={
              parameters?.departments?.find(
                (dept) => dept.value.toString() === ir?.department?.toString()
              )?.label || ir?.department
            }
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
        </div>
        <Box label="INCIDENT DETAILS" collapsable={true}>
          <div className={s.incidentDetail}>
            <Data
              label="Date of Incident"
              value={
                parameters?.locations?.find(
                  (item) => item.value?.toString() === ir?.location?.toString()
                )?.label || ir?.location
              }
            />
            <Data
              label="Location of Incident"
              value={
                parameters?.locations?.find(
                  (item) => item.value?.toString() === ir?.location?.toString()
                )?.label || ir?.location
              }
            />
            <Data label="Location Detail" value={ir?.locationDetailsEntry} />
            <Data
              label="Anonymous reporting"
              value={ir?.userId ? "No" : "Yes"}
            />
          </div>
        </Box>
        <Box label="TYPE OF INCIDENT" collapsable={true}>
          <Data label="Type">
            <div className={s.highlight}>
              <Data
                label="Degree of harm to patied / resident"
                value="Mild harm - Scratches on skin"
              />
            </div>
          </Data>
        </Box>
        <Box label="INCIDENT CATEGORY" collapsable={true}>
          <div className={s.categoryWrapper}>
            <div className={s.category}>
              <Data
                label="Incident Category"
                value={
                  parameters?.categories?.find(
                    (item) => item.id?.toString() === ir?.inciCateg?.toString()
                  )?.name || ir?.inciCateg
                }
              />
              <Data
                label="Incident Sub-category"
                value={
                  parameters?.categories
                    ?.find(
                      (item) =>
                        item.id?.toString() === ir?.inciCateg?.toString()
                    )
                    ?.subCategorys?.find(
                      (item) =>
                        item.id?.toString() === ir?.inciSubCat?.toString()
                    )?.name || ir?.inciSubCat
                }
              />
            </div>
            <Data label="Prescribed">
              <div className={`${s.highlight} ${s.drugs}`}>
                <Data label="Name of Drug" value="Ranitidine" />
                <Data label="Route" value="Oral" />
                <Data label="Dose" value="300mg" />
              </div>
            </Data>
            <Data label="Administered">
              <div className={`${s.highlight} ${s.administration}`}>
                <Data label="Name of Drug" value="Ranitidine" />
                <Data label="Route" value="Oral" />
                <Data label="Dose" value="600mg" />
                <Data label="Administration Date" value="12/12/2020 9:30" />
                <Data label="Administered By" value="Sophia" />
              </div>
            </Data>
          </div>
        </Box>
        <Box label="PERSON AFFECTED" collapsable={true}>
          <div className={s.placeholder}>Placeholder</div>
        </Box>
        <Box label="INCIDENT DESCRIPTION" collapsable={true}>
          <Data label="Incident Details" value={ir?.inciDescription} />
          <Data
            label="Departments Involved"
            value={ir?.deptsLookupMultiselect
              .split(",")
              .map(
                (item) =>
                  parameters?.departments?.find(
                    (dept) => dept.value?.toString() === item?.toString()
                  )?.label || item
              )
              .join(", ")}
          />
        </Box>
        <Box label="CONTRIBUTING FACTORS" collapsable={true}>
          <div className={s.contributingFactor}>
            <Data label="Preventability of Incident">
              <div className={s.highlight}>
                {
                  preventability.find(
                    (pr) =>
                      pr.value?.toString() === ir?.preventability?.toString()
                  )?.label
                }
              </div>
            </Data>
          </div>
        </Box>
        <div className={s.tables}>
          <div className={s.actionWrapper}>
            <h4>Immediate Action Taken</h4>
            <ActionTaken
              users={parameters?.users}
              actions={ir?.actionTaken || []}
            />
          </div>
          <div>
            <h4>Incident witnessed by</h4>
            <Witnesses
              users={parameters?.users}
              witnesses={ir?.witness || []}
              departments={parameters?.departments}
            />
          </div>
          <div>
            <h4>Incident notified to</h4>
            <Notifications
              users={parameters?.users}
              departments={parameters?.departments}
              notifications={ir?.notification || []}
            />
          </div>
        </div>
        <div className={s.fieldWrapper}>
          <Data label="uploaded">{ir?.upload.length} File(s) Uploaded</Data>
          <Data label="Incident Reported by">
            {parameters?.users?.find(
              (user) => user.value.toString() === ir?.userId?.toString()
            )?.label || ir?.userId}
          </Data>
          <Data label="Department">
            {parameters?.departments?.find(
              (user) => user.value.toString() === ir?.department?.toString()
            )?.label || ir?.department}
          </Data>
          <Data label="Head of the Department">
            {parameters?.hods?.find(
              (user) => user.value.toString() === ir?.headofDepart?.toString()
            )?.label || ir?.headofDepart}
          </Data>
        </div>
        {ir?.status.toString() !== "11" && (
          <div className={s.btns}>
            <button
              onClick={() => {
                setShowAcknowledgeForm(true);
              }}
              className="btn secondary wd-100"
            >
              Acknowledge
            </button>
            <button
              className="btn secondary wd-100"
              type="button"
              onClick={() => {
                console.log("close");
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
      <Modal
        open={showAcknowledgeForm}
        setOpen={setShowAcknowledgeForm}
        head={true}
        label="Acknowledge"
        className={s.acknowledgeForm}
      >
        <AcknowledgeForm
          ir={ir}
          closeForm={() => setShowAcknowledgeForm(false)}
          onSuccess={() => {
            updateStatus({
              ...ir,
              status: "11",
            }).then(({ data }) => {
              console.log(data);
              if (data?.id) {
                setIr(data);
                setShowAcknowledgeForm(false);
                Prompt({ type: "information", message: "IR Achknowledged" });
              } else {
                Prompt({
                  type: "error",
                  message: "Could not update IR status",
                });
              }
            });
          }}
        />
      </Modal>
    </div>
  );
}

const AcknowledgeForm = ({ ir, onSuccess, closeForm }) => {
  const { user } = useContext(SiteContext);
  const { handleSubmit, register, reset, setValue } = useForm();

  const { post: acknowledge, loading } = useFetch(defaultEndpoints.irHodAck);

  useEffect(() => {
    setValue(
      "responseTime",
      moment({ time: new Date(), format: "YYYY-MM-DDThh:mm:ss" })
    );
    setValue("responseBy", user.name);
  }, []);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        acknowledge({
          remarks: values.remark,
          responseBy: user.id,
          userId: user.id,
          responseOn: values.responseTime,
          irId: ir.id,
        })
          .then((res) => {
            if (res.data?.id) {
              return onSuccess();
            } else {
              Prompt({
                type: "error",
                message: "Could not save acknowledgement.",
              });
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Textarea
        label="Remarks"
        className={s.remark}
        {...register("remark", { required: "Enter a comment" })}
      />
      <Input label="Response by" {...register("responseBy")} readOnly />
      <Input
        label="Response On"
        type="datetime-local"
        readOnly
        {...register("responseTime")}
      />
      <section className={s.btns}>
        <button
          type="button"
          className="btn secondary wd-100"
          onClick={() => {
            reset();
            closeForm();
          }}
        >
          Clear
        </button>
        <button className="btn wd-100">Acknowledge</button>
      </section>
    </form>
  );
};

export const ActionTaken = ({ actions, users }) => {
  return (
    <Table
      columns={[
        { label: "Action Taken" },
        { label: "Action Taken By" },
        { label: "Date & Time" },
      ]}
      className={s.actionTaken}
    >
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
        </tr>
      ))}
    </Table>
  );
};

export const Witnesses = ({ users, departments, witnesses }) => {
  return (
    <Table
      columns={[{ label: "Name" }, { label: "Department" }]}
      className={s.witnesses}
    >
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
        </tr>
      ))}
    </Table>
  );
};

export const Notifications = ({ notifications, users, departments }) => {
  return (
    <Table
      columns={[
        { label: "Name" },
        { label: "Department" },
        { label: "Date & Time" },
      ]}
      className={s.notified}
    >
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
        </tr>
      ))}
    </Table>
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
