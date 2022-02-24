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
  SearchField,
  Combobox,
  Table,
  TableActions,
  Toggle,
  Select,
} from "../elements";

import { Modal, Prompt } from "../modal";
import { useForm, Controller } from "react-hook-form";
import defaultEndpoints from "../../config/endpoints";
import s from "./masters.module.scss";

export default function Location() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    setLoading(true);
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
        setLoading(false);
        if (data._embedded?.location) {
          setLocations(data._embedded.location);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);
  return (
    <div className={s.container} data-testid="locations">
      <header>
        <h3>LOCATION MASTER</h3>
      </header>
      <div className={s.locations}>
        <Table
          loading={loading}
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
                setEdit={setEdit}
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
  setEdit,
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
    clearErrors,
    control,
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
          locations?.some(
            (item) =>
              item.name?.trim().toLowerCase() ===
                data.name?.trim().toLowerCase() && item.id !== data.id
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
          });
      })}
    >
      <SearchField
        url={defaultEndpoints.locations}
        processData={(data, value) => {
          if (data?._embedded.location) {
            return data._embedded.location
              .filter((loc) => new RegExp(value, "i").test(loc.name))
              .map((loc) => ({ value: loc.id, label: loc.name, data: loc }));
          }
          return [];
        }}
        register={register}
        name="name"
        formOptions={{
          required: "Please enter Location Name",
        }}
        renderListItem={(loc) => <>{loc.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(item) => {
          if (typeof item === "string") {
            setValue("name", item);
          } else {
            setEdit(item);
          }
        }}
        error={errors.name}
      />
      <Select
        options={locationTypes}
        name="locationType"
        control={control}
        formOptions={{ required: "Please select Location Type" }}
      />
      <Toggle
        name="status"
        register={register}
        watch={watch}
        setValue={setValue}
      />
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
