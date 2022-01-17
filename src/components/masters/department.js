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
import s from "./masters.module.scss";

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/department`)
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.department) {
          setDepartments(data._embedded.department);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container}>
      <header>
        <h3>DEPARTMENT MASTER</h3>
      </header>
      <div className={s.departments}>
        <Table
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
                          fetch(
                            `${process.env.REACT_APP_HOST}/department/${department.id}`,
                            {
                              method: "DELETE",
                            }
                          ).then((res) => {
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
          !edit &&
          departments?.some(
            (item) =>
              item.name.trim().toLowerCase() === data.name.trim().toLowerCase()
          )
        ) {
          Prompt({
            type: "information",
            message: `${data.name} already exists.`,
          });
          return;
        }
        setLoading(true);
        fetch(url, {
          method: edit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
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
            console.log(err);
          });
      })}
    >
      <Input
        {...register("name", {
          required: "Please enter a Name",
        })}
        error={errors.name}
      />
      {
        //   <Input
        //   name="name"
        //   required={true}
        //   placeholder="Enter"
        //   icon={<BiSearch />}
        // />
        // <Combobox
        //   name="type"
        //   required={true}
        //   placeholder="Enter"
        //   multiple={true}
        //   options={[
        //     { value: 1, label: "Location type one" },
        //     { value: 2, label: "Location type two" },
        //     { value: 3, label: "Location type three" },
        //     { value: 4, label: "Location type four" },
        //   ]}
        // />
        // <Toggle name="status" />
      }
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? <FaCheck /> : <FaPlus />}
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
