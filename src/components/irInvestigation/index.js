import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import {
  InvestigationContext,
  InvestigationProvider,
} from "./InvestigationContext";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import { Tabs, Moment, moment } from "../elements";
import { paths, endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import { Prompt } from "../modal";
import s from "./style.module.scss";

import Investigation from "./investigation";
import Capa from "./capa";

const Data = ({ label, value }) => {
  return (
    <section className={s.data}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </section>
  );
};

const IrInvestigation = () => {
  const { user, endpoints, irTypes } = useContext(SiteContext);
  const { ir, setIr } = useContext(InvestigationContext);
  const [parameters, setParameters] = useState({});
  const location = useLocation();

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
                  u.role?.includes(9) &&
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
                  u.role?.includes(9) &&
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
        Prompt({
          type: "error",
          message: err.message,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={s.mainContainer}>
      <header>
        <h3>IR INVESTIGATION</h3>
        <Link
          to={
            paths.incidentDashboard.basePath +
            "/" +
            paths.incidentDashboard.qualityDashboard +
            "?" +
            new URLSearchParams({
              view: user.role.includes(7) ? "all" : "assigned",
              ...(user.role.includes(7) ? {} : { irInvestigator: user.id }),
            })
          }
        >
          Back to IR Dashboard
        </Link>
      </header>
      {
        //   <div className={s.summary}>
        //   <Data label="IR Code" value={ir?.sequence} />
        //   <Data
        //     label="Incident Date & Time"
        //     value={moment({
        //       time: ir?.incident_Date_Time,
        //       format: "DD/MM/YYYY hh:mm",
        //     })}
        //   />
        //   <Data
        //     label="Location"
        //     value={
        //       parameters?.locations?.find(
        //         (item) => item.value?.toString() === ir?.location?.toString()
        //       )?.label || ir?.location
        //     }
        //   />
        //   <Data
        //     label="Reporting Department"
        //     value={
        //       parameters?.departments?.find(
        //         (dept) => dept.value.toString() === ir?.department?.toString()
        //       )?.label || ir?.department
        //     }
        //   />
        //   <Data
        //     label="Incident Type"
        //     value={
        //       irTypes?.find(
        //         (item) => item.value?.toString() === ir?.typeofInci?.toString()
        //       )?.label || ir?.typeofInci
        //     }
        //   />
        //   <Data
        //     label="Category"
        //     value={
        //       parameters?.categories?.find(
        //         (item) => item.id?.toString() === ir?.inciCateg?.toString()
        //       )?.name || ir?.inciCateg
        //     }
        //   />
        //   <Data
        //     label="Sub Category"
        //     value={
        //       parameters?.categories
        //         ?.find(
        //           (item) => item.id?.toString() === ir?.inciCateg?.toString()
        //         )
        //         ?.subCategorys?.find(
        //           (item) => item.id?.toString() === ir?.inciSubCat?.toString()
        //         )?.name || ir?.inciSubCat
        //     }
        //   />
        // </div>
      }
      <Tabs
        secondary
        tabs={[
          {
            label: "REPORTED IR",
            path: paths.incidentDashboard.irInvestigation.reportedIr.basePath,
          },
          {
            label: "IR APPROVAL",
            path: paths.incidentDashboard.irInvestigation.irApproval.basePath,
          },
          {
            label: "IR INVESTIGATION",
            path:
              paths.incidentDashboard.irInvestigation.investigation.basePath,
          },
          {
            label: "CAPA",
            path: paths.incidentDashboard.irInvestigation.capa,
          },
        ]}
      />
      <Routes>
        <Route
          path={
            paths.incidentDashboard.irInvestigation.investigation.basePath +
            "/*"
          }
          element={<Investigation />}
        />
        <Route
          path={paths.incidentDashboard.irInvestigation.capa + "/*"}
          element={<Capa />}
        />
        <Route path="/" element={<h3>Fallback</h3>} />
      </Routes>
    </div>
  );
};

const Wrapper = () => {
  return (
    <InvestigationProvider>
      <IrInvestigation />
    </InvestigationProvider>
  );
};

export default Wrapper;
