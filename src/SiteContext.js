import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { irStatus } from "./config";
import { useFetch } from "./hooks";
import { Prompt } from "./components/modal";
import defaultEndpoints from "./config/endpoints";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [his, setHis] = useState(false);
  const [irTypes, setIrTypes] = useState([]);
  const navigate = useNavigate();

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
      return (roleMatch && allPermissions?.includes(permission)) || false;
    },
    [roles, user]
  );

  const logout = useCallback(() => {
    if (his) {
      // (async () => {
      //   await fetch(endpoints.logout.url, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       userName: user.name,
      //       clientRefId: "Napier123",
      //       appContext: "",
      //       securityToken: sessionStorage.getItem("HIS-access-token"),
      //     }),
      //   });
      // })();
    }

    setUser(null);
    setRoles(null);
    setHis(false);
    setEndpoints(null);
    sessionStorage.removeItem("HIS-access-token");
    sessionStorage.removeItem("access-token");
    sessionStorage.removeItem("tenant-id");
    sessionStorage.removeItem("tenant-timezone");
    navigate(
      `/login${
        sessionStorage.getItem("db-schema")
          ? `?tenantId=${sessionStorage.getItem("db-schema")}`
          : ""
      }`
    );
  }, [user, endpoints]);

  useEffect(() => {
    if (!roles && user) {
      fetch(
        defaultEndpoints.userPermissions +
          `?tenantId=${sessionStorage.getItem("db-schema")}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("access-token"),
          },
        }
      )
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
        .catch((err) => Prompt({ type: "error", message: err.message }));
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
        his,
        setHis,
        logout,
        irTypes,
        setIrTypes,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const IrDashboardContext = createContext();
export const IrDashboardContextProvider = ({ children }) => {
  const parametersFetched = useRef(false);

  const { user, setIrTypes } = useContext(SiteContext);
  const [parameters, setParameters] = useState({});
  const [dashboard, setDashboard] = useState("myDashboard");
  const [count, setCount] = useState({});
  const [tatConfig, setTatConfig] = useState(null);
  const [dataElements, setDataElements] = useState([]);
  const [irConfig, setIrConfig] = useState({});
  const [hodApprovalConfig, setHodApprovalConfig] = useState(false);

  // Config
  const [irInvestigationDetails, setIrInvestigationDetails] = useState([]);
  const [irScreenDetails, setIrScreenDetails] = useState([]);

  const { get: getIrInvestigationDetails } = useFetch(
    defaultEndpoints.irInvestigationDetails
  );
  const { get: getIrScreenDetails } = useFetch(defaultEndpoints.configirscreen);

  const { get: getUsers } = useFetch(`${defaultEndpoints.users}?size=10000`);
  const { get: getCountStatusDetailByState } = useFetch(
    `${defaultEndpoints.countStateDetailByStatus}?status=3`
  );
  const { get: getLocations } = useFetch(defaultEndpoints.locations);
  const { get: getCategories } = useFetch(defaultEndpoints.categories);

  const { get: getIrCountCurrentMonth } = useFetch(
    defaultEndpoints.countIrCurrentMonth
  );
  const { get: getSentinelIrCount } = useFetch(
    defaultEndpoints.countIrByType + `?typeofInci=8`
  );
  const { get: getPatientComplaintIrCount } = useFetch(
    defaultEndpoints.countIrByPatientComplaint + `?patientYesOrNo=yes`
  );
  const { get: getCurrentUserIrCount } = useFetch(
    defaultEndpoints.countIrByUserId + `?userId=${user?.id}`
  );
  const { get: getDepartmentsIrCount } = useFetch(
    defaultEndpoints.countIrByDepartment +
      "?" +
      new URLSearchParams({
        department: user?.department,
        status: "2,3,4,5,6,7,8",
      }).toString()
  );
  const { get: getTatIrCount } = useFetch(defaultEndpoints.countIrByTat);

  const { get: getTatConfig } = useFetch(defaultEndpoints.configTat);
  const updateTatConfig = useCallback(() => {
    getTatConfig().then(({ data }) => {
      if (data?._embedded?.configAcceptableTAT[0]) {
        const _tatConfig = data._embedded.configAcceptableTAT[0];
        setTatConfig({
          ..._tatConfig,
          excludeWeek: _tatConfig.excludeWeek.split(",").map((d) => +d),
          sentinelExcludeWeek: _tatConfig.sentinelExcludeWeek
            .split(",")
            .map((d) => +d),
        });
      }
    });
  });

  const { get: getIrTypes } = useFetch(defaultEndpoints.typesOfIncident);
  const updateIrTypes = useCallback(() => {
    getIrTypes().then(({ data }) => {
      if (data?._embedded?.configTypeOfIncident) {
        setIrTypes(
          data._embedded.configTypeOfIncident.map((type) => ({
            label: type.type_descrip,
            value: type.type,
          }))
        );
      }
    });
  });

  const { get: getDataElements } = useFetch(defaultEndpoints.dashboardElements);
  const updateDataElements = useCallback(() => {
    getDataElements().then(({ data }) => {
      if (data?._embedded?.dashboardElements) {
        setDataElements(data._embedded.dashboardElements);
      }
    });
  });
  const checkDataElements = useCallback(
    (element) => {
      const dataEl = dataElements.find(
        (dataEl) => dataEl.statusOption === element
      );
      if (!dataEl) return false;
      return (
        (dataEl.irMgr && user.role.includes("incidentManager")) ||
        (dataEl.irInvestigator && user.role.includes("irInvestigator"))
      );
    },
    [dataElements, user]
  );

  const { get: getHodApproval } = useFetch(defaultEndpoints.hodApproval);
  const updateHodApproval = useCallback(() => {
    getHodApproval().then(({ data }) => {
      if (data?._embedded?.configHodapproval?.length) {
        setIrConfig((prev) => ({
          ...prev,
          hodAcknowledgement: data._embedded.configHodapproval[0].options,
        }));
      }
    });
  }, []);

  const updateUsers = useCallback(async () => {
    const users = await getUsers().then(({ data }) =>
      (data?._embedded?.user || []).map((user) => ({
        ...user,
        role: user.role?.split(",").filter((r) => r) || [],
      }))
    );

    const counts = await getCountStatusDetailByState().then(({ data }) =>
      (data?._embedded?.IrStatusDetailsCount || []).map((detail) => ({
        userid: detail.userid,
        count: detail.count,
      }))
    );

    const _parameters = {};
    _parameters.users = users.map((user) => ({
      label: user.name,
      value: user.id,
    }));

    _parameters.investigators = users
      .filter((user) => user.role.includes("irInvestigator"))
      .map((user) => ({
        label: user.name,
        value: user.id,
        assignedIr:
          counts.find(({ userid, count } = {}) => user.id === userid)?.count ||
          0,
      }));

    setParameters((prev) => ({ ...prev, ..._parameters }));
  }, [parameters]);
  useEffect(async () => {
    if (user && !parametersFetched.current) {
      Promise.all([
        getLocations(),
        getCategories(),
        getIrInvestigationDetails(),
        getIrScreenDetails(),
      ])
        .then(
          async ([
            { data: location },
            { data: category },
            { data: irInvestigationDetails },
            { data: irScreens },
          ]) => {
            if (irInvestigationDetails?._embedded?.irInvestigationDetails) {
              setIrInvestigationDetails(
                irInvestigationDetails._embedded.irInvestigationDetails
              );
            }
            if (irScreens?._embedded?.configirscreen) {
              setIrScreenDetails(irScreens._embedded.configirscreen);
            }

            const _parameters = { ...parameters };
            if (location?._embedded.location) {
              _parameters.locations = location._embedded.location;
            }
            if (category?._embedded.category) {
              _parameters.categories = category._embedded.category;
            }
            setParameters(_parameters);
            updateUsers();
          }
        )
        .catch((err) => {
          Prompt({
            type: "error",
            message: err.message,
          });
        });
      updateTatConfig();
      updateIrTypes();
      updateDataElements();
      updateHodApproval();
      parametersFetched.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const countByStatus = await Promise.all([
        ...irStatus.map((status) =>
          fetch(
            dashboard === "myDashboard"
              ? `${
                  defaultEndpoints.countIrByStatusAndUserId
                }?${new URLSearchParams({
                  status: status.id,
                  ...(dashboard === "myDashboard" && {
                    userId: user.id,
                  }),
                  tenantId: sessionStorage.getItem("db-schema"),
                }).toString()}`
              : `${defaultEndpoints.countIrByStatus}?status=${
                  status.id
                }&tenantId=${sessionStorage.getItem("db-schema")}`,
            {
              headers: {
                Authorization:
                  "Bearer " + sessionStorage.getItem("access-token"),
              },
            }
          ).then((res) => res.json())
        ),
      ])
        .then((data) => {
          return irStatus.reduce((p, a, i) => {
            p[a.id] = data[i];
            return p;
          }, {});
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
      const otherCounts = await Promise.all([
        getIrCountCurrentMonth(),
        getSentinelIrCount(),
        getPatientComplaintIrCount(),
        getCurrentUserIrCount(),
        getDepartmentsIrCount(),
        getTatIrCount(null, { query: { days: tatConfig?.acceptableTAT || 5 } }),
      ])
        .then(
          ([
            { data: currentMonth },
            { data: sentinel },
            { data: patientComplaint },
            { data: myIr },
            { data: departmentIr },
            { data: irBeyondTat },
          ]) => ({
            currentMonth: currentMonth || 0,
            sentinel: sentinel || 0,
            patientComplaint: patientComplaint || 0,
            myIr: myIr || 0,
            departmentIr: departmentIr || 0,
            irBeyondTat: irBeyondTat || 0,
          })
        )
        .catch((err) => Prompt({ type: "error", message: err.message }));

      setCount((prev) => ({ ...countByStatus, ...otherCounts }));
    })();
  }, [dashboard, setCount, user, tatConfig]);

  return (
    <IrDashboardContext.Provider
      value={{
        count,
        setCount,
        parameters,
        setParameters,
        dashboard,
        setDashboard,
        updateUsers,
        updateTatConfig,
        updateIrTypes,
        updateDataElements,
        checkDataElements,
        tatConfig,
        dataElements,
        updateHodApproval,
        irConfig,

        irInvestigationDetails,
        setIrInvestigationDetails,
        irScreenDetails,
        setIrScreenDetails,
      }}
    >
      {children}
    </IrDashboardContext.Provider>
  );
};
