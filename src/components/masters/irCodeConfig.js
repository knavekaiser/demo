import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import { IoClose, IoReorderThreeOutline } from "react-icons/io5";
import { Input, Combobox, Table, TableActions, Toggle } from "../elements";
import { Modal, Prompt } from "../modal";
import { useForm } from "react-hook-form";
import { endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import s from "./masters.module.scss";

const _periods = [
  { label: "MM", value: "MM" },
  { label: "MM/YYYY", value: "MM/YYYY" },
  { label: "YYYY", value: "YYYY" },
];
export default function IrCodeConfig() {
  const [periods, setPeriods] = useState();
  const [codeConfig, setCodeConfig] = useState([]);
  const [edit, setEdit] = useState(null);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    setValues,
    reset,
  } = useForm();
  const reseed = watch("reseed");
  const period = watch("period");

  const { get: getSequence, loading } = useFetch(defaultEndpoints.sequence);
  const { put: updateSequence, loading: updating } = useFetch(
    defaultEndpoints.sequence + "/{ID}",
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  useEffect(() => {
    if (reseed === "M" && period === "YYYY") {
      setValue("period", "MM");
    }
    if (reseed === "M") {
      setPeriods([
        { label: "None", value: "" },
        { label: "MM", value: "MM" },
        { label: "MM/YYYY", value: "MM/YYYY" },
      ]);
    } else {
      setPeriods([
        { label: "None", value: "" },
        { label: "MM", value: "MM" },
        { label: "MM/YYYY", value: "MM/YYYY" },
        { label: "YYYY", value: "YYYY" },
      ]);
    }
  }, [reseed]);
  useEffect(() => {
    getSequence()
      .then((data) => {
        if (data._embedded.sequence) {
          const sequence = data._embedded.sequence[0].sequence
            .split(",")
            .map((item) => +item);
          const fields = {
            reseed: { label: "Reseed", order: 0 },
            prefix: { label: "Prefix", order: 1 },
            period: { label: "Period", order: 2 },
            irCode: { label: "IR Code", order: 3 },
            suffix: { label: "Suffix", order: 4 },
          };
          const config = Object.entries(data._embedded.sequence[0])
            .map(([key, value]) => ({
              field: key,
              value,
              ...fields[key],
              currentOrder: sequence.indexOf(fields[key]?.order),
            }))
            .filter((item) => item.order > -1)
            .sort((a, b) => (a.currentOrder > b.currentOrder ? 1 : -1));
          setCodeConfig(config);
          reset({
            id: data._embedded.sequence[0].id,
            irCode: data._embedded.sequence[0].irCode,
            period: data._embedded.sequence[0].period,
            prefix: data._embedded.sequence[0].prefix,
            suffix: data._embedded.sequence[0].suffix,
            reseed: data._embedded.sequence[0].reseed,
            sequence: data._embedded.sequence[0].sequence,
          });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={s.container} data-testid="irCodeConfig">
      <header>
        <h3>IR CODE CONFIGURATION</h3>
      </header>
      <div className={s.irCodeConfig}>
        <form
          onSubmit={handleSubmit((data) => {
            updateSequence(
              {
                ...data,
                sequence: codeConfig
                  .filter((c) => c.order > 0)
                  .map((i) => i.order)
                  .join(","),
              },
              { params: { "{ID}": data.id } }
            )
              .then((data) => {
                if (data.id) {
                  reset({
                    id: data.id,
                    irCode: data.irCode,
                    period: data.period,
                    prefix: data.prefix,
                    suffix: data.suffix,
                    staticCode: data.staticCode,
                    sequence: data.sequence,
                  });
                  Prompt({
                    type: "information",
                    message: "IR Configuration updated.",
                  });
                }
              })
              .catch((err) => Prompt({ type: "error", message: err.message }));
          })}
        >
          <Table
            columns={[
              { label: "Order" },
              { label: "Label" },
              { label: "Value" },
            ]}
            sortable={{
              animation: 250,
              easing: "ease-in-out",
              handle: ".handle",
              removeCloneOnHide: true,
              onEnd: (e) => {
                const itemEl = e.item;
                const { oldIndex, newIndex } = e;
                if (oldIndex !== newIndex) {
                  setCodeConfig((prev) => {
                    const videos = [
                      ...prev.filter((item, i) => i !== oldIndex),
                    ];
                    videos.splice(newIndex, 0, prev[oldIndex]);
                    return videos;
                  });
                }
              },
            }}
            loading={loading}
          >
            {codeConfig.map((c) => {
              if (c.field === "reseed") {
                return (
                  <tr key={c.field} style={{ pointerEvents: "none" }}>
                    <td style={{ current: "grab" }} />
                    <td>{c.label}</td>
                    <td style={{ pointerEvents: "auto" }}>
                      <Combobox
                        options={[
                          { label: "Monthly", value: "M" },
                          { label: "January", value: "01" },
                          { label: "February", value: "02" },
                          { label: "March", value: "03" },
                          { label: "April", value: "04" },
                          { label: "May", value: "05" },
                          { label: "June", value: "06" },
                          { label: "July", value: "07" },
                          { label: "August", value: "08" },
                          { label: "September", value: "09" },
                          { label: "October", value: "10" },
                          { label: "November", value: "11" },
                          { label: "December", value: "12" },
                        ]}
                        formOptions={{
                          required: "Select reseed",
                        }}
                        name="reseed"
                        register={register}
                        setValue={setValue}
                        watch={watch}
                      />
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={c.field}>
                  <td style={{ current: "grab" }}>
                    <IoReorderThreeOutline className={`handle ${s.handle}`} />
                  </td>
                  <td>{c.label}</td>
                  <td>
                    {c.field === "period" ? (
                      <Combobox
                        options={periods}
                        name="period"
                        register={register}
                        setValue={setValue}
                        watch={watch}
                      />
                    ) : (
                      <Input
                        {...register(c.field, {
                          required: `${c.label} is reuqried`,
                        })}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
          <section className={s.btns}>
            <button className="btn primary w-100" disabled={updating}>
              Save
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}
