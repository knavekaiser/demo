import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { Box } from "../incidentReport";
import {
  Textarea,
  Combobox,
  Input,
  Checkbox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "../modal";
import s from "./masters.module.scss";

export default function Categories() {
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState(null);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/category`)
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.category) {
          setCategories(data._embedded.category);
          setSelected(data._embedded.category[0]?.id);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container}>
      <header>
        <h3>CATEGORY & SUB CATEGORY MASTER</h3>
      </header>
      <div className={`${s.content} ${s.parent_child}`}>
        {
          //   <Box label="CATEGORY DETAILS">
          // </Box>
        }
        <div className={s.parent}>
          <div className={s.head}>
            <Input
              placeholder="Quick Search"
              icon={<BiSearch />}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Table columns={[{ label: "Category Name" }, { label: "Action" }]}>
            <tr>
              <td className={s.inlineForm}>
                <CategoryForm
                  {...(edit && { edit })}
                  key={edit ? "edit" : "add"}
                  onSuccess={(newCat) => {
                    setCategories((prev) => {
                      return prev.find((c) => c.id === newCat.id)
                        ? prev.map((c) => (c.id === newCat.id ? newCat : c))
                        : [...prev, newCat];
                    });
                    setEdit(null);
                  }}
                  clearForm={() => {
                    setEdit(null);
                  }}
                  categories={categories}
                />
              </td>
            </tr>
            {categories
              .filter((c) =>
                !filter ? true : new RegExp(filter, "gi").test(c.name)
              )
              .map((category, i) => (
                <tr
                  key={i}
                  className={category.id === selected ? s.selected : ""}
                >
                  <td>
                    <span
                      className={s.catName}
                      onClick={() => setSelected(category.id)}
                    >
                      {category.name}
                    </span>
                  </td>
                  <TableActions
                    actions={[
                      {
                        icon: <BsPencilFill />,
                        label: "Edit",
                        callBack: () => setEdit(category),
                      },
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove ${category.name}?`,
                            callback: () => {
                              fetch(
                                `${process.env.REACT_APP_HOST}/category/${category.id}`,
                                {
                                  method: "DELETE",
                                }
                              ).then((res) => {
                                if (res.status === 204) {
                                  setCategories((prev) =>
                                    prev.filter((c) => c.id !== category.id)
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
        {categories.find((cat) => cat.id === selected) && (
          <SubCategories
            category={categories.find((cat) => cat.id === selected)}
            setCategories={setCategories}
          />
        )}
      </div>
    </div>
  );
}
const CategoryForm = ({ edit, onSuccess, clearForm, categories }) => {
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
        const url = `${process.env.REACT_APP_HOST}/category${
          edit ? `/${edit.id}` : ""
        }`;
        if (
          !edit &&
          categories?.some(
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

const SubCategories = ({
  category: { id, name, subCategorys },
  setCategories,
}) => {
  const [edit, setEdit] = useState(null);
  const [addReporable, setAddReportable] = useState(false);
  // <Box label="SUB CATEGORY DETAILS">
  // </Box>
  return (
    <div className={`${s.subCategory} ${s.child}`}>
      <div className={s.head}>
        <span className={s.categoryName}>
          Category: <strong>{name}</strong>
        </span>
        {
          //   <Form defaultValues={{ name: name }}>
          //   <Input
          //     className={s.input}
          //     name="name"
          //     label="Category Name"
          //     readOnly={true}
          //   />
          // </Form>
        }
      </div>
      <Table
        columns={[
          { label: "Sub Category" },
          { label: "Template" },
          { label: "Sentinel" },
          { label: "Reportable" },
          { label: "Status" },
          { label: "Action" },
        ]}
      >
        <tr>
          <td className={s.inlineForm}>
            <SubCategoryForm
              {...(edit && { edit })}
              key={edit ? "edit" : "add"}
              categoryId={id}
              onSuccess={(subCategory) => {
                if (edit) {
                  setCategories((prev) =>
                    prev.map((cat) => {
                      const newSubCategories = cat.subCategorys?.find(
                        (sc) => sc.id === subCategory.id
                      )
                        ? cat.subCategorys?.map((sc) =>
                            sc.id === subCategory.id ? subCategory : sc
                          )
                        : [...(cat.subCategorys || []), subCategory];
                      return cat.id === id
                        ? {
                            ...cat,
                            subCategorys: newSubCategories,
                          }
                        : cat;
                    })
                  );
                } else {
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === id
                        ? {
                            ...cat,
                            subCategorys: [
                              ...(cat.subCategorys || []),
                              subCategory,
                            ],
                          }
                        : cat
                    )
                  );
                }
                // if (!edit && subCategory.reportable) {
                //   setAddReportable(subCategory);
                // }
                setEdit(null);
              }}
              clearForm={() => {
                setEdit(null);
              }}
              subCategorys={subCategorys}
            />
          </td>
        </tr>
        {(subCategorys || []).map((category, i) => (
          <SingleSubCategory
            id={id}
            key={category.id}
            subCategory={category}
            setCategories={setCategories}
            setEdit={setEdit}
          />
        ))}
      </Table>
      <Modal
        open={addReporable}
        head={true}
        setOpen={() => {
          setAddReportable(false);
        }}
        label="REPORTABLE EVENT"
        className={s.reportableForm}
      >
        <div className={s.content}>
          <ReportableForm
            setCategories={setCategories}
            categoryId={id}
            subCategoryId={addReporable?.id}
          />
        </div>
      </Modal>
    </div>
  );
};
const SingleSubCategory = ({ id, subCategory, setCategories, setEdit }) => {
  const [addReporable, setAddReportable] = useState(false);
  return (
    <tr>
      <td>{subCategory.name}</td>
      <td>{subCategory.template}</td>
      <td>{subCategory.sentinel ? "Sentinel" : ""}</td>
      <td>
        {subCategory.reportStatus && (
          <span
            className={s.reportableBtn}
            onClick={() => setAddReportable(subCategory)}
          >
            Reportable
          </span>
        )}
      </td>
      <td>
        <Toggle defaultValue={subCategory.status} readOnly={true} />
      </td>
      <TableActions
        actions={[
          {
            icon: <BsPencilFill />,
            label: "Edit",
            callBack: () => setEdit(subCategory),
          },
          {
            icon: <FaRegTrashAlt />,
            label: "Delete",
            callBack: () =>
              Prompt({
                type: "confirmation",
                message: `Are you sure you want to remove ${subCategory.name}?`,
                callback: () => {
                  fetch(
                    `${process.env.REACT_APP_HOST}/subCategory/${subCategory.id}`,
                    { method: "DELETE" }
                  ).then((res) => {
                    if (res.status === 204) {
                      setCategories((prev) =>
                        prev.map((cat) =>
                          cat.id === id
                            ? {
                                ...cat,
                                subCategorys: cat.subCategorys.filter(
                                  (c) => c.id !== subCategory.id
                                ),
                              }
                            : cat
                        )
                      );
                    } else if (res.status === 409) {
                      Prompt({
                        type: "error",
                        message:
                          "Remove reportable events to delete this subcategory.",
                      });
                    }
                  });
                },
              }),
          },
        ]}
      />
      <Modal
        open={addReporable}
        head={true}
        setOpen={() => {
          setAddReportable(false);
        }}
        label="REPORTABLE EVENT"
        className={s.reportableForm}
      >
        <div className={s.content}>
          <ReportableForm
            setCategories={setCategories}
            _reportables={subCategory.reportable}
            categoryId={id}
            subCategoryId={addReporable?.id}
          />
        </div>
      </Modal>
    </tr>
  );
};
const SubCategoryForm = ({
  edit,
  categoryId,
  onSuccess,
  clearForm,
  subCategorys,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    ...edit,
  });
  const [showReportableForm, setShowReportableForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const reportable = watch("reportable");
  useEffect(() => {
    reset({ status: true, ...edit });
  }, [edit]);
  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          if (
            !edit &&
            subCategorys?.some(
              (item) =>
                item.name.trim().toLowerCase() ===
                data.name.trim().toLowerCase()
            )
          ) {
            Prompt({
              type: "information",
              message: `${data.name} already exists.`,
            });
            return;
          }
          setLoading(true);
          fetch(`${process.env.REACT_APP_HOST}/subCategory`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              reportable: undefined,
              category: { id: categoryId },
            }),
          })
            .then((res) => res.json())
            .then((newSubCategory) => {
              setLoading(false);
              if (newSubCategory.name) {
                onSuccess({ ...newSubCategory, reportable: data.reportable });
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
        <Input
          {...register("template", {
            required: "Please enter a Name",
          })}
          type="number"
          error={errors.name}
        />
        <Checkbox {...register("sentinel")} />
        <Checkbox
          {...register("reportStatus")}
          readOnly={edit?.reportable?.length > 0}
        />
        <Toggle
          register={register}
          name="status"
          required={true}
          watch={watch}
        />
        <div className={s.btns}>
          <button className="btn secondary" type="submit" disabled={loading}>
            {edit ? <FaCheck /> : <FaPlus />}
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
      {
        //   <Modal
        //   open={showReportableForm}
        //   head={true}
        //   setOpen={() => {
        //     setShowReportableForm(false);
        //     setValue("reportable", false);
        //   }}
        //   label="REPORTABLE EVENT"
        //   className={s.reportableForm}
        // >
        //   <div className={s.content}>
        //     <ReportableForm />
        //   </div>
        // </Modal>
      }
    </>
  );
};

const ReportableForm = ({
  categoryId,
  subCategoryId,
  _reportables,
  setCategories,
}) => {
  const [parameters, setParameters] = useState({});
  const [reportables, setReportabels] = useState([...(_reportables || [])]);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/10`)
      .then((res) => res.json())
      .then((data) => {
        const _parameters = { ...parameters };
        if (data.id) {
          _parameters.reportTo = data.twoFieldMasterDetails.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
        setParameters(_parameters);
      });
  }, []);
  useEffect(() => {
    setCategories((prev) => {
      return prev.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          subCategorys: c.subCategorys.map((subC) => {
            if (subCategoryId !== subC.id) return subC;
            return {
              ...subC,
              reportable: reportables,
            };
          }),
        };
      });
    });
  }, [reportables]);
  return (
    <Table
      columns={[
        { label: "Report to" },
        { label: "Reporting instructions" },
        { label: "Action" },
      ]}
    >
      <tr>
        <td className={s.inlineForm}>
          <ReportableInlineForm
            {...(edit && { edit })}
            key={edit ? "edit" : "add"}
            onSuccess={(newReportable) => {
              setReportabels((prev) => {
                return prev.find((c) => c.id === newReportable.id)
                  ? prev.map((c) =>
                      c.id === newReportable.id ? newReportable : c
                    )
                  : [...prev, newReportable];
              });
              setEdit(null);
            }}
            clearForm={() => {
              setEdit(null);
            }}
            reportables={reportables}
            subCategoryId={subCategoryId}
          />
        </td>
      </tr>
      {reportables.map((item) => (
        <tr key={item.id}>
          <td>
            {parameters.reportTo?.find((u) => u.value === item.report_to)
              ?.label || item.report_to}
          </td>
          <td>{item.reporting_instructions}</td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(item),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove reportable event?`,
                    callback: () => {
                      fetch(
                        `${process.env.REACT_APP_HOST}/reportable/${item.id}`,
                        { method: "DELETE" }
                      ).then((res) => {
                        if (res.status === 204) {
                          setReportabels((prev) =>
                            prev.filter((c) => c.id !== item.id)
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
  );
};
const ReportableInlineForm = ({
  edit,
  onSuccess,
  clearForm,
  subCategoryId,
}) => {
  const { handleSubmit, register, reset, watch, setValue } = useForm({
    ...edit,
  });
  const [loading, setLoading] = useState(false);
  const [reportTo, setReportTo] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/10`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setReportTo(
            data.twoFieldMasterDetails.map((item) => ({
              value: item.id,
              label: item.name,
            }))
          );
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }, []);
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_HOST}/reportable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            subCategory: { id: subCategoryId },
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setLoading(false);
            if (data.id) {
              onSuccess(data);
            }
            reset();
          })
          .catch((err) => {
            setLoading(false);
            Prompt({ type: "error", message: err.message });
            console.log(err);
          });
      })}
    >
      <Combobox
        name="report_to"
        register={register}
        watch={watch}
        setValue={setValue}
        options={reportTo}
      />
      <Textarea
        name="reporting_instructions"
        {...register("reporting_instructions")}
      />
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
