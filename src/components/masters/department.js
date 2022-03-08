import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import {
  Form,
  Input,
  Combobox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { Modal, Prompt } from "../modal";
import { useForm } from "react-hook-form";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

export default function Department() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [edit, setEdit] = useState(null);

  const { get: getDepartments } = useFetch(defaultEndpoints.departments);
  const { remove: deleteDepartment } = useFetch(
    defaultEndpoints.departments + "/{ID}"
  );

  useEffect(() => {
    setLoading(true);
    getDepartments()
      .then((data) => {
        setLoading(false);
        if (data._embedded?.department) {
          setDepartments(data._embedded.department);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);
  return (
    <div className={s.container} data-testid="departments">
      <header>
        <h3>DEPARTMENT MASTER</h3>
      </header>
      <div className={s.departments}>
        <Table
          loading={loading}
          columns={[
            // { label: "Code" },
            { label: "Department Name" },
            // { label: "Location Type" },
            // { label: "Status" },
            { label: "Action" },
          ]}
        >
          <tr>
            <td className={s.inlineForm}>
              <DepartmentForm
                {...(edit && { edit })}
                key={edit ? "edit" : "add"}
                onSuccess={(newCat) => {
                  setDepartments((prev) => {
                    return prev.find((c) => c.id === newCat.id)
                      ? prev.map((c) => (c.id === newCat.id ? newCat : c))
                      : [...prev, newCat];
                  });
                  setEdit(null);
                }}
                clearForm={() => {
                  setEdit(null);
                }}
                departments={departments}
              />
            </td>
          </tr>
          {departments.map((department, i) => (
            <tr key={i}>
              <td>{department.name}</td>
              <TableActions
                actions={[
                  {
                    icon: <BsPencilFill />,
                    label: "Edit",
                    callBack: () => setEdit(department),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove ${department.name}?`,
                        callback: () => {
                          deleteDepartment(null, {
                            params: { "{ID}": department.id },
                          }).then(({ res }) => {
                            if (res.status === 204) {
                              setDepartments((prev) =>
                                prev.filter((c) => c.id !== department.id)
                              );
                            }
                          });
                        },
                      }),
                  },
                ]}
              />
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
const DepartmentForm = ({ edit, onSuccess, clearForm, departments }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ ...edit });
  const [loading, setLoading] = useState(false);

  const {
    post: postDepartment,
    put: updateDepartment,
  } = useFetch(defaultEndpoints.departments + `/${edit?.id || ""}`, {
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        const url = `${process.env.REACT_APP_HOST}/department${
          edit ? `/${edit.id}` : ""
        }`;
        if (
          departments?.some(
            (item) =>
              item.name.trim().toLowerCase() ===
                data.name.trim().toLowerCase() && item.id !== data.id
          )
        ) {
          Prompt({
            type: "information",
            message: `${data.name} already exists.`,
          });
          return;
        }
        setLoading(true);
        (edit ? updateDepartment : postDepartment)(data)
          .then((data) => {
            setLoading(false);
            if (data.name) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => {
            setLoading(false);
            Prompt({ type: "error", message: err.message });
          });
      })}
    >
      <Input
        {...register("name", {
          required: "Please enter a Name",
        })}
        error={errors.name}
      />
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? (
            <FaCheck />
          ) : (
            <>
              <FaPlus /> Add
            </>
          )}
        </button>
        {edit && (
          <button
            type="button"
            onClick={() => {
              clearForm();
            }}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};
