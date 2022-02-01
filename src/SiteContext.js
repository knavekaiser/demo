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
      const role = roles?.find((role) => user.role.includes(role.id));
      return (roleMatch && role?.permission?.includes(permission)) || false;
    },
    [roles, user]
  );
  useEffect(() => {
    if (!roles && user) {
      Promise.all(
        user.role.map((role) =>
          fetch(
            `${process.env.REACT_APP_HOST}/userPermission/${role}`
          ).then((res) => res.json())
        )
      ).then((data) => {
        setRoles(data);
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
