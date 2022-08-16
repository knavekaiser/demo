import { useEffect, useState, useCallback, useContext } from "react";
import s from "./style.module.scss";
import { Box } from "../../incidentReport";
import {
  Select,
  Table,
  TableActions,
  Combobox,
  Input,
  Textarea,
  FileInput,
  moment,
  Moment,
  uploadFiles,
} from "../../elements";
import { SiteContext } from "../../../SiteContext";
import { InvestigationContext } from "../InvestigationContext";
import { ImEye } from "react-icons/im";
import { FaRegTrashAlt, FaCheck, FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsPencilFill } from "react-icons/bs";
import { useFetch } from "../../../hooks";
import { endpoints as defaultEndpoints } from "../../../config";
import { Prompt, Modal } from "../../modal";
import { useForm } from "react-hook-form";

const IrInput = () => {
  const { ir, setIr } = useContext(InvestigationContext);
  const [previous, setPrevious] = useState(null);
  const [recordInput, setRecordInput] = useState(false);
  const [requestInput, setRequestInput] = useState(false);
  const [inputs, setInputs] = useState([]);

  const [parameters, setParameters] = useState({
    evidenceTypes: [],
    evidenceSources: [],
    departments: [],
    users: [],
  });
  const { get: getDepartments } = useFetch(
    defaultEndpoints.departments + `?size=1000`
  );
  const { get: getUsers } = useFetch(defaultEndpoints.users + `?size=1000`);
  const { get: getSources } = useFetch(
    defaultEndpoints.twoFieldMasters + "/12"
  );
  const { get: getEvidenceTypes } = useFetch(
    defaultEndpoints.twoFieldMasters + "/13"
  );

  useEffect(() => {
    Promise.all([
      getDepartments(),
      getUsers(),
      getSources(),
      getEvidenceTypes(),
    ])
      .then(
        ([
          { data: departments },
          { data: users },
          { data: sources },
          { data: evidenceTypes },
        ]) => {
          const _parameters = { ...parameters };
          if (departments?._embedded.department) {
            _parameters.departments = departments?._embedded?.department.map(
              (item) => ({
                label: item.name,
                value: item.id,
              })
            );
          }
          if (users?._embedded.user) {
            _parameters.users = users?._embedded?.user.map((item) => ({
              label: item.name,
              value: item.id,
              department: item.department,
            }));
          }
          if (sources?.twoFieldMasterDetails) {
            _parameters.evidenceSources = sources.twoFieldMasterDetails
              .filter((item) => item.showToggle)
              .map((item) => ({ label: item.name, value: item.id }));
          }
          if (evidenceTypes?.twoFieldMasterDetails) {
            _parameters.evidenceTypes = evidenceTypes.twoFieldMasterDetails
              .filter((item) => item.showToggle)
              .map((item) => ({ label: item.name, value: item.id }));
          }
          setParameters((prev) => ({ ...prev, ..._parameters }));
        }
      )
      .catch((err) => {
        Prompt({
          type: "error",
          message: err.message,
        });
      });
  }, []);

  useEffect(() => {
    if (ir) {
      const _inputs = [];
      ir.reqInput?.forEach((input) => {
        const response = ir.responseIrInput?.find(
          (resInput) => resInput.reqId.toString() === input.id.toString()
        );
        _inputs.push({
          __type: "reqInput",
          id: input.id,
          queryBy: input.queryRaisedBy,
          queryDateTime: input.queryDateTime,
          description: input.description,
          queryToUserId: input.userId,
          queryToDeptId: input.deptId,
          query: input.query,
          irInfo: input.irInfo?.split(",") || [],
          copyPrev: input.copyPrev,
          deptInv: input.deptInv,
          personAffected: input.personAff,
          categoryTemplate: input.subcateg,
          ...(response && {
            userId: response.responseBy,
            dateTime: response.responseOn,
            deptId: response.deptId,
            response: response.response,
            upload: response.upload,
          }),
        });
      });
      ir.recordInput?.forEach((rec) =>
        _inputs.push({
          __type: "recordInput",
          id: rec.id,
          userId: rec.responseFrom,
          deptId: rec.dept,
          dateTime: rec.recdOn,
          response: rec.response,
          upload: rec.upload,
          fileName: rec.fileName,
          source: rec.source,
        })
      );

      setInputs(
        _inputs.sort((a, b) =>
          a.dateTime && b.dateTime
            ? new Date(a.dateTime) < new Date(b.dateTime)
              ? 1
              : -1
            : new Date(a.queryDateTime) < new Date(b.queryDateTime)
            ? 1
            : -1
        )
      );
    }
  }, [ir]);

  const [reqEdit, setReqEdit] = useState(null);
  const [recEdit, setRecEdit] = useState(null);

  const selectPrevious = useCallback(() => {
    const reqInputs = inputs
      .filter((input) => input.__type === "reqInput")
      .sort((a, b) =>
        new Date(a.queryDateTime) > new Date(b.queryDateTime) ? 1 : -1
      );
    const editIndex = reqInputs.findIndex((item) => item.id === reqEdit?.id);

    if (reqEdit) {
      setPrevious(reqInputs[editIndex - 1]);
    } else {
      setPrevious(reqInputs[reqInputs.length - 1]);
    }
  }, [requestInput, reqEdit, inputs]);

  useEffect(() => {
    selectPrevious();
  }, [requestInput]);

  return (
    <div className={s.irInput}>
      <div className={s.btns}>
        <button className="btn secondary" onClick={() => setRequestInput(true)}>
          Request for Input
        </button>
        <button className="btn secondary" onClick={() => setRecordInput(true)}>
          Record Inputs
        </button>
      </div>
      <Table
        columns={[
          { label: "Query Date & Time" },
          { label: "Query by" },
          { label: "Inputs by / Response by" },
          { label: "Department" },
          { label: "Response Date & Time" },
          { label: "Actions" },
        ]}
      >
        {inputs.map((item, i) => (
          <SingleInput
            input={item}
            key={i}
            parameters={parameters}
            setIr={setIr}
            setReqEdit={setReqEdit}
            setRecEdit={setRecEdit}
            setRecordInput={setRecordInput}
            setRequestInput={setRequestInput}
          />
        ))}
      </Table>
      <Box collapsable label="Evidence">
        <Evidence parameters={parameters} />
      </Box>
      <Modal
        head
        label="RECORD INPUTS"
        open={recordInput}
        setOpen={() => {
          setRecordInput();
          setRecEdit(null);
        }}
        className={s.recordInputModal}
      >
        <RecordInputForm
          edit={recEdit}
          parameters={parameters}
          onSuccess={(newRecordInput) => {
            setRecordInput(false);
            setIr((prev) => ({
              ...prev,
              recordInput: recEdit
                ? prev.recordInput.map((rec) =>
                    rec.id === newRecordInput.id ? newRecordInput : rec
                  )
                : [newRecordInput, ...prev.recordInput],
            }));
            setRecEdit(null);
          }}
        />
      </Modal>
      <Modal
        head
        label="REQUEST FOR INPUT"
        open={requestInput}
        setOpen={() => {
          setRequestInput(false);
          setReqEdit(null);
        }}
        className={s.requestInput}
      >
        <RequestInputForm
          edit={reqEdit}
          parameters={parameters}
          previous={previous}
          onSuccess={(newReqInput) => {
            setRequestInput(false);
            setIr((prev) => ({
              ...prev,
              reqInput: reqEdit
                ? prev.reqInput.map((input) =>
                    input.id === newReqInput.id ? newReqInput : input
                  )
                : [newReqInput, ...prev.reqInput],
            }));
            setReqEdit(null);
          }}
        />
      </Modal>
    </div>
  );
};
const SingleInput = ({
  setRecEdit,
  setReqEdit,
  setRecordInput,
  setRequestInput,
  input,
  parameters,
  setIr,
}) => {
  const [view, setView] = useState(false);
  const { remove: deleteRecord } = useFetch(
    defaultEndpoints.recordInputs + "/{ID}"
  );
  const { remove: deleteRequest } = useFetch(
    defaultEndpoints.requestInputs + "/{ID}"
  );

  return (
    <>
      <tr>
        <td>
          <Moment format="DD/MM/YYYY hh:mm">{input.queryDateTime}</Moment>
        </td>
        <td>
          {parameters.users.find(
            (user) => user.value.toString() === input.queryBy?.toString()
          )?.label || input.queryBy}
        </td>
        <td>
          {parameters.users.find(
            (user) => user.value.toString() === input.userId?.toString()
          )?.label || input.userId}
        </td>
        <td>
          {parameters.departments.find(
            (dept) => dept.value.toString() === input.deptId?.toString()
          )?.label || input.department}
        </td>
        <td>
          <Moment format="DD/MM/YYYY hh:mm">{input.dateTime}</Moment>
        </td>
        <TableActions
          actions={[
            { label: "View", icon: <ImEye />, callBack: () => setView(true) },
            ...(input.__type === "recordInput" ||
            (input.__type === "reqInput" && !input.response)
              ? [
                  {
                    icon: <BsPencilFill />,
                    label: "Edit",
                    callBack: () => {
                      if (input.__type === "recordInput") {
                        setRecEdit(input);
                        setRecordInput(true);
                      } else if (input.__type === "reqInput") {
                        setReqEdit(input);
                        setRequestInput(true);
                      }
                    },
                  },
                  {
                    label: "Delete",
                    icon: <FaRegTrashAlt />,
                    callBack: () => {
                      Prompt({
                        type: "confirmation",
                        message: "Are you sure you want to delete this record?",
                        callback: () => {
                          if (input.__type === "recordInput") {
                            deleteRecord(null, {
                              params: { "{ID}": input.id },
                            }).then(({ res }) => {
                              if (res.status === 204) {
                                setIr((prev) => ({
                                  ...prev,
                                  recordInput: prev.recordInput.filter(
                                    (rec) => rec.id !== input.id
                                  ),
                                }));
                              }
                            });
                          } else {
                            deleteRequest(null, {
                              params: { "{ID}": input.id },
                            }).then(({ res }) => {
                              if (res.status === 204) {
                                setIr((prev) => ({
                                  ...prev,
                                  reqInput: prev.reqInput.filter(
                                    (rec) => rec.id !== input.id
                                  ),
                                }));
                              }
                            });
                          }
                        },
                      });
                    },
                  },
                ]
              : []),
          ]}
        />
      </tr>
      <Modal
        open={view}
        setOpen={setView}
        head
        label="SUBMIT IR INPUTS"
        className={s.inputView}
      >
        <div className={s.content}>
          {input.queryBy && (
            <p>
              <strong>Query Raised by</strong> -{" "}
              {parameters?.users?.find(({ value }) => value === input.queryBy)
                ?.label || input.queryBy}{" "}
              on <Moment format="DD/MM/YYYY">{input.queryDateTime}</Moment> at{" "}
              <Moment format="hh:mm">{input.queryDateTime}</Moment>
            </p>
          )}
          <div className={s.innerWrapper}>
            <p>{input.query}</p>
            <p>Please provide inputs on this incident.</p>
            <ul className={s.responses}>
              {input.response ? (
                <li>
                  <p className={s.responseFrom}>
                    <span className={s.no}>#1 Response</span> - by{" "}
                    {parameters?.users?.find(
                      ({ value }) => value === input.userId
                    )?.label || input.userId}{" "}
                    on <Moment format="DD/MM/YYYY">{input.dateTime}</Moment> at{" "}
                    <Moment format="hh:mm">{input.dateTime}</Moment>
                  </p>
                  <p>{input.response}</p>
                </li>
              ) : (
                <li>No response yet</li>
              )}
            </ul>
            {input.upload && (
              <p className={s.upload}>
                <span className={s.label}>Document Uploaded:</span>{" "}
                <a target="_blank" href={input.upload}>
                  {input.fileName || input.upload}
                </a>
              </p>
            )}
          </div>
          <section className={s.btns}>
            <button
              type="button"
              className={`btn secondary wd-100`}
              onClick={() => setView(false)}
            >
              Close
            </button>
          </section>
        </div>
      </Modal>
    </>
  );
};

