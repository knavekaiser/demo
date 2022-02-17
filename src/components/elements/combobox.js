import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  forwardRef,
} from "react";
import s from "./elements.module.scss";

import { FaSortDown, FaSearch } from "react-icons/fa";
import { Modal } from "../modal";
import { Input } from "./elements";

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
  onChange = () => {},
  error,
  clearErrors,
  item,
  renderValue,
  required,
}) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  const container = useRef();
  const selected = watch?.(name);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [hover, setHover] = useState(
    options?.findIndex(({ label, value }) => {
      return (
        value === selected ||
        (selected?.some && selected.some((s) => s === value))
      );
    })
  );
  const clickHandlerAdded = useState(false);
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
      console.log("child", e.keyCode, open, name);
      // e.preventDefault();
      // e.stopPropagation();
      if (!options) return;
      // if (!open) return;

      if (!open && e.keyCode === 32) {
        setOpen(true);
      }
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
        const index = options?.findIndex(({ label, value }) => {
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
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.path && !e.path.includes(container.current)) {
        setOpen(false);
      }
    };
    if (!clickHandlerAdded.current) {
      document.addEventListener("click", clickHandler);
      return () => {
        document.removeEventListener("click", clickHandler);
      };
      clickHandlerAdded.current = true;
    }
  }, [open]);
  return (
    <section
      data-testid="combobox-container"
      className={`${s.combobox} ${className || ""} ${open ? s.open : ""} ${
        !(Array.isArray(options) && options.length) ? s.noOptions : ""
      } ${error ? s.err : ""}`}
    >
      {label && (
        <label data-testid="combobox-label">
          {label} {required && "*"}
        </label>
      )}
      <div
        className={s.field}
        onClick={() => {
          if (Array.isArray(options) && options.length) {
            setOpen(true);
          }
        }}
        ref={container}
        tabIndex={0}
        onKeyDown={(e) => {
          if ([32, 38, 40].includes(e.keyCode)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.keyCode === 27) {
              // escape key
              setOpen(false);
              return;
            }
            if (!open && e.keyCode === 32) {
              setOpen(true);
              return;
            }
            if (e.keyCode === 32 && options[hover]) {
              select(options[hover]);
            }
            if (e.keyCode === 38 || e.keyCode === 40) {
              const index = options?.findIndex(({ label, value }) => {
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
          }
        }}
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
          id={id.current}
          data-testid="combobox-input"
          {...register(name, { ...formOptions })}
          readOnly={true}
          tabIndex={1}
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
        clickThroughBackdrop={true}
        style={style}
      >
        <ComboboxList
          hover={hover}
          setHover={setHover}
          options={options}
          setValue={setValue}
          select={select}
          selected={selected}
          multiple={multiple}
          name={name}
          open={open}
          setOpen={setOpen}
          clearErrors={clearErrors}
          item={item}
        />
      </Modal>
    </section>
  );
};

export const AutoComplete = ({
  register,
  addNew,
  formOptions,
  label,
  name,
  watch,
  setValue,
  placeholder,
  fetchData,
  options: _defaultOptions,
  multiple,
  className,
  onChange,
  item,
  renderValue,
  required,
  error,
  clearErrors,
}) => {
  const id = useRef(Math.random().toString(36).substr(-8));
  const container = useRef();
  const optionContainerRef = useRef();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([...(_defaultOptions || [])]);

  const selected = watch?.(name);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [hover, setHover] = useState(
    options?.findIndex(({ label, value }) => {
      return (
        value === selected ||
        (selected?.some && selected.some((s) => s === value))
      );
    })
  );
  const clickHandlerAdded = useState(false);
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
      onChange?.({ label, value, ...rest });
    },
    [selected]
  );
  const keyDownHandler = useCallback(
    (e) => {
      console.log("child", e.keyCode, open, name);
      // e.preventDefault();
      // e.stopPropagation();
      if (!options) return;
      // if (!open) return;

      if (!open && e.keyCode === 32) {
        setOpen(true);
      }
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
        const index = options?.findIndex(({ label, value }) => {
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
  useLayoutEffect(() => {
    const { width, height, x, y } = container.current.getBoundingClientRect();
    const top = window.innerHeight - y;
    if (optionContainerRef.current) {
      setStyle({
        position: "absolute",
        left: x,
        top: Math.max(
          Math.min(
            y + height,
            window.innerHeight -
              Math.min(
                (optionContainerRef.current?.querySelector("li").clientHeight ||
                  35) *
                  (options?.length || 0) +
                  8,
                320
              )
          ),
          8
        ),
        width: width,
        maxHeight: Math.min(window.innerHeight - 16, 300),
      });
    }
  }, [open]);
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.path && !e.path.includes(container.current)) {
        setOpen(false);
      }
    };
    if (!clickHandlerAdded.current) {
      document.addEventListener("click", clickHandler);
      return () => {
        document.removeEventListener("click", clickHandler);
      };
      clickHandlerAdded.current = true;
    }
  }, [open]);
  return (
    <section
      data-testid="combobox-container"
      className={`${s.combobox} ${className || ""} ${open ? s.open : ""} ${
        !(Array.isArray(options) && options.length) ? s.noOptions : ""
      } ${error ? s.err : ""}`}
    >
      {label && (
        <label data-testid="combobox-label">
          {label} {required && "*"}
        </label>
      )}
      <div
        className={s.field}
        // onClick={() => {
        //   if (Array.isArray(options) && options.length) {
        //     setOpen(true);
        //   }
        // }}
        ref={container}
        onKeyDown={(e) => {
          if ([32, 38, 40].includes(e.keyCode)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.keyCode === 27) {
              // escape key
              setOpen(false);
              return;
            }
            if (!open && e.keyCode === 32) {
              setOpen(true);
              return;
            }
            if (e.keyCode === 32 && options[hover]) {
              select(options[hover]);
            }
            if (e.keyCode === 38 || e.keyCode === 40) {
              const index = options?.findIndex(({ label, value }) => {
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
          }
        }}
      >
        <Input
          id={id.current}
          data-testid="combobox-input"
          {...register(name, { ...formOptions })}
          value={inputValue}
          autoComplete="off"
          onFocus={() => {
            if (Array.isArray(options) && options.length) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            setOpen(true);
            setOptions(_defaultOptions);
            if (!addNew) {
              setValue("");
            }
          }}
          // readOnly={true}
          // tabIndex={1}
        />
        <span data-testid="combobox-btn" className={s.btn}>
          <FaSearch />
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
        clickThroughBackdrop={true}
        style={style}
      >
        <ComboboxList
          hover={hover}
          setHover={setHover}
          options={options}
          setValue={setValue}
          select={select}
          selected={selected}
          multiple={multiple}
          name={name}
          open={open}
          setOpen={setOpen}
          clearErrors={clearErrors}
          item={item}
          ref={optionContainerRef}
        />
      </Modal>
    </section>
  );
};

const ComboboxList = forwardRef(
  (
    {
      options,
      hover,
      setHover,
      select,
      selected,
      setValue,
      multiple,
      name,
      open,
      setOpen,
      clearErrors,
      item,
    },
    ref
  ) => {
    return (
      <ul
        ref={ref}
        className={s.options}
        data-testid="combobox-options"
        onMouseMove={() => setHover(null)}
      >
        {options?.map(({ label, value, ...rest }, i) => (
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
                checked={
                  (selected?.find && selected.find((item) => item === value)) ||
                  false
                }
                readOnly={true}
              />
            )}
            {item ? item({ label, value, ...rest }) : label}
          </li>
        ))}
      </ul>
    );
  }
);
