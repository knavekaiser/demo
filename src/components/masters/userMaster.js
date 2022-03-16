import { useState, useEffect, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { FaPlus, FaCheck, FaRegTrashAlt, FaSearch } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import {
  Input,
  SearchField,
  MobileNumberInput,
  Combobox,
  Table,
  TableActions,
  Moment,
  moment,
} from "../elements";
import { useForm } from "react-hook-form";
import { Prompt } from "../modal";
import { permissions } from "../../config";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

export default function UserMaster() {
  const { endpoints } = useContext(SiteContext);
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState({
    genders: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
    role: permissions.map((p) => ({ value: p.role, label: p.label })),
  });
  const [users, setUsers] = useState([]);
  const [hisUsers, setHisUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const { get: getAllDepartments } = useFetch(
    endpoints?.departments?.url || defaultEndpoints.departments,
    { his: endpoints?.departments?.url }
  );
  const { get: getHisUsers } = useFetch(
    endpoints?.users?.url || defaultEndpoints.users + `?size=10000`,
    { his: endpoints?.users?.url }
  );
  const { get: getUsers } = useFetch(defaultEndpoints.users, {
    headers: { "Content-Type": "application/json", tenantId: undefined },
  });
  const { post: postUser } = useFetch(defaultEndpoints.users, {
    headers: { "Content-Type": "application/json", tenantId: undefined },
  });
  const { remove: deleteUser } = useFetch(defaultEndpoints.users + "/{ID}", {
    headers: { "Content-Type": "application/json", tenantId: undefined },
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllDepartments(null, {
        ...(endpoints?.departments?.url && {
          query: {
            departmentName: "",
            departmentCode: "",
            facilityId: 2,
            status: 1,
          },
        }),
      }),
      getHisUsers(null, {
        query: {
          userName: "",
          status: 1,
        },
      }),
    ])
      .then(([departments, hisUsers]) => {
        const _parameters = {};
        if (Array.isArray(departments?.[endpoints?.departments.key1])) {
          _parameters.departments = departments[
            endpoints?.departments.key1
          ].map(({ departmentId, departmentName }) => ({
            value: departmentId,
            label: departmentName,
          }));
        } else if (Array.isArray(departments)) {
          _parameters.departments = departments.map(
            ({ code, description }) => ({
              value: code,
              label: description,
            })
          );
        } else if (departments?._embedded?.department) {
          _parameters.departments = departments._embedded.department.map(
            ({ id, name }) => ({
              value: id,
              label: name,
            })
          );
        }

        if (hisUsers?.[endpoints?.users?.key1]) {
          setHisUsers(hisUsers[endpoints?.users?.key1]);
        }

        setParameters((prev) => ({ ...prev, ..._parameters }));
        return getUsers(null, { query: { size: 10000 } });
      })
      .then((data) => {
        setLoading(false);
        if (data._embedded?.user) {
          setUsers(
            data._embedded.user.map((user) => ({
              ...user,
              role: user.role?.split(",").filter((role) => role) || [],
            }))
          );
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);
  return (
    <div className={s.container} data-testid="users">
      <header>
        <h3>USER MASTER</h3>

        <button
          onClick={() => {
            const newUsers = hisUsers.filter(
              (hisUser) => !users.some((user) => user.name === hisUser.userId)
            );
            if (newUsers.length > 0) {
              Prompt({
                type: "confirmation",
                message: `${newUsers.length} new User found. Do you want to continue?`,
                callback: () => {
                  Promise.all(
                    newUsers.map((user) =>
                      postUser({
                        name: user.userId,
                        username: user.userName,
                        gender: user.gender?.toLowerCase() || "",
                        employeeId: user.employeeID,
                        role: "incidentReporter",
                        department: +user.departmentMaster?.code || undefined,
                        password: "123",
                      })
                    )
                  ).then((result) => {
                    setUsers((prev) => [...prev, ...result]);
                    Prompt({
                      type: "success",
                      message: `${result.length} users added.`,
                    });
                  });
                },
              });
            } else {
              Prompt({ type: "information", message: "No new User found." });
            }
          }}
          className="btn secondary"
          style={{ marginTop: "1rem" }}
        >
          Add users from HIS
        </button>
      </header>
      <div className={s.users}>
        <Table
          columns={[
            { label: "Name" },
            { label: "Username" },
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
          loading={loading}
        >
          <tr>
            <td className={s.inlineForm}>
              <UserForm
                {...(edit && { edit })}
                setEdit={setEdit}
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
              <td>{user.username}</td>
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
                  (u) => u.value.toString() === user.department.toString()
                )?.label || user.department}
              </td>
              <td>
                {parameters.role?.find(
                  (r) =>
                    r.value ===
                    user.role.sort((a, b) =>
                      permissions.findIndex((item) => item.role === a) >
                      permissions.findIndex((item) => item.role === b)
                        ? 1
                        : -1
                    )[0]
                )?.label || user.role}

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
                    callBack: () =>
                      setEdit({
                        ...user,
                        department: user.department?.toString(),
                      }),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove ${user.name}?`,
                        callback: () => {
                          deleteUser(null, {
                            params: { "{ID}": user.id },
                          }).then(({ res }) => {
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
const UserForm = ({
  edit,
  setEdit,
  onSuccess,
  clearForm,
  departments,
  users,
  role,
}) => {
  const { endpoints } = useContext(SiteContext);
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

  const { post: postUser, patch: updateUser } = useFetch(
    defaultEndpoints.users + `/${edit?.id || ""}`,
    {
      headers: { "Content-Type": "application/json", tenantId: undefined },
    }
  );

  useEffect(() => {
    reset({
      role: ["incidentReporter"],
      ...edit,
      ...(edit?.dob && {
        dob: moment({ time: edit.dob, format: "YYYY-MM-DD" }),
      }),
      password: "",
    });
  }, [edit]);
  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit((data) => {
        // if (
        //   users?.some(
        //     (item) =>
        //       ((data.email &&
        //         item.email?.trim().toLowerCase() ===
        //           data.email.trim().toLowerCase()) ||
        //         (data.contact &&
        //           item.contact?.trim().toLowerCase() ===
        //             data.contact.trim().toLowerCase()) ||
        //         (!edit &&
        //           item.employeeId?.trim().toLowerCase() ===
        //             data.employeeId.trim().toLowerCase())) &&
        //       item.id !== data.id
        //   )
        // ) {
        //   Prompt({
        //     type: "information",
        //     message: `User already exists. Please use different name, employeeId, contact email.`,
        //   });
        //   return;
        // }
        setLoading(true);
        (edit ? updateUser : postUser)({
          ...data,
          ...(edit &&
            !data.password && {
              password: undefined,
            }),
          role: data.role.join(","),
        })
          .then((data) => {
            setLoading(false);
            if (data.name) {
              onSuccess({
                ...data,
                role: data.role.split(",").filter((r) => r),
              });
              reset();
            }
          })
          .catch((err) => {
            setLoading(false);
            Prompt({ type: "error", message: err.message });
          });
      })}
    >
      <SearchField
        data={users.map((user) => ({
          label: user.name,
          value: user.id,
          data: user,
        }))}
        // url={defaultEndpoints.users + `?size=10000`}
        // processData={(data, value) => {
        //   if (data?._embedded?.user) {
        //     return data._embedded.user
        //       .filter((user) => new RegExp(value, "i").test(user.name))
        //       .map((user) => ({
        //         value: user.id,
        //         label: user.name,
        //         data: {
        //           ...user,
        //           role: user.role?.split(",") || [],
        //         },
        //       }));
        //   } else if (data.userViewList) {
        //     return data.userViewList
        //       .filter((user) => new RegExp(value, "i").test(user.userId))
        //       .map((user) => ({
        //         value: user.userId,
        //         label: user.userId,
        //         data: user,
        //       }));
        //   }
        //   return [];
        // }}
        register={register}
        name="name"
        formOptions={{
          required: "Please enter a Name",
        }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(user) => {
          if (typeof user === "string") {
            setValue("name", user);
          } else {
            setEdit(user);
          }
        }}
        error={errors.name}
      />
      <Input
        {...register("username", {
          required: "Please enter a Username",
        })}
        placeholder="Enter"
        error={errors.username}
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
          // ...(!addFromHis && { required: "Date of Birth" }),
        })}
        type="date"
        className={s.dobInput}
        error={errors.dob}
      />
      {
        //   <Input
        //   {...register("employeeId", {
        //     required: "Employee ID",
        //   })}
        //   error={errors.employeeId}
        //   placeholder="Enter"
        // />
      }
      <SearchField
        // url={defaultEndpoints.users + `?size=10000`}
        // processData={(data, value) => {
        //   if (data?._embedded?.user) {
        //     console.log(data._embedded?.user.length);
        //     return data._embedded.user
        //       .filter((user) => new RegExp(value, "i").test(user.employeeId))
        //       .map((user) => ({
        //         value: user.employeeId,
        //         label: user.employeeId,
        //         data: {
        //           ...user,
        //           role: user.role?.split(",") || [],
        //         },
        //       }));
        //   }
        //   return [];
        // }}
        data={users.map((user) => ({
          label: user.employeeId,
          value: user.employeeId,
          data: user,
        }))}
        register={register}
        name="employeeId"
        formOptions={{
          required: "Please enter a Employee ID",
        }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(user) => {
          if (typeof user === "string") {
            setValue("employeeId", user);
          } else {
            setEdit(user);
          }
        }}
        error={errors.employeeId}
      />
      {
        //   <MobileNumberInput
        //   name="contact"
        //   // required={!addFromHis}
        //   register={register}
        //   error={errors.contact}
        //   clearErrors={clearErrors}
        //   setValue={setValue}
        //   watch={watch}
        // />
      }
      <SearchField
        // url={defaultEndpoints.users + `?size=10000`}
        // processData={(data, value) => {
        //   if (data?._embedded?.user) {
        //     return data._embedded.user
        //       .filter((user) =>
        //         new RegExp(value.replace("+", ""), "i").test(user.contact)
        //       )
        //       .map((user) => ({
        //         value: user.contact,
        //         label: user.contact,
        //         data: {
        //           ...user,
        //           role: user.role?.split(",") || [],
        //         },
        //       }));
        //   }
        //   return [];
        // }}
        data={users.map((user) => ({
          label: user.contact,
          value: user.contact,
          data: user,
        }))}
        register={register}
        name="contact"
        formOptions={{
          required: "Phone Number",
        }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(user) => {
          if (typeof user === "string") {
            setValue("contact", user);
          } else {
            setEdit(user);
          }
        }}
        error={errors.contact}
        clearErrors={clearErrors}
        renderField={({
          name,
          register,
          error,
          setValue,
          clearErrors,
          watch,
          setShowResult,
        }) => {
          return (
            <MobileNumberInput
              // required={!addFromHis}
              onFocus={() => setShowResult(true)}
              name={name}
              register={register}
              error={error}
              clearErrors={clearErrors}
              setValue={setValue}
              watch={watch}
              icon={<FaSearch />}
            />
          );
        }}
      />
      {
        //   <Input
        //   {...register("email", {
        //     // ...(!addFromHis && {
        //     //   required: "Please enter an Email Address",
        //     //   pattern: {
        //     //     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        //     //     message: "invalid email address",
        //     //   },
        //     // }),
        //   })}
        //   error={errors.email}
        //   autoComplete="newUser"
        //   placeholder="Enter"
        // />
      }
      <SearchField
        // url={defaultEndpoints.users + `?size=10000`}
        // processData={(data, value) => {
        //   if (data?._embedded?.user) {
        //     return data._embedded.user
        //       .filter((user) => new RegExp(value, "i").test(user.email))
        //       .map((user) => ({
        //         value: user.email,
        //         label: user.email,
        //         data: {
        //           ...user,
        //           role: user.role?.split(",") || [],
        //         },
        //       }));
        //   }
        //   return [];
        // }}
        data={users.map((user) => ({
          label: user.email,
          value: user.email,
          data: user,
        }))}
        register={register}
        name="email"
        // formOptions={{
        //   required: "Please enter a Email",
        // }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(user) => {
          if (typeof user === "string") {
            setValue("email", user);
          } else {
            setEdit(user);
          }
        }}
        error={errors.email}
      />
      <Input
        {...register("password", {
          // ...(!addFromHis && { required: "Please enter a Password" }),
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
        formOptions={{ required: "Select Department" }}
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
        onChange={({ value }) => {
          if (
            value === "incidentManager" &&
            getValues("role").includes(value)
          ) {
            setValue(
              "role",
              role?.map((role) => role.value)
            );
          }
        }}
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
