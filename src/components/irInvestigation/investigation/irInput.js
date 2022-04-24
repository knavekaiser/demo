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

  const { remove: deleteRecord } = useFetch(
    defaultEndpoints.recordInputs + "/{ID}"
  );
  const { remove: deleteRequest } = useFetch(
    defaultEndpoints.requestInputs + "/{ID}"
  );

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

  useEffect(() => {
    getDepartments().then(({ data }) => {
      console.log(data);
      if (data?._embedded?.department) {
        setParameters((prev) => ({
          ...prev,
          departments: data?._embedded?.department.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        }));
      }
    });
    getUsers().then(({ data }) => {
      console.log(data);
      if (data?._embedded?.user) {
        setParameters((prev) => ({
          ...prev,
          users: data?._embedded?.user.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        }));
      }
    });
    getSources().then(({ data }) => {
      if (data?.twoFieldMasterDetails) {
        setParameters((prev) => ({
          ...prev,
          evidenceSources: data.twoFieldMasterDetails
            .filter((item) => item.showToggle)
            .map((item) => ({ label: item.name, value: item.id })),
        }));
      }
    });
  }, []);

  console.log(ir, [...(ir.recordInput || []), ...(ir.reqInput || [])]);
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
          { label: "Inputs by / Response by" },
          { label: "Department" },
          { label: "Query Date & Time" },
          { label: "Query by" },
          { label: "Response Date & Time" },
          { label: "Actions" },
        ]}
      >
        {([...(ir.recordInput || []), ...(ir.reqInput || [])] || []).map(
          (item, i) => (
            <tr key={i}>
              <td>
                {parameters.users.find(
                  (dept) =>
                    dept.value.toString() === item.userId?.toString() ||
                    dept.value.toString() === item.responseBy?.toString()
                )?.label ||
                  item.userId ||
                  item.responseBy}
              </td>
              <td>
                {parameters.departments.find(
                  (dept) => dept.value.toString() === item.deptId?.toString()
                )?.label || item.department}
              </td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">{item.recdOn}</Moment>
              </td>
              <td>{item.responseFrom}</td>
              <td>
                <Moment format="DD/MM/YYYY hh:mm">{item.responseOn}</Moment>
              </td>
              <TableActions
                actions={[
                  { label: "View", icon: <ImEye />, callback: () => {} },
                  {
                    label: "Delete",
                    icon: <FaRegTrashAlt />,
                    callBack: () => {
                      Prompt({
                        type: "confirmation",
                        message: "Are you sure you want to delete this record?",
                        callback: () => {
                          if (item.personAff === undefined) {
                            deleteRecord(null, {
                              params: { "{ID}": item.id },
                            }).then(({ res }) => {
                              console.log(res.status);
                              if (res.status === 204) {
                                setIr((prev) => ({
                                  ...prev,
                                  recordInput: prev.recordInput.filter(
                                    (rec) => rec.id !== item.id
                                  ),
                                }));
                              }
                            });
                          } else {
                            deleteRequest(null, {
                              params: { "{ID}": item.id },
                            }).then(({ res }) => {
                              console.log(res.status);
                              if (res.status === 204) {
                                setIr((prev) => ({
                                  ...prev,
                                  reqInput: prev.reqInput.filter(
                                    (rec) => rec.id !== item.id
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
          )
        )}
      </Table>
      <Box collapsable label="Evidence">
        <Evidence />
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

  const uploads = watch("files");
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
          // irInfo: "irInfo",
          // copyPrev: "copyPrev",
          description: values.description,
          deptInv: values.departments,
          personAff: values.personAffected,
          incidentReport: { id: ir.id },
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
        {...register("response", { required: "Enter Response" })}
        error={errors.response}
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

  const uploads = watch("files");

  const { post: saveInput, loading } = useFetch(defaultEndpoints.recordInputs);
  const { post: uploadFiles, laoding: uploadingFiles } = useFetch(
    defaultEndpoints.uploadFiles
  );

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (values.upload?.length) {
          const formData = new FormData();
          const uploaded = [];
          const newFiles = [];

          for (var _file of values.upload) {
            if (typeof _file === "string" || _file.uri) {
              uploaded.push(_file.uri || _file);
            } else {
              newFiles.push(_file);
              formData.append("files", _file);
            }
          }

          let links = "";

          if (newFiles.length) {
            links = await uploadFiles(formData)
              .then(({ data }) => (links = data?.map((item) => item.uri) || []))
              .catch((err) => {
                Prompt({
                  type: "error",
                  message: "Invalid file, Please check",
                });
                return [];
              });
          }

          if (newFiles.length !== links.length) {
            return;
          }

          values.upload = links[0];
        }

        saveInput({
          source: values.source,
          responseFrom: values.responseFrom,
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
        {...register("responseFrom", { required: "Enter From" })}
        error={errors.from}
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

const Evidence = () => {
  const [evidences, setEvidences] = useState([
    {
      type: "picture",
      source: "nurse",
      description: "Picture of the person",
      evidence_date_time: "2022-05-12T08:05",
      files: "url.jpg",
    },
  ]);
  const [edit, setEdit] = useState(null);
  const [parameters, setParameters] = useState({
    evidenceTypes: [
      {
        label: "Picture",
        value: "picture",
      },
      {
        label: "Document",
        value: "document",
      },
    ],
    evidenceSources: [
      {
        label: "Nurse",
        value: "nurse",
      },
      {
        label: "Doctor",
        value: "doctor",
      },
    ],
  });

  const onSuccess = useCallback((newCat) => {
    setEvidences((prev) => {
      return prev.find((c) => c.id === newCat.id)
        ? prev.map((c) => (c.id === newCat.id ? newCat : c))
        : [...prev, newCat];
    });
    setEdit(null);
  }, []);

  const { get: getEvidences, loading } = useFetch(defaultEndpoints.evidences);
  const { remove: deleteEvidence } = useFetch(
    defaultEndpoints.evidences + "/{ID}"
  );

  useEffect(() => {
    getEvidences()
      .then((data) => {
        if (data?._embedded?.evidence) {
          setEvidences(data._embedded.evidence);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
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
            parameters={parameters}
          />
        </td>
      </tr>
      {evidences.map((evid, i) => (
        <tr key={i}>
          <td>
            {parameters.evidenceTypes.find((type) => type.value === evid.type)
              ?.label || evid.type}
          </td>
          <td>
            {parameters.evidenceSources.find(
              (source) => source.value === evid.source
            )?.label || evid.source}
          </td>
          <td>{evid.description}</td>
          <td>{evid.evidence_date_time}</td>
          <td>{evid.files}</td>
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
  departments,
  parameters,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ ...edit });

  const uploads = watch("files");

  const { post: postDepartment, put: updateDepartment, loading } = useFetch(
    defaultEndpoints.departments + `/${edit?.id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (
          departments?.some(
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
        (edit ? updateDepartment : postDepartment)(data)
          .then((data) => {
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
      <Combobox
        name="evidenceType"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Type" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceTypes}
        errors={errors.evidenceTypes}
      />
      <Combobox
        name="evidenceSource"
        watch={watch}
        register={register}
        formOptions={{ required: "Select Evidence Source" }}
        setValue={setValue}
        placeholder="Select"
        options={parameters?.evidenceSources}
        errors={errors.evidenceSource}
      />
      <Textarea
        {...register("evidenceDescription", {
          required: "Enter Evidence Description",
        })}
        errors={errors.evidenceDescription}
      />
      <Input
        type="datetime-local"
        {...register("evidence_date_time", {
          required: "Select Evidence Date & Time",
        })}
        errors={errors.evidence_date_time}
      />
      <FileInput
        multiple={true}
        prefill={uploads}
        onChange={(files) => {
          setValue("files", files);
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
