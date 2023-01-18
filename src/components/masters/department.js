import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { Input, Table, TableActions } from "../elements";
import { Prompt } from "../modal";
import { useForm } from "react-hook-form";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newCat) => {
    setDepartments((prev) => {
      return prev.find((c) => c.id === newCat.id)
        ? prev.map((c) => (c.id === newCat.id ? newCat : c))
        : [...prev, newCat];
    });
    setEdit(null);
  }, []);

  const { get: getDepartments, loading } = useFetch(
    defaultEndpoints.departments
  );
  const { remove: deleteDepartment } = useFetch(
    defaultEndpoints.departments + "/{ID}"
  );

  useEffect(() => {
    getDepartments()
      .then(({ data }) => {
        if (data._embedded?.department) {
          setDepartments(data._embedded.department);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={s.container} data-testid="departments">
      <header>
        <h3>DEPARTMENT MASTER</h3>
      </header>
      <div className={s.departments}>
        <Table
          loading={loading}
          columns={[{ label: "Department Name" }, { label: "Action" }]}
        >
          <tr>
            <td className={s.inlineForm}>
              <DepartmentForm
                {...(edit && { edit })}
                key={edit ? "edit" : "add"}
                onSuccess={onSuccess}
                clearForm={setEdit}
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

  const {
    post: postDepartment,
    put: updateDepartment,
    loading,
  } = useFetch(defaultEndpoints.departments + `/${edit?.id || ""}`);

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
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
        (edit ? updateDepartment : postDepartment)(data)
          .then(({ data }) => {
            if (data.name) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => {
            Prompt({ type: "error", message: err.message });
          });
      })}
    >
      <Input
        {...register("name", {
          // required: "Please enter a Name",
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
            onClick={() => clearForm(null)}
            className="btn secondary"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};
