import React, { createContext, useState, useEffect, useCallback } from "react";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState(null);
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
      const role = roles?.filter((role) => {
        return roleId === role.role || roleId.includes?.(role.role);
      })[0];
      return (roleMatch && role?.permission?.includes(permission)) || false;
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
              data._embedded.userPermission.filter((p) =>
                user.role.includes(p.role)
              )
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
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const IrDashboardContext = createContext();
export const IrDashboardContextProvider = ({ children }) => {
  const [parameters, setParameters] = useState();
  const [count, setCount] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/location`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/category`).then((res) => res.json()),
      fetch(`${process.env.REACT_APP_HOST}/user`).then((res) => res.json()),
    ]).then(([location, category, user]) => {
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
          .filter((user) => user.role.includes("hod"))
          .map((user) => ({
            label: user.name,
            value: user.id,
          }));
      }
      setParameters(_parameters);
    });
  }, []);
  return (
    <IrDashboardContext.Provider
      value={{
        parameters,
        setParameters,
      }}
    >
      {children}
    </IrDashboardContext.Provider>
  );
};
