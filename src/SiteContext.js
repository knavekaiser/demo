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
