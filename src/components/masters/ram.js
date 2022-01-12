import { useState, useEffect } from "react";
import { FaInfoCircle, FaCheck, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  Form,
  Input,
  Combobox,
  Table,
  TableActions,
  Toggle,
} from "../elements";
import { Modal, Prompt } from "../modal";
import { useForm } from "react-hook-form";
import s from "./masters.module.scss";

export default function RiskAssessments() {
  const [parameters, setParameters] = useState(null);
  const [risks, setRisks] = useState([]);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/9`).then((res) =>
        res.json()
      ),
      fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/2`).then((res) =>
        res.json()
      ),
      fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/3`).then((res) =>
        res.json()
      ),
      fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/4`).then((res) =>
        res.json()
      ),
      fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/5`).then((res) =>
        res.json()
      ),
    ])
      .then((masters) => {
        const _parameters = {};
        masters.forEach(({ id, name, twoFieldMasterDetails }) => {
          _parameters[id] = twoFieldMasterDetails
            .filter((i) => i.showToggle)
            .map(({ id, name }) => ({
              value: id,
              label: name,
            }));
        });
        setParameters(_parameters);
        return fetch(`${process.env.REACT_APP_HOST}/riskAssement`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.riskAssement) {
          setRisks(data._embedded.riskAssement);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container}>
      <header>
        <h3>RISK ASSESSMENT MASTER</h3>
      </header>
      <div className={s.ram}>
        <Table
          columns={[
            { label: "Likelihood" },
            { label: "Severity" },
            { label: "Risk Score" },
            { label: "Risk Status" },
            { label: "Color" },
            { label: "Active/Inactive" },
            { label: "Action" },
          ]}
        >
          <tr>
            <td className={s.inlineForm}>
              {edit ? (
                <RiskAssessmentForm
                  parameters={parameters}
                  key="edit"
                  edit={edit}
                  onSuccess={(newRisk) => {
                    setRisks((prev) => {
                      return prev.find((c) => c.id === newRisk.id)
                        ? prev.map((c) => (c.id === newRisk.id ? newRisk : c))
                        : [...prev, newRisk];
                    });
                    setEdit(null);
                  }}
                  clearForm={() => {
                    setEdit(null);
                  }}
                />
              ) : (
                <RiskAssessmentForm
                  parameters={parameters}
                  key="add"
                  onSuccess={(newRisk) => {
                    setRisks((prev) => {
                      return prev.find((c) => c.id === newRisk.id)
                        ? prev.map((c) => (c.id === newRisk.id ? newRisk : c))
                        : [...prev, newRisk];
                    });
                    setEdit(null);
                  }}
                />
              )}
            </td>
          </tr>
          {risks.map((risk, i) => (
            <tr key={i}>
              <td>
                {parameters?.["9"].find(
                  (item) => item.value === risk.likelihood
                )?.label || risk.likelihood}
              </td>
              <td>
                {parameters?.["2"].find((item) => item.value === risk.serverity)
                  ?.label || risk.serverity}
              </td>
              <td>
                {parameters?.["3"].find((item) => item.value === risk.riskscore)
                  ?.label || risk.riskscore}
              </td>
              <td>
                {parameters?.["4"].find(
                  (item) => item.value === risk.riskstatus
                )?.label || risk.riskstatus}
              </td>
              <td>
                {parameters?.["5"].find((item) => item.value === +risk.color)
                  ?.label || risk.color}
              </td>
              <td>
                <Toggle readOnly={true} defaultValue={risk.status} />
              </td>
              <TableActions
                actions={[
                  {
                    icon: <BsPencilFill />,
                    label: "Edit",
                    callBack: () => setEdit(risk),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this risk assessment?`,
                        callback: () => {
                          fetch(
                            `${process.env.REACT_APP_HOST}/riskAssement/${risk.id}`,
                            { method: "DELETE" }
                          ).then((res) => {
                            if (res.status === 204) {
                              setRisks((prev) =>
                                prev.filter((r) => r.id !== risk.id)
                              );
                            } else if (res.status === 409) {
                              Prompt({
                                type: "error",
                                message: "Could not remove risk assessment.",
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
      {
        //   <div className={s.btns}>
        //   <button className="btn secondary w-100">Clear</button>
        //   <button className="btn w-100">Save</button>
        // </div>
      }
    </div>
  );
}
const RiskAssessmentForm = ({ edit, onSuccess, parameters, clearForm }) => {
  const { handleSubmit, reset, watch, setValue, register } = useForm({
    ...edit,
  });
  useEffect(() => {
    reset({ status: true, ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        fetch(
          `${process.env.REACT_APP_HOST}/riskAssement${
            edit ? `/${edit.id}` : ""
          }`,
          {
            method: edit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.id) {
              onSuccess(data);
              reset();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })}
    >
      <Combobox
        name="likelihood"
        watch={watch}
        register={register}
        setValue={setValue}
        required={true}
        placeholder="Select"
        options={parameters?.["9"]}
      />
      <Combobox
        name="serverity"
        watch={watch}
        register={register}
        setValue={setValue}
        required={true}
        placeholder="Select"
        options={parameters?.["2"]}
      />
      <Combobox
        name="riskscore"
        watch={watch}
        register={register}
        setValue={setValue}
        required={true}
        placeholder="Select"
        options={parameters?.["3"]}
      />
      <Combobox
        name="riskstatus"
        watch={watch}
        register={register}
        setValue={setValue}
        required={true}
        placeholder="Select"
        options={parameters?.["4"]}
      />
      <Combobox
        name="color"
        watch={watch}
        register={register}
        setValue={setValue}
        required={true}
        placeholder="Select"
        options={parameters?.["5"]}
      />
      <Toggle name="status" watch={watch} register={register} required={true} />
      <div className={s.btns}>
        <button className="btn secondary">
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
