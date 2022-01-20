import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { BsPencilFill } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";
import { Box } from "../incidentReport";
import { TiTick } from "react-icons/ti";
import { IoIosClose } from "react-icons/io";
import { IoClose, IoReorderTwoOutline } from "react-icons/io5";
import { Input, Combobox, Table, TableActions, Toggle } from "../elements";
import { Modal, Prompt } from "../modal";
import { useForm } from "react-hook-form";
import s from "./masters.module.scss";

const periods = [
  { label: "MM", value: "MM" },
  { label: "MM/YY", value: "MM/YYYY" },
  { label: "YY", value: "YY" },
];
export default function IrCodeConfig() {
  const [codeConfig, setCodeConfig] = useState([]);
  const [edit, setEdit] = useState(null);
  const { handleSubmit, register, watch, setValue, reset } = useForm();
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/sequence`)
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded.sequence) {
          const sequence = data._embedded.sequence[0].sequence
            .split(",")
            .map((item) => +item);
          const fields = {
            staticCode: { label: "Static Code", order: 0 },
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
            staticCode: data._embedded.sequence[0].staticCode,
            sequence: data._embedded.sequence[0].sequence,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container}>
      <header>
        <h3>IR CODE CONFIGURATION</h3>
      </header>
      <div className={s.irCodeConfig}>
        <form
          onSubmit={handleSubmit((data) => {
            fetch(`${process.env.REACT_APP_HOST}/sequence/${data.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...data,
                sequence: codeConfig
                  .filter((c) => c.order > 0)
                  .map((i) => i.order)
                  .join(","),
              }),
            })
              .then((res) => res.json())
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
                } else {
                  console.log(data);
                }
              });
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
          >
            {codeConfig.map((c) => {
              return (
                <tr
                  key={c.field}
                  style={
                    c.field === "staticCode" ? { pointerEvents: "none" } : {}
                  }
                >
                  <td style={{ current: "grab" }}>
                    {c.field !== "staticCode" ? (
                      <IoReorderTwoOutline className={`handle ${s.handle}`} />
                    ) : null}
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
            <button className="btn primary w-100">Save</button>
          </section>
        </form>
      </div>
    </div>
  );
}
