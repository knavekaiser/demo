import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  forwardRef,
} from "react";
import { IoIosClose } from "react-icons/io";
import { FaUpload, FaSortDown } from "react-icons/fa";
import { BsFillGearFill, BsFillExclamationTriangleFill } from "react-icons/bs";
import { GoCalendar } from "react-icons/go";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal } from "./modal";
import Sortable from "sortablejs";
import s from "./elements.module.scss";
import countries from "../countries";
import { phone } from "phone";

export const Input = forwardRef(
  ({ className, label, icon, error, type, ...rest }, ref) => {
    const _id = useRef(Math.random().toString(32).substr(-8));
    return (
      <section
        className={`${s.input} ${className || ""} ${error ? s.err : ""}`}
      >
        {label && <label>{label}</label>}
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
          </span>
          {error && (
            <span className={s.errIcon}>
              <BsFillExclamationTriangleFill />
            </span>
          )}
          {error && <span className={s.errMsg}>{error.message}</span>}
          {icon && icon}
        </div>
      </section>
    );
  }
);
export const FileInput = ({ label, required, multiple, onChange, prefill }) => {
  const id = useRef(Math.random().toString(36).substr(4));
  const prefillLoaded = useRef(false);
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (prefill?.length && !prefillLoaded.current) {
      setFiles(prefill.map((file) => ({ name: file.uploadFilePath })));
      prefillLoaded.current = true;
    }
  }, [prefill]);
  useEffect(() => {
    onChange?.(files);
  }, [files]);
  return (
    <section data-testid="fileInput" className={s.fileInput}>
      <div className={s.label}>
        <label>{label}</label>
        <span className={s.fileCount}>{files.length} files selected</span>
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
    </section>
  );
};
export const Textarea = forwardRef(
  ({ className, label, error, ...rest }, ref) => {
    return (
      <section
        className={`${s.input} ${s.textinput} ${className || ""} ${
          error ? s.err : ""
        }`}
      >
        {label && <label>{label}</label>}
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
      {label && <label>{label}</label>}
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
}) => {
  const watching = watch(name);
  return (
    <div data-testid="switchInput" className={s.switchInput}>
      <label>{label}</label>
      <input
        type="checkbox"
        {...register(name)}
        style={{ display: "none" }}
        name={name}
      />
      <div className={s.btns}>
        <span
          className={`${watching ? s.active : ""} ${s.on}`}
          onClick={() => setValue(name, true)}
        >
          {onLabel || "Yes"}
        </span>
        <span
          className={`${!watching ? s.active : ""} ${s.off}`}
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
}) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  const watching = watch?.([name]);
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
      className={`${s.toggle} ${watching && watching[0] ? s.on : ""}`}
      onClick={(e) => {
        e.target.querySelector("label")?.click();
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
export const Combobox = ({
  register = () => {},
  formOptions,
  label,
  name,
  watch,
  setValue = () => {},
  placeholder,
  options,
  multiple,
  className,
  onChange,
  error,
  clearErrors,
  item,
  renderValue,
}) => {
  const container = useRef();
  const selected = watch?.(name);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  useLayoutEffect(() => {
    const { width, height, x, y } = container.current.getBoundingClientRect();
    const top = window.innerHeight - y;
    setStyle({
      position: "absolute",
      left: x,
      top: Math.max(
        Math.min(
          y + height,
          window.innerHeight - Math.min(35 * (options?.length || 0) + 8, 320)
          // window.innerHeight - (35 * (options?.length || 0) + 8)
        ),
        8
      ),
      width: width,
      maxHeight: Math.min(window.innerHeight - 16, 300),
    });
  }, [open, options]);
  return (
    <section
      data-testid="combobox-container"
      className={`${s.combobox} ${className || ""} ${open ? s.open : ""} ${
        !(Array.isArray(options) && options.length) ? s.noOptions : ""
      } ${error ? s.err : ""}`}
    >
      {label && <label data-testid="combobox-label">{label}</label>}
      <div
        className={s.field}
        onClick={() => {
          if (Array.isArray(options) && options.length) {
            setOpen(true);
          }
        }}
        ref={container}
      >
        <p className={`${s.displayValue} ${!selected ? s.placeholder : ""}`}>
          {renderValue ? (
            renderValue(selected)
          ) : (
            <>
              {!(Array.isArray(options) && options.length) &&
                "No options provided"}
              {selected &&
                ["string", "number"].includes(typeof selected) &&
                options?.find(({ value }) => value === selected)?.label}
              {Array.isArray(selected) &&
                (selected.length > 3
                  ? `${selected.length} items selected`
                  : selected.reduce(
                      (p, a, i, arr) =>
                        `${p} ${
                          options.find(({ value }) => value === a)?.label
                        }${i < arr.length - 1 ? ", " : ""}`,
                      ""
                    ))}
              {options?.length > 0 && (
                <>{!selected?.toString().length && (placeholder || "Select")}</>
              )}
            </>
          )}
        </p>
        <input
          data-testid="combobox-input"
          {...register(name, { ...formOptions })}
          readOnly={true}
          onKeyDown={(e) => {
            if (!open && e.keyCode === 32) {
              setOpen(true);
            }
          }}
        />
        <span data-testid="combobox-btn" className={s.btn}>
          <FaSortDown />
        </span>
      </div>
      {error && <span className={s.errMsg}>{error.message}</span>}
      <Modal
        open={open}
        className={s.comboboxModal}
        backdropClass={s.comboboxBackdrop}
        open={open}
        setOpen={setOpen}
        onBackdropClick={() => setOpen(false)}
        style={style}
      >
        <ComboboxList
          options={options}
          setValue={setValue}
          selected={selected}
          multiple={multiple}
          name={name}
          setOpen={setOpen}
          onChange={onChange}
          clearErrors={clearErrors}
          item={item}
        />
      </Modal>
    </section>
  );
};
const ComboboxList = ({
  options,
  selected,
  setValue,
  multiple,
  name,
  setOpen,
  onChange = () => {},
  clearErrors,
  item,
}) => {
  const ul = useRef();
  const [hover, setHover] = useState(
    options.findIndex(({ label, value }) => {
      return (
        value === selected ||
        (selected?.some && selected.some((s) => s === value))
      );
    })
  );
  const select = useCallback(
    ({ label, value, ...rest }) => {
      const _selectedItem = selected?.find?.((item) => item === value);
      if (_selectedItem) {
        setValue(
          name,
          selected.filter((item) => item !== value)
        );
      } else {
        if (multiple) {
          setValue(name, [
            ...(selected.filter?.((item) => item !== value) || []),
            value,
          ]);
        } else {
          setValue(name, value);
        }
      }

      if (!multiple) {
        setOpen(false);
      }
      clearErrors?.(name);
      onChange({ label, value, ...rest });
    },
    [selected]
  );
  const keyDownHandler = useCallback(
    (e) => {
      e.preventDefault();
      if (e.keyCode === 9) {
      }
      if (e.keyCode === 27) {
        setOpen(false);
        return;
      }
      if (e.keyCode === 32 && options[hover]) {
        select(options[hover]);
        return;
      }
      if (e.keyCode === 38 || e.keyCode === 40) {
        const index = options.findIndex(({ label, value }) => {
          return (
            value === selected ||
            (selected?.some && selected.some((s) => s === value))
          );
        });
        const _hover = hover !== undefined ? hover : index;
        if (e.keyCode === 38) {
          setHover(Math.max(_hover - 1, 0));
        } else if (e.keyCode === 40) {
          setHover(Math.min(_hover + 1, options.length - 1));
        }
      }
    },
    [hover, selected]
  );
  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [hover]);
  return (
    <ul
      ref={ul}
      className={s.options}
      data-testid="combobox-options"
      onMouseMove={() => setHover(null)}
    >
      {options.map(({ label, value, ...rest }, i) => (
        <li
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            select({ label, value, ...rest });
          }}
          className={`${
            (selected?.find && selected.find((item) => item === value)) ||
            value === selected
              ? s.selected
              : ""
          } ${hover === i && s.hover}`}
          data-testid={`combobox-${label}`}
        >
          {multiple && (
            <input
              type="checkbox"
              checked={selected?.find?.((item) => item === value) || false}
              readOnly={true}
            />
          )}
          {item ? item({ label, value, ...rest }) : label}
        </li>
      ))}
    </ul>
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
    }
  }, [phoneNumber]);
  return (
    <section
      className={`${s.input} ${s.mobileNumberInput} ${className || ""} ${
        error ? s.err : ""
      }`}
    >
      {label && <label>{label}</label>}
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
                if (_number.isValid) {
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
            onChange={(e) => {
              clearErrors?.(name);
              const value = e.target.value;
              const _number = phone(value, { country: country.iso2 });
              if (value && _number.isValid) {
                setValue(name, _number.phoneNumber);
              }
            }}
            id={rest.id || _id.current}
            placeholder={"#"}
            maxLength="15"
            {...rest}
          />
        </span>
        {error && (
          <span className={s.errIcon}>
            <BsFillExclamationTriangleFill />
          </span>
        )}
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
      {tabs.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={location?.pathname.endsWith(path) ? s.active : ""}
        >
          {label}
        </Link>
      ))}
      <span className={s.fill} />
    </div>
  );
};
export const Table = ({ columns, className, children, sortable, actions }) => {
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
      <tbody ref={tbody}>{children}</tbody>
    </table>
  );
};
export const TableActions = ({ actions }) => {
  const btn = useRef();
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
          Math.min(y + height, window.innerHeight - (31 * actions.length + 8)),
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
      <button className={s.btn} ref={btn} onClick={() => setOpen(true)}>
        <BsFillGearFill className={s.gear} /> <FaSortDown className={s.sort} />
      </button>
      <Modal
        style={style}
        className={s.actionModal}
        open={open}
        onBackdropClick={() => setOpen(false)}
        backdropClass={s.actionBackdrop}
      >
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
      </Modal>
    </td>
  );
};

