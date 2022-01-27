import { useState, useEffect } from "react";
import { FaInfoCircle, FaPlus, FaCheck, FaRegTrashAlt } from "react-icons/fa";
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

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [locationTypes, setLocationTypes] = useState(null);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_HOST}/twoFieldMaster/6`)
      .then((res) => res.json())
      .then((data) => {
        if (data.twoFieldMasterDetails) {
          setLocationTypes(
            data.twoFieldMasterDetails
              .filter((i) => i.showToggle)
              .map(({ id, name }) => ({
                value: id,
                label: name,
              }))
          );
          return fetch(`${process.env.REACT_APP_HOST}/location`);
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (data._embedded?.location) {
          setLocations(data._embedded.location);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={s.container} data-testid="locations">
      <header>
        <h3>LOCATION MASTER</h3>
      </header>
      <div className={s.locations}>
        <Table
          columns={[
            { label: "Location Name" },
            { label: "Location Type" },
            { label: "Status" },
            { label: "Action" },
          ]}
          actions={true}
        >
          <tr>
            <td className={s.inlineForm}>
              <LocationForm
                {...(edit && { edit })}
                key={edit ? "edit" : "add"}
                onSuccess={(newLoc) => {
                  setLocations((prev) => {
                    return prev.find((c) => c.id === newLoc.id)
                      ? prev.map((c) => (c.id === newLoc.id ? newLoc : c))
                      : [...prev, newLoc];
                  });
                  setEdit(null);
                }}
                clearForm={() => {
                  setEdit(null);
                }}
                locations={locations}
                locationTypes={locationTypes}
              />
            </td>
          </tr>
          {locations.map((loc, i) => (
            <tr key={i}>
              <td>{loc.name}</td>
              <td>
                {locationTypes.find((l) => l.value === loc.locationType)
                  ?.label || loc.locationType}
              </td>
              <td>
                <Toggle readOnly={true} defaultValue={loc.status} />
              </td>
              <TableActions
                actions={[
                  {
                    icon: <BsPencilFill />,
                    label: "Edit",
                    callBack: () => setEdit(loc),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove ${loc.name}?`,
                        callback: () => {
                          fetch(
                            `${process.env.REACT_APP_HOST}/location/${loc.id}`,
                            { method: "DELETE" }
                          ).then((res) => {
                            if (res.status === 204) {
                              setLocations((prev) =>
                                prev.filter((c) => c.id !== loc.id)
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
    </div>
  );
}
const LocationForm = ({
  edit,
  onChange,
  locations,
  clearForm,
  locationTypes,
  onSuccess,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    reset({ status: true, ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        const url = `${process.env.REACT_APP_HOST}/location${
          edit ? `/${edit.id}` : ""
        }`;
        if (
          !edit &&
          locations?.some(
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
      <Combobox
        name="locationType"
        required={true}
        placeholder="Enter"
        register={register}
        setValue={setValue}
        watch={watch}
        options={locationTypes}
      />
      <Toggle name="status" register={register} watch={watch} />
      <div className={s.btns}>
        <button className="btn secondary" type="submit" disabled={loading}>
          {edit ? (
            <FaCheck />
          ) : (
            <>
              <FaPlus />
              Add
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