const RequestInputForm = ({ edit, onSuccess, previous, parameters }) => {
  const { ir } = useContext(InvestigationContext);
  const { user } = useContext(SiteContext);

  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: ir.inciDescription,
      deptInv: ir.deptsLookupMultiselect
        .split(",")
        .map(
          (deptId) =>
            parameters?.departments?.find(
              (dept) => dept.value.toString() === deptId
            )?.label || deptId
        )
        .join(", "),
      person: ir.personAffected,
    },
  });

  const irInfo = watch("irInformation"); // ["Description", "Copy From Previous"];

  const {
    post: saveRequest,
    put: updateRequest,
    loading: savingRequest,
  } = useFetch(defaultEndpoints.requestInputs + "/" + (edit?.id || ""));

  useEffect(() => {
    if (!edit?.copyPrev && irInfo?.includes("copyPrev") && previous) {
      setValue("copyPrev", previous.description);
    }
  }, [irInfo]);

  const dept = watch("department");

  useEffect(() => {
    reset({
      department: edit?.queryToDeptId,
      user: edit?.queryToUserId,
      irInformation: edit?.irInfo || [],
      query: edit?.query,
      copyPrev: edit?.copyPrev,
      description: edit?.description || ir.inciDescription,
      deptInv:
        edit?.deptInv ||
        ir.deptsLookupMultiselect
          .split(",")
          .map(
            (deptId) =>
              parameters?.departments?.find(
                (dept) => dept.value.toString() === deptId
              )?.label || deptId
          )
          .join(", "),
      personAffected: edit?.personAffected || ir.personAffected,
      categoryTemplate: edit?.categoryTemplate,
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        (edit ? updateRequest : saveRequest)({
          deptId: values.department,
          userId: values.user,
          query: values.query,
          irInfo: values.irInformation.join(),
          copyPrev: values.copyPrev,
          description: values.description,
          deptInv: values.deptInv,
          personAff: values.personAffected,
          incidentReport: { id: ir.id },
          queryRaisedBy: user.id,
          queryDateTime: edit?.queryDateTime || new Date(),
        })
          .then(({ data }) => {
            if (data.id) {
              Prompt({
                type: "success",
                message: `Request submitted successfully.`,
              });
              return onSuccess(data);
            }
            Prompt({ type: "error", message: data.message });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      data-testid="RequestInputForm"
    >
      <Select
        control={control}
        name="department"
        label="Department"
        formOptions={{ required: "Select a Department" }}
        options={parameters.departments}
      />
      <Select
        control={control}
        name="user"
        label="User"
        formOptions={{ required: "Select a User" }}
        options={
          dept
            ? parameters.users.filter((user) => dept === user.department)
            : parameters.users
        }
      />
      <Combobox
        label="IR Information"
        name="irInformation"
        watch={watch}
        register={register}
        setValue={setValue}
        placeholder="Select"
        multiple
        options={[
          {
            value: "copyPrev",
            label: "Copy From Previous",
            disabled: !previous,
          },
          { value: "description", label: "Description" },
          { value: "deptInv", label: "Departments Involved" },
          { value: "personAff", label: "Person Affected" },
          { value: "categoryTemplate", label: "Category Template" },
        ]}
      />
      {irInfo?.length > 0 && (
        <section className={s.descriptions}>
          {irInfo.includes("copyPrev") && (
            <Textarea
              label="From Previous"
              {...register("copyPrev")}
              readOnly
              error={errors.copyPrev}
            />
          )}
          {irInfo.includes("description") && (
            <Textarea
              label="Description"
              {...register("description")}
              error={errors.description}
            />
          )}
          {irInfo.includes("personAff") && (
            <Textarea
              label="Person Affected"
              {...register("personAffected")}
              readOnly
            />
          )}
          {irInfo.includes("deptInv") && (
            <Textarea
              label="Departments Involved"
              {...register("deptInv")}
              readOnly
            />
          )}
          {irInfo.includes("categoryTemplate") && (
            <Textarea
              label="Category Template"
              {...register("categoryTemplate")}
              readOnly
            />
          )}
        </section>
      )}
      <Textarea
        className={s.query}
        label={
          <>
            <span style={{ color: "red" }}>*</span> Query
          </>
        }
        {...register("query", { required: "Enter Query" })}
        error={errors.query}
      />
      <Input label="Raised by" value={user.name} readOnly />
      <Input
        label="Raised on"
        value={moment({
          time: edit?.queryDateTime || new Date(),
          format: "YYYY-MM-DD hh:mm",
        })}
        readOnly
      />
      <section className={s.btns}>
        <button
          className="btn secondary wd-100"
          type="button"
          onClick={() => reset()}
        >
          Clear
        </button>
        <button className="btn wd-100" type="submit" disabled={savingRequest}>
          Submit Query
        </button>
      </section>
    </form>
  );
};
const RecordInputForm = ({ edit, parameters, onSuccess }) => {
  const { user } = useContext(SiteContext);
  const { ir } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const uploads = watch("upload");

  const { post: saveInput, put: updateInput, loading } = useFetch(
    defaultEndpoints.recordInputs + "/" + (edit?.id || ""),
    {
      validator: { upload: /^.+$/gi },
    }
  );
  const { post: upload, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );

  useEffect(() => {
    reset({
      ...edit,
      responseFrom: edit?.responseFrom || user.name,
      recievedOn: moment({ time: edit?.dateTime, format: "YYYY-MM-DDThh:mm" }),
      dept: edit?.deptId || "",
      ...(edit?.upload && {
        upload: [
          {
            fileName: edit.fileName || edit.upload,
            uploadFilePath: edit.upload,
          },
        ],
      }),
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (
          Array.isArray(values.upload) &&
          values.upload.filter((item) => !item.uploadFilePath).length
        ) {
          const { links, error: uploadError } = await uploadFiles({
            files: values.upload,
            uploadFiles: upload,
          });
          if (uploadError) {
            return Prompt({ type: "error", message: uploadError.message });
          }

          values.upload = links[0].uri;
          values.fileName = links[0].name;
        } else if (values.upload?.length) {
          const _file = values.upload[0];
          values.fileName = _file.fileName;
          values.upload = _file.uploadFilePath;
        } else {
          values.upload = "";
          values.fileName = "";
        }

        (edit ? updateInput : saveInput)({
          source: values.source,
          dept: values.dept,
          responseFrom: values.responseFrom,
          upload: values.upload,
          fileName: values.fileName,
          response: values.response,
          recdOn: values.recievedOn,
          incidentReport: { id: ir.id },
        })
          .then(({ data }) => {
            if (data?.id) {
              Prompt({
                type: "success",
                message: `Record submitted successfully.`,
              });
              return onSuccess(data);
            }
            Prompt({
              type: "error",
              message: data.message,
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      data-testid="RecordInputForm"
    >
      <Input
        label="Response From"
        {...register("responseFrom", { required: "Enter Name" })}
        error={errors.responseFrom}
      />
      <Combobox
        label="Department"
        name="dept"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Department" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.departments}
        errors={errors.dept}
      />
      <Combobox
        label="Source"
        name="source"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Source" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceSources}
        errors={errors.evidenceSource}
      />
      <Input
        label="Received On"
        type="datetime-local"
        {...register("recievedOn", {
          required: "Enter Received Date",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
        error={errors.recievedOn}
      />
      <Textarea
        className={s.response}
        label="Response"
        {...register("response", { required: "Enter Response" })}
        error={errors.response}
      />
      <FileInput
        label="Upload"
        prefill={uploads}
        onChange={(files) => {
          setValue("upload", files);
        }}
      />
      <section className={s.btns}>
        <button
          className="btn secondary wd-100"
          type="button"
          onClick={() => reset()}
        >
          Clear
        </button>
        <button
          className="btn wd-100"
          type="submit"
          disabled={uploadingFiles || loading}
        >
          Submit Response
        </button>
      </section>
    </form>
  );
};

const Evidence = ({ parameters }) => {
  const { ir } = useContext(InvestigationContext);
  const [evidences, setEvidences] = useState([]);
  const [edit, setEdit] = useState(null);

  const onSuccess = useCallback((newEvidence) => {
    setEvidences((prev) => {
      return prev.find((c) => c.id === newEvidence.id)
        ? prev.map((c) => (c.id === newEvidence.id ? newEvidence : c))
        : [...prev, newEvidence];
    });
    setEdit(null);
  }, []);

  const { get: getEvidences, loading } = useFetch(
    defaultEndpoints.evidenceSearch
  );
  const { remove: deleteEvidence } = useFetch(
    defaultEndpoints.evidences + "/{ID}"
  );

  useEffect(() => {
    if (ir?.id) {
      getEvidences(null, { query: { irId: ir.id } })
        .then(({ data }) => {
          if (data?._embedded?.inputEvidences) {
            setEvidences(data._embedded.inputEvidences);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [ir?.id]);
  return (
    <Table
      loading={loading}
      columns={[
        { label: "Evidence Type" },
        { label: "Evidence Source" },
        { label: "Evidence Description" },
        { label: "Evidence Date & Time" },
        { label: "Upload" },
        { label: "Actions" },
      ]}
      className={s.evidences}
    >
      <tr>
        <td className={s.inlineForm}>
          <EvidenceForm
            {...(edit && { edit })}
            key={edit ? "edit" : "add"}
            onSuccess={onSuccess}
            clearForm={setEdit}
            evidences={evidences}
            parameters={parameters}
          />
        </td>
      </tr>
      {evidences.map((evid, i) => (
        <tr key={i}>
          <td>
            {parameters.evidenceTypes.find(
              (type) => type.value === evid.eviType
            )?.label || evid.eviType}
          </td>
          <td>
            {parameters.evidenceSources.find(
              (source) => source.value === evid.eviSource
            )?.label || evid.evidenceSource}
          </td>
          <td>{evid.eviDesc}</td>
          <td>
            <Moment format="DD/MM/YYYY hh:mm">{evid.dateTime}</Moment>
          </td>
          <td className="textEllips">
            <a target="_blank" href={evid.upload}>
              {evid.fileName || evid.upload}
            </a>
          </td>
          <TableActions
            actions={[
              {
                icon: <BsPencilFill />,
                label: "Edit",
                callBack: () => setEdit(evid),
              },
              {
                icon: <FaRegTrashAlt />,
                label: "Delete",
                callBack: () =>
                  Prompt({
                    type: "confirmation",
                    message: `Are you sure you want to remove this evidence?`,
                    callback: () => {
                      deleteEvidence(null, {
                        params: { "{ID}": evid.id },
                      }).then(({ res }) => {
                        if (res.status === 204) {
                          setEvidences((prev) =>
                            prev.filter((c) => c.id !== evid.id)
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
  );
};
const EvidenceForm = ({
  edit,
  onSuccess,
  clearForm,
  evidences,
  parameters,
}) => {
  const { ir } = useContext(InvestigationContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({ ...edit });

  const uploads = watch("upload");
  const { post: postEvidence, put: updateEvidence, loading } = useFetch(
    defaultEndpoints.evidences + `/${edit?.id || ""}`,
    {
      validator: { upload: /^.+$/gi },
    }
  );
  const { post: upload, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );

  useEffect(() => {
    reset({
      ...edit,
      dateTime: edit
        ? moment({ time: edit.dateTime, format: "YYYY-MM-DDThh:mm" })
        : "",
      upload: edit?.upload
        ? [{ fileName: edit.fileName, uploadFilePath: edit.upload }]
        : [],
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (values.upload?.filter((item) => !item.uploadFilePath).length) {
          const { links, error: uploadError } = await uploadFiles({
            files: values.upload,
            uploadFiles: upload,
          });
          if (uploadError) {
            return Prompt({ type: "error", message: uploadError.message });
          }

          values.upload = links[0].uri;
          values.fileName = links[0].name;
        } else if (values.upload?.length) {
          const _file = values.upload[0];
          values.fileName = _file.fileName;
          values.upload = _file.uploadFilePath;
        } else {
          values.upload = "";
          values.fileName = "";
        }

        (edit ? updateEvidence : postEvidence)({
          ...values,
          irId: ir.id,
        })
          .then((data) => {
            if (data.id) {
              onSuccess(data);
              reset({
                upload: [],
                eviType: "",
                eviSource: "",
                eviDesc: "",
                dateTime: "",
              });
            }
          })
          .catch((err) => {
            Prompt({ type: "error", message: err.message });
          });
      })}
      data-testid="EvidenceForm"
    >
      <Combobox
        name="eviType"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Type" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceTypes}
        error={errors.eviType}
        clearErrors={clearErrors}
      />
      <Combobox
        name="eviSource"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Source" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceSources}
        error={errors.eviSource}
        clearErrors={clearErrors}
      />
      <Textarea
        {...register("eviDesc", {
          required: "Enter Evidence Description",
        })}
        error={errors.eviDesc}
      />
      <Input
        type="datetime-local"
        {...register("dateTime", {
          required: "Select Evidence Date & Time",
          validate: (v) =>
            new Date(v) < new Date() || "Can not select date from future",
        })}
        max={moment({ time: new Date(), format: "YYYY-MM-DDThh:mm" })}
        error={errors.dateTime}
      />
      <FileInput
        prefill={uploads}
        onChange={(files) => {
          setValue("upload", files);
        }}
      />
      <div className={s.btns}>
        <button
          className="btn secondary"
          type="submit"
          disabled={uploadingFiles || loading}
        >
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
            data-testid="EvidenceFormClose"
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

export default IrInput;
