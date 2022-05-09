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
        console.log(err);
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
          queryBy: input.userId,
          queryDateTime: input.queryDateTime,
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
          deptId: rec.deptId,
          dateTime: rec.recdOn,
        })
      );

      setInputs(
        _inputs.sort((a, b) =>
          new Date(a.queryDateTime) < new Date(b.queryDateTime) ? 1 : -1
        )
      );
    }
  }, [ir]);

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
        setOpen={setRecordInput}
        className={s.recordInputModal}
      >
        <RecordInputForm
          parameters={parameters}
          onSuccess={(newRecordInput) => {
            setRecordInput(false);
            setIr((prev) => ({
              ...prev,
              recordInput: [...prev.recordInput, newRecordInput],
            }));
          }}
        />
      </Modal>
      <Modal
        head
        label="REQUEST FOR INPUT"
        open={requestInput}
        setOpen={setRequestInput}
        className={s.requestInput}
      >
        <RequestInputForm
          parameters={parameters}
          onSuccess={(newReqInput) => {
            setRequestInput(false);
            setIr((prev) => ({
              ...prev,
              reqInput: [...prev.reqInput, newReqInput],
            }));
          }}
        />
      </Modal>
    </div>
  );
};
const SingleInput = ({ input, parameters, setIr }) => {
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
          <p className={""}>
            <strong>Query Raised by</strong> -{" "}
            {parameters?.users?.find(({ value }) => value === input.queryBy)
              ?.label || input.queryBy}{" "}
            on <Moment format="DD/MM/YYYY">{input.queryDateTime}</Moment> at{" "}
            <Moment format="hh:mm">{input.queryDateTime}</Moment>
          </p>
          <div className={s.innerWrapper}>
            <p>{input.query}</p>
            <p>Please provide inputs on this incident.</p>
            <ul className={s.responses}>
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
            </ul>
            {document.upload && (
              <p>
                <span className={s.label}>Document Uploaded:</span>{" "}
                <a _target="_blank" href={input.upload}>
                  {input.upload}
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

const RequestInputForm = ({ onSuccess, parameters }) => {
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
      deptInv: ir.deptsLookupMultiselect.split(","),
      person: ir.personAffected,
      // category template
      //
    },
  });

  const irInfo = watch("irInformation"); // ["Description", "Copy From Previous"];

  const { post: saveRequest, loading: savingRequest } = useFetch(
    defaultEndpoints.requestInputs
  );

  return (
    <form
      onSubmit={handleSubmit((values) => {
        saveRequest({
          deptId: values.department,
          userId: values.user,
          query: values.query,
          // irInfo: "irInfo",
          // copyPrev: "copyPrev",
          description: values.description,
          deptInv: values.departments,
          personAff: values.personAffected,
          incidentReport: { id: ir.id },
          queryRaisedBy: user.id,
          queryDateTime: new Date(),
        })
          .then(({ data }) => {
            if (data.id) {
              return onSuccess(data);
            }
            Prompt({ type: "error", message: data.message });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Select
        control={control}
        name="department"
        label="Department"
        formOptions={{ reuqried: "Select a Department" }}
        options={parameters.departments}
        error={errors.department}
      />
      <Select
        control={control}
        name="user"
        label="User"
        formOptions={{ reuqried: "Select a User" }}
        options={parameters.users}
        error={errors.user}
      />
      <Combobox
        label="IR Information"
        name="irInformation"
        watch={watch}
        register={register}
        formOptions={{ required: "Select IR Information" }}
        setValue={setValue}
        placeholder="Select"
        multiple
        options={[
          { value: "copyPrev", label: "Copy From Previous" },
          { value: "description", label: "Description" },
          { value: "deptInv", label: "Departments Involved" },
          { value: "personAff", label: "Person Affected" },
          { value: "categoryTemplate", label: "Category Template" },
        ]}
        errors={errors.irInformation}
      />
      {irInfo?.length > 0 && (
        <section className={s.descriptions}>
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
              {...register("departments")}
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
          time: new Date().toISOString(),
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
const RecordInputForm = ({ parameters, onSuccess }) => {
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

  const { post: saveInput, loading } = useFetch(defaultEndpoints.recordInputs);
  const { post: upload, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (values.upload?.length) {
          const { links, error: uploadError } = await uploadFiles({
            files: values.upload,
            uploadFiles: upload,
          });
          if (uploadError) {
            return Prompt({ type: "error", message: uploadError.message });
          }

          values.upload = links[0];
        } else {
          values.upload = "";
        }

        saveInput({
          source: values.source,
          responseFrom: user.id,
          // responseFrom: values.responseFrom,
          upload: values.upload,
          response: values.response,
          recdOn: values.recievedOn,
          incidentReport: { id: ir.id },
        })
          .then(({ data }) => {
            if (data?.id) {
              return onSuccess(data);
            }
            Prompt({
              type: "error",
              message: data.message,
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input
        label="Response From"
        // {...register("responseFrom", { required: "Enter From" })}
        // error={errors.from}
        value={user.name}
        readOnly
      />
      <Combobox
        label="Source"
        name="evidenceSource"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Source" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceSources}
        errors={errors.evidenceSource}
      />
      <Input
        label="Recieved On"
        type="datetime-local"
        {...register("recievedOn", { required: "Enter Recieved Date" })}
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
              {evid.upload}
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
                    message: `Are you sure you want to remove ${evid.name}?`,
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
    defaultEndpoints.evidences + `/${edit?.id || ""}`
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
      upload: edit?.upload ? [edit.upload] : [],
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (values.upload?.length) {
          const { links, error: uploadError } = await uploadFiles({
            files: values.upload,
            uploadFiles: upload,
          });
          console.log(links, uploadError);
          if (uploadError) {
            return Prompt({ type: "error", message: uploadError.message });
          }

          values.upload = links[0];
        } else {
          values.upload = "";
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
        })}
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
          >
            <IoClose />
          </button>
        )}
      </div>
    </form>
  );
};

export default IrInput;
