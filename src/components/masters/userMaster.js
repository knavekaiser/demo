import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import {
  Input,
  MobileNumberInput,
  Combobox,
  Table,
  TableActions,
  Toggle,
  Moment,
  moment,
} from "../elements";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "../modal";
import s from "./masters.module.scss";

export default function UserMaster() {
  const [parameters, setParameters] = useState({
    genders: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
    role: [
      { value: 8, label: "IR Admin" },
      { value: 9, label: "Incident Reporter" },
      { value: 10, label: "IR Investigator" },
      { value: 11, label: "Incident Manager" },
      { value: 12, label: "Head of the Department" },
    ],
  });
  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/department`).then((res) =>
        res.json()
      ),
    ])
      .then(([departments]) => {
        const _parameters = {
          departments: departments._embedded.department.map(({ id, name }) => ({
            value: id,
            label: name,
          })),
        };
        setParameters((prev) => ({ ...prev, ..._parameters }));
        return fetch(`${process.env.REACT_APP_HOST}/user`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.user) {
          setUsers(
            data._embedded.user.map((user) => ({
              ...user,
              role: user.role
                .split(",")
                .filter((role) => role)
                .map((role) => +role),
            }))
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container} data-testid="users">
      <header>
        <h3>USER MASTER</h3>
      </header>
      <div className={s.users}>
        <Table
          columns={[
            { label: "Name" },
            { label: "Gender" },
            { label: "DOB" },
            { label: "Employee ID" },
            { label: "Contact" },
            { label: "Email" },
            { label: "Password" },
            { label: "Department" },
            { label: "Role" },
            { label: "Action" },
          ]}
          actions={true}
        >
          <tr>
            <td className={s.inlineForm}>
              <UserForm
                {...(edit && { edit })}
                key={edit ? "edit" : "add"}
                departments={parameters?.departments}
                onSuccess={(newUser) => {
                  setUsers((prev) => {
                    return prev.find((c) => c.id === newUser.id)
                      ? prev.map((c) => (c.id === newUser.id ? newUser : c))
                      : [...prev, newUser];
                  });
                  setEdit(null);
                }}
                clearForm={() => {
                  setEdit(null);
                }}
                users={users}
                role={parameters.role}
              />
            </td>
          </tr>
          {users.map((user, i) => (
            <tr key={i}>
              <td>{user.name}</td>
              <td>
                {parameters?.genders.find((u) => u.value === user.gender)
                  ?.label || user.gender}
              </td>
              <td>
                <Moment format="DD/MM/YYYY">{user.dob}</Moment>
              </td>
              <td>{user.employeeId}</td>
              <td>{user.contact}</td>
              <td>{user.email}</td>
              <td>•••••••</td>
              <td>
                {parameters.departments?.find(
                  (u) => u.value === user.department
                )?.label || user.department}
              </td>
              <td>
                {parameters.role?.find((r) => r.value === user.role[0])
                  ?.label || user.role}
                {Array.isArray(user.role) && user.role.length > 1 && (
                  <div className={s.moreRoles}>
                    +{user.role.length - 1}
                    <div className={s.allRoles}>
                      {user.role.map((u, i) =>
                        i === 0 ? null : (
                          <p key={u}>
                            {parameters.role?.find((r) => r.value === u)
                              ?.label || u}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </td>
              <TableActions
                actions={[
                  {
                    icon: <BsPencilFill />,
                    label: "Edit",
                    callBack: () => setEdit(user),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove ${user.name}?`,
                        callback: () => {
                          fetch(
                            `${process.env.REACT_APP_HOST}/user/${user.id}`,
                            {
                              method: "DELETE",
                            }
                          ).then((res) => {
                            if (res.status === 204) {
                              setUsers((prev) =>
                                prev.filter((c) => c.id !== user.id)
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
const UserForm = ({ edit, onSuccess, clearForm, departments, users, role }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
    clearErrors,
  } = useForm();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    reset({
      role: [9],
      ...edit,
      ...(edit?.dob && {
        dob: moment({ time: edit.dob, format: "YYYY-MM-DD" }),
      }),
    });
  }, [edit]);
  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit((data) => {
        const url = `${process.env.REACT_APP_HOST}/user${
          edit ? `/${edit.id}` : ""
        }`;
        if (
          users?.some(
            (item) =>
              (item.email.trim().toLowerCase() ===
                data.email.trim().toLowerCase() ||
                item.contact.trim().toLowerCase() ===
                  data.contact.trim().toLowerCase() ||
                item.employeeId.trim().toLowerCase() ===
                  data.employeeId.trim().toLowerCase()) &&
              item.id !== data.id
          )
        ) {
          Prompt({
            type: "information",
            message: `User already exists. Please use different name, employeeId, contact email.`,
          });
          return;
        }
        setLoading(true);
        fetch(url, {
          method: edit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, role: data.role.join(",") }),
        })
          .then((res) => res.json())
          .then((data) => {
            setLoading(false);
            if (data.name) {
              onSuccess({
                ...data,
                role: data.role
                  .split(",")
                  .filter((r) => r)
                  .map((r) => +r),
              });
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
        placeholder="Enter"
        error={errors.name}
      />
      <Combobox
        name="gender"
        register={register}
        setValue={setValue}
        watch={watch}
        formOptions={{
          required: "Gender",
        }}
        options={[
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ]}
        error={errors.gender}
        clearErrors={clearErrors}
      />
      <Input
        {...register("dob", {
          required: "Date of Birth",
        })}
        type="date"
        error={errors.dob}
      />
      <Input
        {...register("employeeId", {
          required: "Employee ID",
        })}
        error={errors.employeeId}
        placeholder="Enter"
        tabIndex={edit ? "0" : "1"}
      />
      <MobileNumberInput
        name="contact"
        required={true}
        register={register}
        error={errors.contact}
        clearErrors={clearErrors}
        setValue={setValue}
        watch={watch}
      />
      <Input
        {...register("email", {
          required: "Please enter an Email Address",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "invalid email address",
          },
        })}
        error={errors.email}
        autoComplete="newUser"
        placeholder="Enter"
        tabIndex={edit ? "0" : "1"}
      />
      <Input
        {...register("password", {
          required: "Please enter a Password",
        })}
        error={errors.password}
        autoComplete="new-password"
        type="password"
        name="password"
        placeholder="Enter"
      />
      <Combobox
        register={register}
        name="department"
        setValue={setValue}
        watch={watch}
        options={departments}
        formOptions={{
          required: "Select Department",
        }}
        error={errors.department}
        clearErrors={clearErrors}
      />
      <Combobox
        register={register}
        formOptions={{
          required: "Select Role",
        }}
        placeholder="Select"
        name="role"
        setValue={setValue}
        watch={watch}
        options={role}
        multiple={true}
        error={errors.role}
        clearErrors={clearErrors}
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