export const moment = ({ time, format }) => {
  if (new Date(time).toString() === "Invalid Date") {
    return time;
  }
  const options = {
    year: format.includes("YYYY") ? "numeric" : "2-digit",
    month: format.includes("MMMM")
      ? "long"
      : format.includes("MMM")
      ? "short"
      : format.includes("MM")
      ? "2-digit"
      : "numeric"
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    weekday: format.includes("dddd")
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    day: format.includes("DD") ? "2-digit" : "numeric",
    hour: format.includes("hh") ? "2-digit" : "numeric",
    minute: format.includes("mm") ? "2-digit" : "numeric",
    second: format.includes("ss") ? "2-digit" : "numeric",
  };
  const values = {};
  new Intl.DateTimeFormat("en-IN", options)
    .formatToParts(new Date(time || new Date()))
    .map(({ type, value }) => {
      values[type] = value;
    });
  return format
    .replace(/Y+/g, values.year)
    .replace(/M+/g, values.month)
    .replace(/D+/g, values.day)
    .replace(/h+/g, values.hour)
    .replace(/m+/g, values.minute)
    .replace(/s+/g, values.second)
    .replace(/a+/g, values.dayPeriod)
    .replace(/d+/g, values.weekday);
};
export const Moment = ({ format, children, ...rest }) => {
  return (
    <time {...rest} data-testid="moment">
      {moment({ time: children, format })}
    </time>
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
