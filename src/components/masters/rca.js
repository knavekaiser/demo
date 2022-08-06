import { useState, useEffect } from "react";
import { FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { Input, Table, TableActions, Toggle } from "../elements";
import { useForm } from "react-hook-form";
import { Prompt } from "../modal";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

export default function Rcas() {
  const [selected, setSelected] = useState(null);
  const [rcas, setRcas] = useState([]);
  const [edit, setEdit] = useState(null);

  const { get: getRca, loading } = useFetch(defaultEndpoints.rcas);
  const { remove: deleteRca } = useFetch(defaultEndpoints.rcas + "/{ID}");

  useEffect(() => {
    getRca()
      .then(({ data }) => {
        if (data._embedded?.rca) {
          setRcas(data._embedded.rca);
          setSelected(data._embedded.rca[0]?.id);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={s.container} data-testid="rca">
      <header>
        <h3>ROOT CAUSE MASTER</h3>
      </header>
      <div className={`${s.content} ${s.parent_child}`}>
        {
          //   <Box label="RCA">
          // </Box>
        }
        <div className={`${s.parent} ${s.rca}`}>
          {
            //   <div className={s.head}>
            //   <Input placeholder="Quick Search" icon={<BiSearch />} />
            // </div>
          }
          <Table
            loading={loading}
            columns={[
              { label: "Root Cause" },
              { label: "Show" },
              { label: "Action" },
            ]}
          >
            <tr>
              <td className={s.inlineForm}>
                <RcaForm
                  {...(edit && { edit })}
                  key={edit ? "edit" : "add"}
                  onSuccess={(newCat) => {
                    setRcas((prev) => {
                      return prev.find((c) => c.id === newCat.id)
                        ? prev.map((c) => (c.id === newCat.id ? newCat : c))
                        : [...prev, newCat];
                    });
                    setEdit(null);
                  }}
                  clearForm={() => {
                    setEdit(null);
                  }}
                  rcas={rcas}
                />
              </td>
            </tr>
            {rcas.map((rca, i) => (
              <tr key={i} className={rca.id === selected ? s.selected : ""}>
                <td>
                  <span
                    className={s.rcaName}
                    onClick={() => setSelected(rca.id)}
                  >
                    {rca.name}
                  </span>
                </td>
                <td>
                  <Toggle readOnly={true} defaultValue={rca.show} />
                </td>
                <TableActions
                  actions={[
                    {
                      icon: <BsPencilFill />,
                      label: "Edit",
                      callBack: () => setEdit(rca),
                    },
                    {
                      icon: <FaRegTrashAlt />,
                      label: "Delete",
                      callBack: () =>
                        Prompt({
                          type: "confirmation",
                          message: `Are you sure you want to remove ${rca.name}?`,
                          callback: () => {
                            deleteRca(null, {
                              params: { "{ID}": rca.id },
                            }).then(({ res }) => {
                              if (res.status === 204) {
                                setRcas((prev) =>
                                  prev.filter((c) => c.id !== rca.id)
                                );
                              } else if (res.status === 409) {
                                Prompt({
                                  type: "error",
                                  message:
                                    "Remove children to delete this master.",
                                });
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
        {rcas.find((cat) => cat.id === selected) && (
          <RcaCauses
            rca={rcas.find((cat) => cat.id === selected)}
            setRcas={setRcas}
          />
        )}
      </div>
    </div>
  );
}
const RcaForm = ({ edit, onSuccess, clearForm, rcas }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ ...edit });

  const { post: postRca, put: updateRca, loading } = useFetch(
    defaultEndpoints.rcas + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ show: true, ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          rcas?.some(
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
        (edit ? updateRca : postRca)(data)
          .then(({ data }) => {
            if (data.name) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        {...register("name", {
          required: "Please enter a Name",
        })}
        error={errors.name}
      />
      <Toggle
        name="show"
        register={register}
        required={true}
        watch={watch}
        setValue={setValue}
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

const RcaCauses = ({ rca: { id, name, rcaCauses }, setRcas }) => {
  const [edit, setEdit] = useState(null);
  const { remove: deleteRcaCause } = useFetch(
    defaultEndpoints.rcaCauses + "/{ID}"
  );
  return (
    <div className={`${s.child} ${s.rcaDetail}`} data-testid="rcaDetail">
      <div className={s.head}>
        <span className={s.rcaName}>
          Root Cause: <strong>{name}</strong>
        </span>
      </div>
      <Table columns={[{ label: "Causes" }, { label: "Action" }]}>
        <tr>
          <td className={s.inlineForm}>
            <RcaCauseForm
              {...(edit && { edit })}
              key={edit ? "edit" : "add"}
              rcaId={id}
              onSuccess={(rcaCause) => {
                if (edit) {
                  setRcas((prev) =>
                    prev.map((cat) => {
                      const newRcaCauses = cat.rcaCauses?.find(
                        (sc) => sc.id === rcaCause.id
                      )
                        ? cat.rcaCauses?.map((sc) =>
                            sc.id === rcaCause.id ? rcaCause : sc
                          )
                        : [...(cat.rcaCauses || []), rcaCause];
                      return cat.id === id
                        ? {
                            ...cat,
                            rcaCauses: newRcaCauses,
                          }
                        : cat;
                    })
                  );
                } else {
                  setRcas((prev) =>
                    prev.map((cat) =>
                      cat.id === id
                        ? {
                            ...cat,
                            rcaCauses: [...(cat.rcaCauses || []), rcaCause],
                          }
                        : cat
                    )
                  );
                }
                setEdit(null);
              }}
              clearForm={() => {
                setEdit(null);
              }}
              rcaCauses={rcaCauses}
            />
          </td>
        </tr>
        {(rcaCauses || []).map((rca, i) => (
          <tr key={i}>
            <td>{rca.name}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => setEdit(rca),
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove ${rca.name}?`,
                      callback: () => {
                        deleteRcaCause(null, {
                          params: { "{ID}": rca.id },
                        }).then(({ res }) => {
                          if (res.status === 204) {
                            setRcas((prev) =>
                              prev.map((cat) =>
                                cat.id === id
                                  ? {
                                      ...cat,
                                      rcaCauses: cat.rcaCauses.filter(
                                        (c) => c.id !== rca.id
                                      ),
                                    }
                                  : cat
                              )
                            );
                          } else if (res.status === 409) {
                            Prompt({
                              type: "error",
                              message: "Remove children to delete this master.",
                            });
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
  );
};
const RcaCauseForm = ({ edit, rcaId, onSuccess, clearForm, rcaCauses }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ ...edit });

  const { post: postRcaCause, put: updateRcaCause, loading } = useFetch(
    defaultEndpoints.rcaCauses + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          rcaCauses?.some(
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
        (edit ? updateRcaCause : postRcaCause)({ ...data, rca: { id: rcaId } })
          .then(({ data }) => {
            if (data.name) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        {...register("name", {
          required: "Please enter a Cause",
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
              reset();
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
