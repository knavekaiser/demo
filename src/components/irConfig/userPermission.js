import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { FaInfoCircle, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { Input, Checkbox, Table, TableActions, Toggle } from "../elements";
import { Modal, Prompt } from "../modal";
import s from "./config.module.scss";

export default function UserPermission() {
  const permissionRef = useRef(null);
  const { checkPermission, user, role, setRole } = useContext(SiteContext);
  const [userPermission, setUserPermission] = useState(null);
  const [permissions, setPermissions] = useState([
    {
      id: 8,
      role: "IR ADMIN",
      permissions: {
        "IR Master": false,
        "IR Configuration": false,
      },
    },
    {
      id: 9,
      role: "INCIDNET REPORTER",
      permissions: {
        "Incident Reporting": false,
        "View access to reported incident by self": false,
        "View Access to Root cause analysis tab": false,
        "View Access to CAPA tab": false,
        "View Access to IR closure tab": false,
        "Incident closure dashboard": false,
        "CAPA dashboard - access and update CAPA's marked reponsible for": false,
        "Print Reported IR's": false,
      },
    },
    {
      id: 10,
      role: "IR INVESTIGATOR",
      permissions: {
        "Access to view IR's": false,
        "Merge IRs": false,
        "Cancel IR": false,
        "Update IR investigation for assigned IRs": false,
        "CAPA Dashboard - Update CAPA for assigned IRs": false,
        "CAPA Dashboard - access and update CAPA's marked responsible for": false,
        "Update IR Closure": false,
        "Recity IR information for assigned IR": false,
        "Update Reportable incident information": false,
        "Add addendum": false,
        "IR Analytics": false,
        "Custom Reports": false,
        Print: false,
      },
    },
    {
      id: 11,
      role: "INCIDENT MANAGER",
      permissions: {
        "Approve IRs": false,
        "Cancel IR": false,
        "Assign IRs": false,
        "Merge IRs": false,
        "CAPA dashboard - Access for CAPA's of all IRs": false,
        "IR Analytics": false,
        "Custom Reports": false,
        Print: false,
      },
    },
    {
      id: 12,
      role: "HEAD OF THE DEPARTMENT",
      permissions: {
        "Approve IR": false,
        "Acknowledge IR": false,
        "View Departments IR": false,
      },
    },
  ]);
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
    <div className={s.container}>
      <header>
        <h3>USER MANAGEMENT</h3>
      </header>
      <div className={s.userPermission}>
        {permissions.map(({ id, role, permissions }) => (
          <Box label={role} key={role}>
            <Table columns={[{ label: "Permission" }]}>
              {Object.entries(permissions).map(([key, value]) => {
                const _permission = userPermission?.find(
                  (item) => item.id === id
                )?.permission;
                return (
                  <tr key={key}>
                    <td>
                      <input
                        id={id + key}
                        type="checkbox"
                        checked={_permission?.includes(key) || false}
                        onChange={() => {
                          setUserPermission((prev) =>
                            prev.map((item) => {
                              if (item.id !== id) return item;
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
                      <label htmlFor={id + key}>{key}</label>
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
                    `${process.env.REACT_APP_HOST}/userPermission/${item.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        permission: item.permission.join(","),
                      }),
                    }
                  ).then((res) => res.json())
                )
              )
                .then((data) => {
                  const currentUserUpdate = data.find(
                    (item) => item.id === user.role
                  );
                  if (currentUserUpdate) {
                    setRole(currentUserUpdate);
                  }
                  fetchUserPermissions();
                  Prompt({
                    type: "information",
                    message: "Permission has been saved.",
                  });
                })
                .catch((err) => {
                  alert(err.message);
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
