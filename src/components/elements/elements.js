import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  forwardRef,
} from "react";
import { IoIosClose } from "react-icons/io";
import {
  FaUpload,
  FaSortDown,
  FaSearch,
  FaCircleNotch,
  FaRegTrashAlt,
} from "react-icons/fa";
import { BsFillGearFill, BsFillExclamationTriangleFill } from "react-icons/bs";
import { GoCalendar } from "react-icons/go";
import { Link, useLocation, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal } from "../modal";
import Sortable from "sortablejs";
import s from "./elements.module.scss";
import countries from "../../countries";
import { useHisFetch } from "../../hooks";
import { phone } from "phone";

import { Combobox } from "./combobox";

export const Input = forwardRef(
  ({ className, label, icon, error, type, ...rest }, ref) => {
    const _id = useRef(Math.random().toString(32).substr(-8));
    return (
      <section
        className={`${s.input} ${className || ""} ${error ? s.err : ""}`}
      >
        {label && (
          <label>
            {label}
            {rest.required && "*"}
          </label>
        )}
        <div className={s.wrapper}>
          <span className={s.field}>
            <input
              ref={ref}
              type={type || "text"}
              id={rest.id || _id.current}
              {...rest}
              placeholder={rest.placeholder || "Enter"}
            />
            {["date", "datetime-local"].includes(type) && (
              <label
                htmlFor={rest.id || _id.current}
                className={s.calenderIcon}
              >
                <GoCalendar />
              </label>
            )}
            {
              //   error && (
              //   <span className={s.errIcon}>
              //     <BsFillExclamationTriangleFill />
              //   </span>
              // )
            }
            {icon && icon}
          </span>
          {error && <span className={s.errMsg}>{error.message}</span>}
        </div>
      </section>
    );
  }
);
export const SearchField = ({
  url,
  data: defaultData,
  processData,
  renderListItem,
  label,
  onChange,
  watch,
  name,
  setValue,
  register,
  formOptions,
  error,
  renderField,
  clearErrors,
  ...rest
}) => {
  const [data, setData] = useState([]);
  const value = watch(name);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState({});
  const clickHandlerAdded = useState(false);
  const container = useRef();

  const { get: hisFetch } = useHisFetch(url);

  useLayoutEffect(() => {
    const { width, height, x, y } = container.current.getBoundingClientRect();
    const top = window.innerHeight - y;
    setStyle({
      position: "absolute",
      left: x,
      top: Math.max(
        Math.min(
          y + height,
          window.innerHeight - Math.min(35 * (data.length || 0) + 8, 320)
          // window.innerHeight - (35 * (options?.length || 0) + 8)
        ),
        8
      ),
      width: width,
      maxHeight: Math.min(window.innerHeight - 16, 300),
    });
  }, [showResult, data]);
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.path && !e.path.includes(container.current)) {
        setShowResult(false);
      }
    };
    if (!clickHandlerAdded.current) {
      document.addEventListener("click", clickHandler);
      return () => {
        document.removeEventListener("click", clickHandler);
      };
      clickHandlerAdded.current = true;
    }
  }, [showResult]);
  useEffect(() => {
    if (value) {
      if (url) {
        setLoading(true);
        hisFetch(url)
          .then((rawData) => {
            setLoading(false);
            const data = processData(rawData, value);
            setData(data);
          })
          .catch((err) => {
            setLoading(false);
            console.log(err);
          });
      } else if (defaultData) {
        setData(
          defaultData.filter((item) => new RegExp(value, "ig").test(item.label))
        );
      }
    }
  }, [value]);
  return (
    <section ref={container}>
      {renderField ? (
        renderField({
          register,
          watch,
          setValue,
          name,
          formOptions,
          error,
          clearErrors,
          setShowResult,
        })
      ) : (
        <Input
          label={label}
          onFocus={(e) => setShowResult(true)}
          {...register(name, formOptions)}
          autoComplete="off"
          onBlur={(e) => {
            if (!value) {
              setData([]);
            }
          }}
          error={error}
          icon={<FaSearch />}
        />
      )}
      <Modal
        open={showResult && data.length > 0}
        className={s.searchFieldModal}
        backdropClass={s.searchFieldModalBackdrop}
        style={style}
        onBackdropClick={() => setShowResult(false)}
        clickThroughBackdrop={true}
      >
        <ul className={s.options}>
          {data.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setValue(name, item.label);
                onChange(item.data || item);
              }}
            >
              {renderListItem(item)}
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
};
export const FileInput = ({ label, required, multiple, onChange, prefill }) => {
  const id = useRef(Math.random().toString(36).substr(4));
  const prefillLoaded = useRef(false);
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  useEffect(() => {
    if (prefill?.length !== files.length) {
      setFiles(
        prefill.map((file) =>
          typeof file === "string" ? { name: file, uri: file } : file
        )
      );
    }
  }, [prefill]);
  useEffect(() => {
    if (prefill?.length !== files.length) {
      onChange?.(files);
    }
  }, [files]);
  return (
    <section data-testid="fileInput" className={s.fileInput}>
      <div className={s.label}>
        <label>
          {label} {required && "*"}
        </label>
        <span className={s.fileCount} onClick={() => setShowFiles(true)}>
          {files.length} files selected
        </span>
      </div>
      <input
        id={id.current}
        style={{ display: "none" }}
        type="file"
        multiple={multiple}
        required={required}
        onChange={(e) => {
          if (e.target.files.length > 0) {
            setFiles((prev) => [
              ...prev,
              ...[...e.target.files].filter(
                (item) => !files.some((file) => file.name === item.name)
              ),
            ]);
            // e.target.files = {};
          }
        }}
      />
      <div className={s.inputField}>
        <label htmlFor={id.current}>
          <span className={s.fileNames}>
            {files.reduce((p, a) => {
              return p + a.name + ", ";
            }, "") || "Item select"}
          </span>
          <span className={s.btn}>
            <FaUpload />
          </span>
        </label>
      </div>
      <Modal
        open={showFiles}
        className={s.fileInputModal}
        setOpen={setShowFiles}
        head={true}
        label="Files"
      >
        <div className={s.container}>
          <Table columns={[{ label: "File" }, { label: "Action" }]}>
            {files.map((file, i) => (
              <tr key={i}>
                <td>{file.name}</td>
                <TableActions
                  actions={[
                    {
                      icon: <FaRegTrashAlt />,
                      label: "Remove",
                      callBack: () => {
                        setFiles((prev) =>
                          prev.filter((f) =>
                            typeof f === "string"
                              ? f !== file
                              : f.name !== file.name
                          )
                        );
                      },
                    },
                  ]}
                />
              </tr>
            ))}
          </Table>
        </div>
      </Modal>
    </section>
  );
};
export const Textarea = forwardRef(
  ({ className, label, error, ...rest }, ref) => {
    return (
      <section
        className={`${s.input} ${s.textarea} ${className || ""} ${
          error ? s.err : ""
        }`}
      >
        {label && (
          <label>
            {label} {rest.required && "*"}
          </label>
        )}
        <span className={s.field}>
          <textarea ref={ref} {...rest} />
          {error && (
            <span
              className={s.errIcon}
              style={!label ? { transform: "translateY(-6px)" } : {}}
            >
              <BsFillExclamationTriangleFill />
            </span>
          )}
          {error && <span className={s.errMsg}>{error.message}</span>}
        </span>
      </section>
    );
  }
);
export const Radio = ({
  register = () => {},
  formOptions,
  name,
  options,
  onChange,
  error,
}) => {
  return (
    <section
      className={`${s.radio} ${error ? s.err : ""}`}
      data-testid="radioInput"
    >
      {options.map(({ label, value: v, hint, disabled }) => (
        <label key={v} htmlFor={v} className={disabled ? s.disabled : ""}>
          <input
            {...register(name, { ...formOptions })}
            type="radio"
            name={name}
            id={v}
            className="label"
            value={v}
          />
          {label}
          {hint && <span className={s.hint}>{hint}</span>}
        </label>
      ))}
      {error && <span className={s.errMsg}>{error.message}</span>}
    </section>
  );
};
export const CustomRadio = ({
  register = () => {},
  name,
  watch,
  label,
  options,
  setValue,
  multiple,
  onChange,
  required,
}) => {
  const [selected, setSelected] = useState(watch?.(name) || []);
  useEffect(() => {
    setValue?.(name, selected);
  }, [selected]);
  return (
    <section className={s.customRadio} data-testid="customRadioInput">
      {label && (
        <label>
          {label} {required && "*"}
        </label>
      )}
      <input {...register(name)} required={required} />
      <div className={s.options}>
        {options.map(({ label, value: v, disabled }) => (
          <span
            onClick={() => {
              setSelected((prev) => {
                const _selected = selected.find((item) => item === v);
                if (_selected) {
                  return prev.filter((item) => item !== v);
                }
                if (multiple) {
                  return [...prev.filter((item) => item !== v), v];
                } else {
                  return [v];
                }
              });
            }}
            key={v}
            className={`${s.option} ${
              watch?.(name).includes(v) ? s.selected : ""
            } ${disabled ? s.disabled : ""}`}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};
export const SwitchInput = ({
  register = () => {},
  name,
  setValue = () => {},
  watch = () => {},
  label,
  readOnly,
  defaultValue,
  onChange,
  onLabel,
  offLabel,
  required,
}) => {
  const value = watch(name);
  return (
    <div data-testid="switchInput" className={s.switchInput}>
      <label>
        {label} {required && "*"}
      </label>
      <input
        type="checkbox"
        {...register(name)}
        style={{ display: "none" }}
        name={name}
      />
      <div
        className={s.btns}
        tabIndex={0}
        onKeyDown={(e) => {
          if ([32, 13, 39, 37].includes(e.keyCode)) {
            e.preventDefault();
            if ([32, 13].includes(e.keyCode)) {
              setValue(name, !value);
            }
            if (e.keyCode === 39) {
              setValue(name, false);
            }
            if (e.keyCode === 37) {
              setValue(name, true);
            }
          }
        }}
      >
        <span
          className={`${value ? s.active : ""} ${s.on}`}
          onClick={() => setValue(name, true)}
        >
          {onLabel || "Yes"}
        </span>
        <span
          className={`${!value ? s.active : ""} ${s.off}`}
          onClick={() => setValue(name, false)}
        >
          {offLabel || "No"}
        </span>
      </div>
    </div>
  );
};
export const Toggle = ({
  register = () => {},
  watch,
  defaultValue,
  readOnly,
  name,
  onChange,
  setValue = () => {},
}) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  const value = watch?.(name);
  if (readOnly) {
    return (
      <section
        className={`${s.toggle} ${defaultValue ? s.on : ""} ${
          readOnly ? s.readOnly : ""
        }`}
        title="Read only"
      >
        <input
          type="checkbox"
          style={{ display: "none" }}
          checked={defaultValue}
          onChange={(e) => {}}
          id={id.current}
          readOnly={true}
        />
        <label className={s.ball} htmlFor={id.current} />
      </section>
    );
  }
  return (
    <section
      data-testid="toggleInput"
      className={`${s.toggle} ${value ? s.on : ""}`}
      onClick={(e) => {
        e.target.querySelector("label")?.click();
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if ([32, 13, 39, 37].includes(e.keyCode)) {
          e.preventDefault();
          if ([32, 13].includes(e.keyCode)) {
            setValue(name, !value);
          }
          if (e.keyCode === 39) {
            setValue(name, false);
          }
          if (e.keyCode === 37) {
            setValue(name, true);
          }
        }
      }}
    >
      <input
        type="checkbox"
        {...register(name)}
        style={{ display: "none" }}
        name={name}
        id={id.current}
      />
      <label className={s.ball} htmlFor={id.current} />
    </section>
  );
};

export const MobileNumberInput = ({
  label,
  className,
  name,
  register,
  required,
  error,
  clearErrors,
  setValue,
  watch,
  icon,
  ...rest
}) => {
  const { register: cRegister, watch: cWatch, setValue: cSetValue } = useForm();
  const _id = useRef(Math.random().toString(32).substr(-8));
  const [country, setCountry] = useState(null);
  const phoneNumber = watch(name);
  useEffect(() => {
    const preferredCountry = countries.find((c) => c.iso2 === "IN");
    cSetValue("country", preferredCountry.code);
    setCountry({
      value: preferredCountry.code,
      label: preferredCountry.name,
      iso2: preferredCountry.iso2,
    });
  }, []);
  useEffect(() => {
    const _number = phoneNumber?.trim().startsWith("+") && phone(phoneNumber);
    if (_number?.isValid) {
      const country = countries.find((c) => c.iso2 === _number.countryIso2);
      cSetValue("country", country.code);
      setCountry({
        value: country.code,
        label: country.name,
        iso2: country.iso2,
      });
    } else if (country) {
      const _number = phone(phoneNumber, { country: country.iso2 });
      if (_number.isValid) {
        setValue(name, _number.phoneNumber);
      }
    } else {
      const _number = phone(phoneNumber);
      if (_number.isValid) {
        setValue(name, _number.phoneNumber);
      }
    }
  }, [phoneNumber]);
  return (
    <section
      data-testid="mobileNumberInput"
      className={`${s.input} ${s.mobileNumberInput} ${className || ""} ${
        error ? s.err : ""
      }`}
    >
      {label && (
        <label>
          {label} {required && "*"}
        </label>
      )}
      <div className={s.wrapper}>
        <span className={s.field}>
          <div className={s.country}>
            <Combobox
              className={s.countryFlags}
              options={countries.map((c) => ({
                value: c.code,
                label: c.name,
                iso2: c.iso2,
              }))}
              item={(option) => {
                return (
                  <>
                    <img
                      src={`https://flagcdn.com/w20/${option.iso2.toLowerCase()}.webp`}
                    />
                    <p style={{ marginLeft: "6px", display: "inline" }}>
                      {option.label}
                    </p>
                  </>
                );
              }}
              renderValue={(selected) => {
                return selected ? (
                  <img
                    src={`https://flagcdn.com/w20/${countries
                      .find((c) => c.code === selected)
                      ?.iso2.toLowerCase()}.webp`}
                  />
                ) : (
                  "No"
                );
              }}
              register={cRegister}
              name="country"
              watch={cWatch}
              setValue={cSetValue}
              onChange={(option) => {
                setCountry(option);
                clearErrors?.(name);
                const _number =
                  phoneNumber && phone(phoneNumber, { country: option.iso2 });
                if (_number?.isValid) {
                  setValue(name, _number.phoneNumber);
                }
              }}
            />
          </div>
          <input
            type={"text"}
            {...register(name, {
              validate: (value) => {
                if (value) {
                  return (
                    phone(value, { country: country.iso2 }).isValid ||
                    "Phone Number is not valid"
                  );
                }
                if (required) {
                  return "Please provide a valid Phone Number";
                }
                return true;
              },
            })}
            id={rest.id || _id.current}
            placeholder={"#"}
            maxLength="15"
            {...rest}
          />
          {error && (
            <span className={s.errIcon}>
              <BsFillExclamationTriangleFill />
            </span>
          )}
          {icon && icon}
        </span>
        {error && <span className={s.errMsg}>{error.message}</span>}
      </div>
    </section>
  );
};
export const Checkbox = forwardRef(({ label, readOnly, ...rest }, ref) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  return (
    <section
      className={s.checkbox}
      style={readOnly ? { pointerEvents: "none" } : {}}
      data-testid="checkbox-input"
    >
      <input ref={ref} id={id.current} type="checkbox" {...rest} />
      {label && <label htmlFor={id.current}>{label}</label>}
    </section>
  );
});

export const Tabs = ({ tabs, className }) => {
  const location = useLocation();
  return (
    <div className={`${s.tabs} ${s[className]}`} data-testid="tabs">
      {tabs.map(({ path, label, search }) => (
        <Link
          key={path}
          to={{
            pathname: path,
            ...(search && {
              search: `?${createSearchParams(search)}`,
            }),
          }}
          className={location?.pathname.endsWith(path) ? s.active : ""}
        >
          {label}
        </Link>
      ))}
      <span className={s.fill} />
    </div>
  );
};
export const Table = ({
  columns,
  className,
  children,
  sortable,
  actions,
  loading,
}) => {
  const tbody = useRef();
  const table = useRef();
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (sortable) {
      Sortable.create(tbody.current, {
        animation: 250,
        easing: "ease-in-out",
        removeCloneOnHide: true,
        ...sortable,
      });
    }
  }, []);
  return (
    <table
      ref={table}
      className={`${s.table} ${className || ""} ${actions ? s.actions : ""}`}
      cellPadding={0}
      cellSpacing={0}
    >
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody ref={tbody}>
        {loading ? (
          <tr className={s.loading}>
            <td>
              <span className={s.icon}>
                <FaCircleNotch />
              </span>
              Loading...
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  );
};
export const TableActions = ({ actions }) => {
  const btn = useRef();
  const popupContainerRef = useRef();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  useLayoutEffect(() => {
    if (actions.length > 3) {
      const { width, height, x, y } = btn.current.getBoundingClientRect();
      const top = window.innerHeight - y;
      setStyle({
        position: "absolute",
        right: window.innerWidth - (x + width),
        top: Math.max(
          Math.min(
            y + height,
            window.innerHeight -
              ((popupContainerRef.current?.querySelector("button")
                .clientHeight || 35) *
                actions.length +
                8)
          ),
          8
        ),
        // width: width,
        // height: 28 * actions.length,
        maxHeight: window.innerHeight - 16,
      });
    }
  }, [open]);
  return actions.length < 4 ? (
    <td className={s.tableActions} data-testid="tableActions">
      {actions.map((action) => (
        <button
          key={action.label}
          title={action.label}
          className="clear"
          onClick={action.callBack}
        >
          {action.icon}
        </button>
      ))}
    </td>
  ) : (
    <td className={s.tableActions}>
      <button
        className={s.btn}
        ref={btn}
        data-testid="gear-btn"
        onClick={() => setOpen(true)}
      >
        <BsFillGearFill className={s.gear} /> <FaSortDown className={s.sort} />
      </button>
      <Modal
        style={style}
        className={s.actionModal}
        open={open}
        onBackdropClick={() => setOpen(false)}
        backdropClass={s.actionBackdrop}
      >
        <div ref={popupContainerRef}>
          {actions.map((action) => (
            <button
              key={action.label}
              title={action.label}
              className="clear"
              onClick={() => {
                setOpen(false);
                action.callBack();
              }}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </Modal>
    </td>
  );
};

export const Chip = ({ label, remove }) => {
  return (
    <span className={s.chip}>
      {label}{" "}
      <button
        type="button"
        onClick={() => {
          remove?.();
        }}
        className="clear"
      >
        <IoIosClose />
      </button>
    </span>
  );
};
