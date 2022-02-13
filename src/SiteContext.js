import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { irStatus } from "./config";
import defaultEndpoints from "./config/endpoints";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState(null);
  const [endpoints, setEndpoints] = useState(defaultEndpoints);
  const checkPermission = useCallback(
    ({ roleId, permission }) => {
      let roleMatch = false;
      if (Array.isArray(roleId)) {
        roleMatch = user.role.some((ur) => roleId.includes(ur));
      } else {
        roleMatch = user.role.includes(roleId);
      }
      if (roleMatch && !permission) {
        return true;
      }
      const allPermissions = [
        ...new Set(
          roles?.reduce((p, a) => [...p, ...(a.permission || [])], [])
        ),
      ];
      // const role = roles?.filter((role) => {
      //   return roleId === role.role || roleId.includes?.(role.role);
      // })[0];
      return (roleMatch && allPermissions?.includes(permission)) || false;
    },
    [roles, user]
  );
  useEffect(() => {
    if (!roles && user) {
      fetch(`${process.env.REACT_APP_HOST}/userPermission`)
        .then((res) => res.json())
        .then((data) => {
          if (data._embedded.userPermission) {
            setRoles(
              data._embedded.userPermission
                .filter((p) => user.role.includes(p.role))
                .map((role) => ({
                  ...role,
                  permission: role.permission.split(",").map((p) => p),
                }))
            );
          } else {
            alert("Could not fetch permissions");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        checkPermission,
        roles,
        setRoles,
        endpoints,
        setEndpoints,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const IrDashboardContext = createContext();
export const IrDashboardContextProvider = ({ children }) => {
  const { user } = useContext(SiteContext);
  const [parameters, setParameters] = useState();
  const [count, setCount] = useState({});
  useEffect(async () => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/location`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/user`).then((res) => res.json()),
    ])
      .then(([location, category, user]) => {
        const _parameters = { ...parameters };
        if (location?._embedded.location) {
          _parameters.locations = location._embedded.location;
        }
        if (category?._embedded.category) {
          _parameters.categories = category._embedded.category;
        }
        if (user?._embedded.user) {
          _parameters.users = user._embedded.user.map((user) => ({
            label: user.name,
            value: user.id,
          }));
          _parameters.investigators = user._embedded.user
            .map((user) => ({
              ...user,
              role: user.role.split(",").filter((r) => r),
            }))
            .filter((user) => user.role.includes("irInvestigator"))
            .map((user) => ({
              label: user.name,
              value: user.id,
            }));
        }
        setParameters(_parameters);
      })
      .catch((err) => {
        console.error(err);
      });
    const countByStatus = await Promise.all([
      ...irStatus.map((status) =>
        fetch(
          `${process.env.REACT_APP_HOST}/IncidentReport/search/countByStatus?status=${status.id}`
        ).then((res) => res.json())
      ),
    ])
      .then((data) => {
        return irStatus.reduce((p, a, i) => {
          p[a.id] = data[i];
          return p;
        }, {});
      })
      .catch((err) => {
        console.error(err);
      });
    const otherCounts = await Promise.all([
      fetch(
        `${process.env.REACT_APP_HOST}/IncidentReport/search/countCurrentMonth`
      ).then((res) => res.json()),
      fetch(
        `${process.env.REACT_APP_HOST}/IncidentReport/search/countByTypeofInci?typeofInci=8`
      ).then((res) => res.json()),
      fetch(
        `${process.env.REACT_APP_HOST}/IncidentReport/search/countByPatientYesOrNo?patientYesOrNo=yes`
      ).then((res) => res.json()),
      fetch(
        `${process.env.REACT_APP_HOST}/IncidentReport/search/countByUserId?userId=${user.id}`
      ).then((res) => res.json()),
      fetch(
        `${process.env.REACT_APP_HOST}/IncidentReport/search/countByDepartment?department=${user.department}`
      ).then((res) => res.json()),
    ])
      .then(
        ([currentMonth, sentinel, patientComplaint, myIr, departmentIr]) => ({
          currentMonth,
          sentinel,
          patientComplaint,
          myIr,
          departmentIr,
        })
      )
      .catch((err) => {
        console.log(err);
      });
    setCount({ ...countByStatus, ...otherCounts });
  }, []);
  return (
    <IrDashboardContext.Provider
      value={{
        count,
        parameters,
        setParameters,
      }}
    >
      {children}
    </IrDashboardContext.Provider>
  );
};
