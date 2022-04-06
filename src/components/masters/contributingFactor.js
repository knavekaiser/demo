import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { Box } from "../incidentReport";
import { Form, Input, Table, TableActions, Toggle } from "../elements";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "../modal";
import { useFetch } from "../../hooks";
import { endpoints as defaultEndpoints } from "../../config";
import s from "./masters.module.scss";

export default function ContributingFactor() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [contributingFactors, setContributingFactors] = useState([]);
  const [filter, setFilter] = useState(null);
  const [edit, setEdit] = useState(null);

  const { get: getContributingFactors } = useFetch(
    defaultEndpoints.contributingFactors
  );
  const { remove: deleteContributingFactor } = useFetch(
    defaultEndpoints.contributingFactors + "/{ID}"
  );

  useEffect(() => {
    setLoading(true);
    getContributingFactors()
      .then((data) => {
        setLoading(false);
        if (data._embedded?.contributingFactors) {
          setContributingFactors(data._embedded.contributingFactors);
          setSelected(data._embedded.contributingFactors[0]?.cf_id);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);
  return (
    <div className={s.container} data-testid="contributingFactor">
      <header>
        <h3>CONTRIBUTING FACTORS</h3>
      </header>
      <div className={`${s.content} ${s.parent_child}`}>
        {
          //   <Box label="CONTRIBUTING FACTORS">
          // </Box>
        }
        <div className={`${s.parent} ${s.contributingFactors}`}>
          <div className={s.head}>
            <Input
              placeholder="Quick Search"
              icon={<BiSearch />}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Table
            loading={loading}
            columns={[
              { label: "Contributing Factor" },
              // { label: "Show" },
              { label: "Action" },
            ]}
          >
            <tr>
              <td className={s.inlineForm}>
                <ContributingFactorForm
                  {...(edit && { edit })}
                  key={edit ? "edit" : "add"}
                  onSuccess={(newCon) => {
                    setContributingFactors((prev) => {
                      return prev.find((con) => con.cf_id === newCon.cf_id)
                        ? prev.map((con) =>
                            con.cf_id === newCon.cf_id ? newCon : con
                          )
                        : [...prev, newCon];
                    });
                    setEdit(null);
                  }}
                  clearForm={() => {
                    setEdit(null);
                  }}
                  contributingFactors={contributingFactors}
                />
              </td>
            </tr>
            {contributingFactors
              .filter((c) =>
                !filter ? true : new RegExp(filter, "gi").test(c.name)
              )
              .map((contributingFactor, i) => (
                <tr
                  key={i}
                  className={
                    contributingFactor.cf_id === selected ? s.selected : ""
                  }
                >
                  <td>
                    <span
                      className={s.conName}
                      onClick={() => setSelected(contributingFactor.cf_id)}
                    >
                      {contributingFactor.name}
                    </span>
                  </td>
                  {
                    //   <td>
                    //   <Toggle
                    //     readOnly={true}
                    //     defaultValue={contributingFactor.show}
                    //   />
                    // </td>
                  }
                  <TableActions
                    actions={[
                      {
                        icon: <BsPencilFill />,
                        label: "Edit",
                        callBack: () => setEdit(contributingFactor),
                      },
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove ${contributingFactor.name}?`,
                            callback: () => {
                              deleteContributingFactor(null, {
                                params: { "{ID}": contributingFactor.cf_id },
                              }).then(({ res }) => {
                                if (res.status === 204) {
                                  setContributingFactors((prev) =>
                                    prev.filter(
                                      (con) =>
                                        con.cf_id !== contributingFactor.cf_id
                                    )
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
        {contributingFactors.find((cat) => cat.cf_id === selected) && (
          <ContributingFactorDetail
            contributingFactor={contributingFactors.find(
              (cat) => cat.cf_id === selected
            )}
            setContributingFactors={setContributingFactors}
          />
        )}
      </div>
    </div>
  );
}
const ContributingFactorForm = ({
  edit,
  onSuccess,
  clearForm,
  contributingFactors,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({ ...edit });
  const [loading, setLoading] = useState(false);

  const {
    post: postContributingFactor,
    put: updateContributingFactor,
  } = useFetch(defaultEndpoints.contributingFactors + `/${edit?.cf_id || ""}`, {
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    reset({ show: true, ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          contributingFactors?.some(
            (item) =>
              item.name.trim().toLowerCase() ===
                data.name.trim().toLowerCase() && item.cf_id !== data.cf_id
          )
        ) {
          Prompt({
            type: "information",
            message: `${data.name} already exists.`,
          });
          return;
        }
        setLoading(true);
        (edit ? updateContributingFactor : postContributingFactor)(data)
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
      {
        // <Toggle name="show" watch={watch} register={register} required={true} />
      }
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

const ContributingFactorDetail = ({
  contributingFactor: { cf_id, name, contributingFactorDetails },
  setContributingFactors,
}) => {
  const [edit, setEdit] = useState(null);
  const { remove: deleteContributingFactorDetail } = useFetch(
    defaultEndpoints.contributingFactorDetails + "/{ID}"
  );
  return (
    <div className={s.child} data-testid="contributingFactorDetail">
      <div className={s.head}>
        <span className={s.contributingFactorName}>
          Contributing Factor: <strong>{name}</strong>
        </span>
      </div>
      <Table columns={[{ label: "Details" }, { label: "Action" }]}>
        <tr>
          <td className={s.inlineForm}>
            <ContributingFactorDetailForm
              {...(edit && { edit })}
              key={edit ? "edit" : "add"}
              contributingFactorId={cf_id}
              onSuccess={(newCfd) => {
                if (edit) {
                  setContributingFactors((prev) =>
                    prev.map((con) => {
                      if (con.cf_id !== cf_id) return con;
                      const newCfds = con.contributingFactorDetails?.find(
                        (cfd) => cfd.id === newCfd.id
                      )
                        ? con.contributingFactorDetails?.map((cfd) =>
                            cfd.id === newCfd.id ? newCfd : cfd
                          )
                        : [...(con.contributingFactorDetails || []), newCfd];
                      return {
                        ...con,
                        contributingFactorDetails: newCfds,
                      };
                    })
                  );
                } else {
                  setContributingFactors((prev) =>
                    prev.map((con) =>
                      con.cf_id === cf_id
                        ? {
                            ...con,
                            contributingFactorDetails: [
                              ...(con.contributingFactorDetails || []),
                              newCfd,
                            ],
                          }
                        : con
                    )
                  );
                }
                setEdit(null);
              }}
              clearForm={() => {
                setEdit(null);
              }}
              contributingFactorDetails={contributingFactorDetails}
            />
          </td>
        </tr>
        {(contributingFactorDetails || []).map((contributingFactor, i) => (
          <tr key={i}>
            <td>{contributingFactor.name}</td>
            <TableActions
              actions={[
                {
                  icon: <BsPencilFill />,
                  label: "Edit",
                  callBack: () => setEdit(contributingFactor),
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove ${contributingFactor.name}?`,
                      callback: () => {
                        deleteContributingFactorDetail(null, {
                          params: { "{ID}": contributingFactor.id },
                        }).then(({ res }) => {
                          if (res.status === 204) {
                            setContributingFactors((prev) =>
                              prev.map((con) => {
                                if (con.cf_id !== cf_id) return con;
                                return {
                                  ...con,
                                  contributingFactorDetails: con.contributingFactorDetails.filter(
                                    (c) => c.id !== contributingFactor.id
                                  ),
                                };
                              })
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
  );
};
const ContributingFactorDetailForm = ({
  edit,
  contributingFactorId,
  onSuccess,
  clearForm,
  contributingFactorDetails,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ ...edit });
  const [loading, setLoading] = useState(false);

  const {
    post: postContributingFactorDetail,
    put: updateContributingFactorDetail,
  } = useFetch(
    defaultEndpoints.contributingFactorDetails + `/${edit?.id || ""}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          contributingFactorDetails?.some(
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
        (edit ? updateContributingFactorDetail : postContributingFactorDetail)({
          ...data,
          contributingFactors: { cf_id: contributingFactorId },
        })
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
