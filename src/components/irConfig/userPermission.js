import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { FaInfoCircle, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { Input, Checkbox, Table, TableActions, Toggle } from "../elements";
import { Modal, Prompt } from "../modal";
import { permissions } from "../../config";
import defaultEndpoints from "../../config/endpoints";
import s from "./config.module.scss";

const readOnly = [
  {
    role: "irAdmin",
    permissions: ["IR Master", "IR Configuration"],
  },
  {
    role: "incidentReporter",
    permissions: ["Incident Reporting", "IR Query Dashboard"],
  },
  {
    role: "irInvestigator",
    permissions: [
      "Access to view IRs in quality dashboardAssigned IR",
      "Update IR investigation for assigned IRs",
      "CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities",
      "Update CAPA tab for assigned IRs",
      "Update IR Closure report for Assigned IRs",
      "Add addendum",
      "Re-portable IR for Assigned IRs",
    ],
  },
  {
    role: "incidentManager",
    permissions: ["Access and update all IRs", "Assign IRs"],
  },
];

export default function UserPermission() {
  const permissionRef = useRef(null);
  const { user, setRoles } = useContext(SiteContext);
  const [userPermission, setUserPermission] = useState(null);
  const fetchUserPermissions = useCallback(() => {
    fetch(`${process.env.REACT_APP_HOST}/userPermission`)
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded.userPermission) {
          const _permissions = data._embedded.userPermission.map((item) => ({
            ...item,
            permission: item.permission.split(","),
          }));
          setUserPermission(_permissions);
          permissionRef.current = _permissions;
        }
      });
  }, []);
  useEffect(() => {
    fetchUserPermissions();
  }, []);
  return (
    <div className={s.container} data-testid="userPermission">
      <header>
        <h3>USER MANAGEMENT</h3>
      </header>
      <div className={s.userPermission}>
        {permissions.map(({ role, label, permissions }) => (
          <Box label={label.toUpperCase()} key={role} collapsable>
            <Table columns={[{ label: "Permissions" }]}>
              {Object.entries(permissions).map(([key, value]) => {
                const _permission = userPermission?.find(
                  (item) => item.role === role
                )?.permission;
                if (typeof value === "object") {
                  return (
                    <tr key={key}>
                      <td className={s.multipleOptions}>
                        <p className={s.permissionLabel}>{key}</p>
                        <div className={s.options}>
                          {Object.entries(value).map(
                            ([subKey, subValue], i) => {
                              const permission = key + subKey;
                              return (
                                <div key={i}>
                                  <label htmlFor={role + permission}>
                                    <input
                                      id={role + permission}
                                      type="checkbox"
                                      checked={
                                        _permission?.includes(permission) ||
                                        false
                                      }
                                      onChange={() => {
                                        if (
                                          readOnly
                                            .find((item) => item.role === role)
                                            ?.permissions?.includes(permission)
                                        ) {
                                          return;
                                        }
                                        setUserPermission((prev) =>
                                          prev.map((item) => {
                                            if (item.role !== role) return item;
                                            return {
                                              ...item,
                                              permission: _permission?.includes(
                                                permission
                                              )
                                                ? item.permission.filter(
                                                    (p) => p !== permission
                                                  )
                                                : [
                                                    ...item.permission,
                                                    permission,
                                                  ],
                                            };
                                          })
                                        );
                                      }}
                                    />{" "}
                                    {subKey}
                                  </label>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={key}>
                    <td>
                      <label htmlFor={role + key}>
                        <input
                          id={role + key}
                          type="checkbox"
                          checked={_permission?.includes(key) || false}
                          onChange={() => {
                            if (
                              readOnly
                                .find((item) => item.role === role)
                                ?.permissions?.includes(key)
                            ) {
                              return;
                            }
                            setUserPermission((prev) =>
                              prev.map((item) => {
                                if (item.role !== role) return item;
                                return {
                                  ...item,
                                  permission: _permission?.includes(key)
                                    ? item.permission.filter((p) => p !== key)
                                    : [...item.permission, key],
                                };
                              })
                            );
                          }}
                        />{" "}
                        {key}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Box>
        ))}
      </div>
      <div className={s.btns}>
        <button
          className="btn w-100"
          onClick={() => {
            const updatePending = userPermission.filter(
              (item) =>
                !permissionRef.current.find(
                  (p) => JSON.stringify(p) === JSON.stringify(item)
                )
            );
            if (updatePending.length > 0) {
              Promise.all(
                updatePending.map((item) =>
                  fetch(
                    `${
                      defaultEndpoints.userPermission_updateByRole
                    }?${new URLSearchParams({
                      role: item.role,
                      permission: item.permission.join(","),
                    }).toString()}`
                  ).then((res) => res.json())
                )
              )
                .then((resData) => {
                  const currentUserUpdate = updatePending.filter((item) =>
                    user.role.includes(item.role)
                  );
                  if (currentUserUpdate.length) {
                    setRoles((prev) => [
                      ...prev.filter((prevRole) =>
                        currentUserUpdate.some(
                          (newRole) => newRole.role !== prevRole.role
                        )
                      ),
                      ...currentUserUpdate,
                    ]);
                  }
                  fetchUserPermissions();
                  Prompt({
                    type: "information",
                    message: "Permission has been saved.",
                  });
                })
                .catch((err) => {
                  Prompt({
                    type: "error",
                    message: err.message,
                  });
                });
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
