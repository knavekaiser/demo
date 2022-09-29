import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { Box } from "../incidentReport";
import {
  Textarea,
  Select,
  Combobox,
  SearchField,
  Input,
  Checkbox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { useForm } from "react-hook-form";
import { Modal, Prompt } from "../modal";
import { useFetch } from "../../hooks";
import { endpoints as defaultEndpoints } from "../../config";
import s from "./masters.module.scss";

export default function Categories() {
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState(null);
  const [edit, setEdit] = useState(null);

  const { get: getCategories, loading } = useFetch(defaultEndpoints.categories);
  const { remove: deleteCategory } = useFetch(
    defaultEndpoints.categories + "/" + "{ID}"
  );

  const [formTemplates, setFormTemplates] = useState([]);
  const { post: getFormTemplates } = useFetch(defaultEndpoints.formTemplates, {
    his: true,
    defaultHeaders: false,
  });

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        if (data._embedded?.category) {
          setCategories(data._embedded.category);
          setSelected(data._embedded.category[0]?.id);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
    getFormTemplates({
      isChildRequired: false,
    })
      .then(({ data }) => {
        if (data?.success) {
          setFormTemplates(
            data.dataBean.map((template) => ({
              value: template.formMapId,
              label: template.formName,
            }))
          );
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={s.container} data-testid="categories">
      <header>
        <h3>CATEGORY & SUBCATEGORY MASTER</h3>
      </header>
      <div className={`${s.content} ${s.parent_child}`}>
        <div className={s.parent}>
          <div className={s.head}>
            <Input
              placeholder="Quick Search"
              icon={<BiSearch />}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Table
            loading={loading}
            columns={[{ label: "Category Name" }, { label: "Action" }]}
          >
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
                              deleteCategory(null, {
                                params: { "{ID}": category.id },
                              }).then(({ res }) => {
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
            formTemplates={formTemplates}
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
  } = useForm();

  const { post: postCategory, put: updateCategory, loading } = useFetch(
    defaultEndpoints.categories + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          categories?.some(
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

        (edit ? updateCategory : postCategory)(data)
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

const SubCategories = ({
  category: { id, name, subCategorys },
  setCategories,
  formTemplates,
}) => {
  const [edit, setEdit] = useState(null);
  const [addReporable, setAddReportable] = useState(false);
  return (
    <div className={`${s.subCategory} ${s.child}`} data-testid="subcategories">
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
          { label: "Subcategory" },
          { label: "Template" },
          { label: "Sentinel" },
          { label: "Reportable" },
          { label: "Status" },
          { label: "Action" },
        ]}
        actions={true}
      >
        <tr>
          <td className={s.inlineForm}>
            <SubCategoryForm
              {...(edit && { edit })}
              key={edit ? "edit" : "add"}
              categoryId={id}
              formTemplates={formTemplates}
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
            formTemplates={formTemplates}
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
        <div className={s.content} data-testid="reportables">
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
const SingleSubCategory = ({
  id,
  subCategory,
  setCategories,
  setEdit,
  formTemplates,
}) => {
  const [addReporable, setAddReportable] = useState(false);

  const { remove: deleteSubCategory } = useFetch(
    defaultEndpoints.subCategories + "/{ID}"
  );

  return (
    <tr>
      <td>{subCategory.name}</td>
      <td>
        {formTemplates.find((l) => l.value === subCategory.template)?.label ||
          subCategory.template}
      </td>
      <td>{subCategory.sentinel ? "Sentinel" : ""}</td>
      <td>
        {(subCategory.reportStatus || subCategory.reportable?.length > 0) && (
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
                  deleteSubCategory(null, {
                    params: { "{ID}": subCategory.id },
                  }).then(({ res }) => {
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
  formTemplates,
}) => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [showReportableForm, setShowReportableForm] = useState(false);
  const reportable = watch("reportable");

  const { post: postSubCategory, put: updateSubCategory, loading } = useFetch(
    defaultEndpoints.subCategories + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({
      status: true,
      ...edit,
      ...(edit?.reportable?.length > 0 && { reportStatus: true }),
    });
  }, [edit]);
  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          if (
            subCategorys?.some(
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
          (edit ? updateSubCategory : postSubCategory)({
            ...data,
            reportable: undefined,
            category: { id: categoryId },
          })
            .then((newSubCategory) => {
              if (newSubCategory.name) {
                onSuccess({ ...newSubCategory, reportable: data.reportable });
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
            required: "Please enter a Name",
          })}
          error={errors.name}
        />
        <Select
          control={control}
          name="template"
          formOptions={{
            required: "Please Select a Template",
          }}
          options={formTemplates}
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
    </>
  );
};

export const ReportableForm = ({
  categoryId,
  subCategoryId,
  _reportables,
  setCategories,
}) => {
  const [parameters, setParameters] = useState({});
  const [reportables, setReportabels] = useState([...(_reportables || [])]);
  const [edit, setEdit] = useState(null);
  const { get: getReportables } = useFetch(
    `${defaultEndpoints.twoFieldMasters}/10`
  );

  const { remove: deleteReportable } = useFetch(
    defaultEndpoints.reportables + "/" + "{ID}"
  );

  useEffect(() => {
    getReportables().then(({ data }) => {
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
                      deleteReportable(null, {
                        params: { "{ID}": item.id },
                      }).then(({ res }) => {
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
  reportables,
}) => {
  const { handleSubmit, register, reset, watch, setValue } = useForm();
  const [reportTo, setReportTo] = useState([]);

  const { get: getReportTo, loading } = useFetch(
    defaultEndpoints.twoFieldMasters + "/10"
  );

  const { post: addReportable } = useFetch(defaultEndpoints.reportables);

  useEffect(() => {
    getReportTo()
      .then(({ data }) => {
        if (data.id) {
          setReportTo(
            data.twoFieldMasterDetails
              .filter((item) => item.showToggle)
              .map((item) => ({
                value: item.id,
                label: item.name,
              }))
          );
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          reportables?.some(
            (item) => +item.report_to === +data.report_to && item.id !== data.id
          )
        ) {
          Prompt({
            type: "information",
            message: `Person already exists.`,
          });
          return;
        }
        addReportable({ ...data, subCategory: { id: subCategoryId } })
          .then(({ data }) => {
            if (data.id) {
              onSuccess(data);
            }
            reset();
          })
          .catch((err) => {
            Prompt({ type: "error", message: err.message });
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
