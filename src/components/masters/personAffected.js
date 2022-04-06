import { useState, useEffect, useRef } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { IoIosClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Box } from "../incidentReport";
import {
  Form,
  Input,
  Checkbox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "../modal";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

export default function PersonAffected() {
  const immutable = useRef([
    "patient",
    "staff",
    "visitor",
    "contractor",
    "others",
  ]);
  const [selected, setSelected] = useState(null);
  const [personAffecteds, setPersonAffecteds] = useState([]);
  const [filter, setFilter] = useState(null);
  const [edit, setEdit] = useState(null);

  const { get: getPersonAffecteds, loading } = useFetch(
    defaultEndpoints.personAffecteds
  );
  const { remove: deletePersonAffected } = useFetch(
    defaultEndpoints.personAffecteds + "/{ID}"
  );

  useEffect(() => {
    getPersonAffecteds()
      .then((data) => {
        if (data._embedded?.personAffected) {
          setPersonAffecteds(data._embedded.personAffected);
          setSelected(data._embedded.personAffected[0]?.pa_id);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={s.container} data-testid="personAffected">
      <header>
        <h3>PERSON AFFECTED</h3>
      </header>
      <div className={`${s.content} ${s.parent_child}`}>
        <div className={`${s.personAffected} ${s.parent}`}>
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
              { label: "Person Affected" },
              // { label: "Show" },
              { label: "Action" },
            ]}
          >
            <tr>
              <td className={s.inlineForm}>
                <PersonAffectedForm
                  {...(edit && { edit })}
                  key={edit ? "edit" : "add"}
                  onSuccess={(newPerson) => {
                    setPersonAffecteds((prev) => {
                      return prev.find((p) => p.pa_id === newPerson.pa_id)
                        ? prev.map((p) =>
                            p.pa_id === newPerson.pa_id ? newPerson : p
                          )
                        : [...prev, newPerson];
                    });
                    setEdit(null);
                  }}
                  clearForm={() => {
                    setEdit(null);
                  }}
                  personAffecteds={personAffecteds}
                />
              </td>
            </tr>
            {personAffecteds
              .filter((p) =>
                !filter ? true : new RegExp(filter, "gi").test(p.name)
              )
              .map((personAffected, i) => (
                <tr
                  key={i}
                  className={
                    personAffected.pa_id === selected ? s.selected : ""
                  }
                >
                  <td>
                    <span
                      className={s.conName}
                      onClick={() => setSelected(personAffected.pa_id)}
                    >
                      {personAffected.name}
                    </span>
                  </td>
                  {
                    //   <td>
                    //   <Toggle readOnly={true} defaultValue={personAffected.show} />
                    // </td>
                  }
                  {immutable.current.includes(
                    personAffected.name.toLowerCase()
                  ) ? (
                    <td />
                  ) : (
                    <TableActions
                      actions={[
                        {
                          icon: <BsPencilFill />,
                          label: "Edit",
                          callBack: () => setEdit(personAffected),
                        },
                        {
                          icon: <FaRegTrashAlt />,
                          label: "Delete",
                          callBack: () =>
                            Prompt({
                              type: "confirmation",
                              message: `Are you sure you want to remove ${personAffected.name}?`,
                              callback: () => {
                                deletePersonAffected(null, {
                                  params: { "{ID}": personAffected.pa_id },
                                }).then(({ res }) => {
                                  if (res.status === 204) {
                                    setPersonAffecteds((prev) =>
                                      prev.filter(
                                        (p) => p.pa_id !== personAffected.pa_id
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
                  )}
                </tr>
              ))}
          </Table>
        </div>
        {personAffecteds.find((cat) => cat.pa_id === selected) && (
          <PersonAffectedDetail
            personAffected={personAffecteds.find(
              (cat) => cat.pa_id === selected
            )}
            setPersonAffecteds={setPersonAffecteds}
          />
        )}
      </div>
      <InjuryAnnotation />
    </div>
  );
}
const InjuryAnnotation = () => {
  const [templates, setTemplates] = useState([
    { name: "Legs" },
    { name: "Front and back" },
  ]);
  return (
    <div className={s.annotationTemplate}>
      <h4>Select Injury Annotation Template</h4>
      <div className={s.form}>
        <Input placeholder="Search" icon={<BiSearch />} />
        {templates.map((temp) => (
          <span key={temp.name} className={s.chip}>
            {temp.name}{" "}
            <button className="clear">
              <IoIosClose />
            </button>
          </span>
        ))}
      </div>
      <button className={`btn wd-100 ${s.save}`}>Save</button>
    </div>
  );
};
const PersonAffectedForm = ({
  edit,
  onSuccess,
  clearForm,
  personAffecteds,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({ ...edit });

  const {
    post: postPersonAffected,
    put: updatePersonAffected,
    loading,
  } = useFetch(defaultEndpoints.personAffecteds + `/${edit?.id || ""}`, {
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    reset({ show: true, ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        const url = `${process.env.REACT_APP_HOST}/personAffected${
          edit ? `/${edit.pa_id}` : ""
        }`;
        if (
          personAffecteds?.some(
            (item) =>
              item.name.trim().toLowerCase() ===
                data.name.trim().toLowerCase() && item.pa_id !== data.pa_id
          )
        ) {
          Prompt({
            type: "information",
            message: `${data.name} already exists.`,
          });
          return;
        }
        (edit ? updatePersonAffected : postPersonAffected)(data)
          .then((data) => {
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
      {
        // <Toggle name="show" register={register} required={true} watch={watch} />
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

const PersonAffectedDetail = ({
  personAffected: { pa_id, name, personAffectedDetails },
  setPersonAffecteds,
}) => {
  const [edit, setEdit] = useState(null);
  return (
    <div
      className={`${s.child} ${s.personAffectedDetails}`}
      data-testid="personAffectedDetail"
    >
      <div className={s.head}>
        <span className={s.personAffectedName}>
          Person Affected: <strong>{name}</strong>
        </span>
      </div>
      <Table columns={[{ label: "Details" }, { label: "Action" }]}>
        <tr>
          <td className={s.inlineForm}>
            <PersonAffectedDetailForm
              {...(edit && { edit })}
              key={edit ? "edit" : "add"}
              personAffectedId={pa_id}
              onSuccess={(personAffectedDetail) => {
                if (edit) {
                  setPersonAffecteds((prev) =>
                    prev.map((pa) => {
                      if (pa.pa_id !== pa_id) return pa;
                      const newDetails = pa.personAffectedDetails?.find(
                        (pad) => pad.id === personAffectedDetail.id
                      )
                        ? pa.personAffectedDetails?.map((pad) =>
                            pad.id === personAffectedDetail.id
                              ? personAffectedDetail
                              : pad
                          )
                        : [
                            ...(pa.personAffectedDetails || []),
                            personAffectedDetail,
                          ];
                      return {
                        ...pa,
                        personAffectedDetails: newDetails,
                      };
                    })
                  );
                } else {
                  setPersonAffecteds((prev) =>
                    prev.map((pa) => {
                      if (pa.pa_id !== pa_id) return pa;
                      return {
                        ...pa,
                        personAffectedDetails: [
                          ...(pa.personAffectedDetails || []),
                          personAffectedDetail,
                        ],
                      };
                    })
                  );
                }
                setEdit(null);
              }}
              clearForm={() => {
                setEdit(null);
              }}
              personAffectedDetails={personAffectedDetails}
            />
          </td>
        </tr>
        {(personAffectedDetails || []).map((personAffected) => (
          <SinglePersonEffectedDetail
            key={personAffected.id}
            pa_id={pa_id}
            personAffected={personAffected}
            setPersonAffecteds={setPersonAffecteds}
            setEdit={setEdit}
          />
        ))}
      </Table>
    </div>
  );
};
const SinglePersonEffectedDetail = ({
  personAffected,
  setPersonAffecteds,
  pa_id,
  setEdit,
}) => {
  const immutable = useRef(["name", "age", "gender"]);

  const { put: updatePersonAffectedDetail, loading } = useFetch(
    defaultEndpoints.personAffectedDetails + "/{ID}",
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  const { remove: deletePersonAffectedDetail } = useFetch(
    defaultEndpoints.personAffectedDetails + "/{ID}"
  );

  return (
    <tr className={loading ? s.loading : ""}>
      <td style={{ display: "flex", alignItems: "center", gridGap: "6px" }}>
        <input
          type="checkbox"
          checked={personAffected.show}
          onChange={(e) => {
            updatePersonAffectedDetail(
              {
                ...personAffected,
                show: !personAffected.show,
                personAffected: { pa_id },
              },
              { params: { "{ID}": personAffected.id } }
            )
              .then((personAffectedDetail) => {
                setPersonAffecteds((prev) =>
                  prev.map((pa) => {
                    if (pa.pa_id !== pa_id) return pa;
                    const newDetails = pa.personAffectedDetails?.find(
                      (pad) => pad.id === personAffectedDetail.id
                    )
                      ? pa.personAffectedDetails?.map((pad) =>
                          pad.id === personAffectedDetail.id
                            ? personAffectedDetail
                            : pad
                        )
                      : [
                          ...(pa.personAffectedDetails || []),
                          personAffectedDetail,
                        ];
                    return {
                      ...pa,
                      personAffectedDetails: newDetails,
                    };
                  })
                );
              })
              .catch((err) => Prompt({ type: "error", message: err.message }));
          }}
        />{" "}
        {personAffected.name}
      </td>
      {immutable.current.includes(personAffected.name.toLowerCase()) ? (
        <td />
      ) : (
        <TableActions
          actions={[
            {
              icon: <BsPencilFill />,
              label: "Edit",
              callBack: () => setEdit(personAffected),
            },
            {
              icon: <FaRegTrashAlt />,
              label: "Delete",
              callBack: () =>
                Prompt({
                  type: "confirmation",
                  message: `Are you sure you want to remove ${personAffected.name}?`,
                  callback: () => {
                    deletePersonAffectedDetail(null, {
                      params: { "{ID}": personAffected.id },
                    }).then(({ res }) => {
                      if (res.status === 204) {
                        setPersonAffecteds((prev) =>
                          prev.map((pa) =>
                            pa.pa_id === pa_id
                              ? {
                                  ...pa,
                                  personAffectedDetails: pa.personAffectedDetails.filter(
                                    (pad) => pad.id !== personAffected.id
                                  ),
                                }
                              : pa
                          )
                        );
                      }
                    });
                  },
                }),
            },
          ]}
        />
      )}
    </tr>
  );
};
const PersonAffectedDetailForm = ({
  edit,
  personAffectedId,
  onSuccess,
  clearForm,
  personAffectedDetails,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ ...edit });

  const {
    post: postPersonAffectedDetail,
    put: updatePersonAffectedDetail,
    loading,
  } = useFetch(defaultEndpoints.personAffectedDetails + `/${edit?.id || ""}`, {
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          personAffectedDetails?.some(
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
        (edit ? updatePersonAffectedDetail : postPersonAffectedDetail)({
          ...data,
          personAffected: { pa_id: personAffectedId },
        })
          .then((data) => {
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
