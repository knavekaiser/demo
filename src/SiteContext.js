import React, { createContext, useState, useEffect, useCallback } from "react";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const checkPermission = useCallback(
    ({ roleId, permission }) => {
      return true;
      return (
        ((user.role === roleId || roleId.includes?.(user.role)) &&
          role?.permission?.includes(permission)) ||
        false
      );
    },
    [role, user]
  );
  useEffect(() => {
    if (!role && user) {
      fetch(`${process.env.REACT_APP_HOST}/userPermission/${user.role}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setRole(data);
          }
        });
    }
  }, [user]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        checkPermission,
        role,
        setRole,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
