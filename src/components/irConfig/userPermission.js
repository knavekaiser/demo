import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { SiteContext, IrDashboardContext } from "../../SiteContext";
import { FaInfoCircle, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { Input, Checkbox, Table, TableActions, Toggle } from "../elements";
import { Modal, Prompt } from "../modal";
import { permissions } from "../../config";
import { useFetch } from "../../hooks";
import defaultEndpoints from "../../config/endpoints";
import s from "./config.module.scss";

export default function UserPermission() {
  const permissionRef = useRef(null);
  const { user, setRoles, setPermissions } = useContext(SiteContext);
  const { irConfig } = useContext(IrDashboardContext);
  const [userPermission, setUserPermission] = useState(null);
  const [updates, setUpdates] = useState([]);

  const { get: getRolePermission } = useFetch(defaultEndpoints.rolePermissions);
  const { put: updateRolePermission, loading } = useFetch(
    defaultEndpoints.rolePermissions + "/{ID}"
  );

  const fetchUserPermissions = useCallback(() => {
    getRolePermission()
      .then()
      .then(({ data }) => {
        if (data?._embedded.rolePermission) {
          const permissions = data._embedded.rolePermission.reduce((p, c) => {
            let role = p.find((role) => role.id === c.role.id);
            if (role) {
              if (c.permission) {
                role.permissions.push({
                  id: c.id,
                  permission: c.permission.permission,
                  permId: c.permission.id,
                  enable: c.enable,
                });
              }
            } else {
              role = {
                id: c.role.id,
                role: c.role.role,
                permissions: c.permission
                  ? [
                      {
                        id: c.id,
                        permission: c.permission.permission,
                        permId: c.permission.id,
                        enable: c.enable,
                      },
                    ]
                  : [],
              };
            }

            return [...p.filter((role) => role.id !== c.role.id), role];
          }, []);

          setUserPermission(permissions);
          setPermissions(
            permissions.filter((role) => user.role.includes(role.id))
          );
          setUpdates([]);
          permissionRef.current = permissions.reduce(
            (p, c) => [...p, ...c.permissions],
            []
          );
        }
      });
  }, []);
  const handleInputChange = useCallback(
    ({ roleId, permissionId, readOnly }) => {
      if (readOnly) return;
      setUserPermission((prev) =>
        prev.map((item) => {
          if (item.id !== roleId) return item;
          return {
            ...item,
            permissions: item.permissions.map((perm) => {
              if (perm.id !== permissionId) return perm;

              const ref = permissionRef.current.find(
                (item) => item.id === permissionId
              );

              setUpdates((prev) => [
                ...prev.filter((item) => item.id !== permissionId),
                ...(ref.enable !== !perm.enable
                  ? [
                      {
                        id: permissionId,
                        role: {
                          id: roleId,
                        },
                        permission: {
                          id: ref.permId,
                        },
                        enable: !perm.enable,
                      },
                    ]
                  : []),
              ]);

              return {
                ...perm,
                enable: !perm.enable,
              };
            }),
          };
        })
      );
    },
    []
  );

  useEffect(() => {
    fetchUserPermissions();
  }, []);
  return (
    <div className={s.container} data-testid="userPermission">
      <header>
        <h3>USER MANAGEMENT</h3>
      </header>
      <div className={s.userPermission}>
        {permissions
          .filter((item) => {
            if (item.role === "hod") {
              return irConfig.hodAcknowledgement;
            } else {
              return item;
            }
          })
          .map(({ id: roleId, role, label, permissions }) => (
            <Box label={label.toUpperCase()} key={role} collapsable>
              <Table columns={[{ label: "Permissions" }]}>
                {permissions.map(
                  ({
                    id: permissionId,
                    permission,
                    label,
                    permissions,
                    enable,
                    readOnly,
                  }) => {
                    const _permissions = userPermission?.find(
                      (item) => item.id === roleId
                    )?.permissions;
                    if (label) {
                      return (
                        <tr key={label}>
                          <td className={s.multipleOptions}>
                            <p className={s.permissionLabel}>{label}</p>
                            <div className={s.options}>
                              {permissions.map(
                                ({
                                  id: permissionId,
                                  permission,
                                  enable,
                                  readOnly,
                                }) => {
                                  return (
                                    <div key={permission}>
                                      <label htmlFor={roleId + permissionId}>
                                        <input
                                          id={roleId + permissionId}
                                          type="checkbox"
                                          checked={
                                            _permissions?.find(
                                              (item) => item.id === permissionId
                                            )?.enable || false
                                          }
                                          onChange={() =>
                                            handleInputChange({
                                              roleId,
                                              permissionId,
                                              readOnly,
                                            })
                                          }
                                        />{" "}
                                        {permission}
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
                      <tr key={permission}>
                        <td>
                          <label htmlFor={roleId + permissionId}>
                            <input
                              id={roleId + permissionId}
                              type="checkbox"
                              checked={
                                _permissions?.find(
                                  (item) => item.id === permissionId
                                )?.enable || false
                              }
                              onChange={() =>
                                handleInputChange({
                                  roleId,
                                  permissionId,
                                  readOnly,
                                })
                              }
                            />{" "}
                            {permission}
                          </label>
                        </td>
                      </tr>
                    );
                  }
                )}
              </Table>
            </Box>
          ))}
      </div>
      <div className={s.btns}>
        <button
          className="btn wd-100"
          disabled={loading || updates.length === 0}
          onClick={() => {
            Promise.all(
              updates.map((item) =>
                updateRolePermission(
                  { ...item },
                  { params: { "{ID}": item.id } }
                )
              )
            )
              .then((resData) => {
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
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
