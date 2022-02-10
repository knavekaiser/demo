import ReactDOM from "react-dom";
import {
  Input,
  FileInput,
  Textarea,
  Radio,
  CustomRadio,
  SwitchInput,
  Toggle,
  Combobox,
  Checkbox,
  TableActions,
  Table,
  Moment,
  Chip,
  Tabs,
  MobileNumberInput,
} from "./elements";
import { BrowserRouter } from "react-router-dom";
import { useForm } from "react-hook-form";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("input", () => {
  render(<Input type="text" placeholder="input-placeholder" />);
  const input = screen.getByPlaceholderText("input-placeholder");
  expect(input.placeholder).toBe("input-placeholder");
});
test("FileInput", () => {
  render(<FileInput label="Files" />);
  const fileInput = screen.getByTestId("fileInput");
  expect(fileInput.textContent).toBe("Files0 files selectedItem select");

  const input = document.querySelector("input");
  fireEvent.click(input);
});
test("Textarea", () => {
  render(<Textarea type="text" placeholder="textarea" />);
  const textarea = screen.getByPlaceholderText("textarea");
  expect(textarea.placeholder).toBe("textarea");
});
test("Radio", () => {
  render(
    <Radio
      name="typeofInci"
      options={[
        {
          label: "Option 1",
          value: "1",
          hint: "Hint for option 1",
        },
        {
          label: "Option 2",
          value: "2",
          hint: "Hint for option 2",
        },
      ]}
    />
  );
  const container = screen.getByTestId("radioInput");
  expect(container.textContent).toBe(
    "Option 1Hint for option 1Option 2Hint for option 2"
  );
});
test("CustomRadio", () => {
  render(
    <CustomRadio
      label="Custom Radio"
      options={[
        {
          label: "Option 1",
          value: "1",
        },
        {
          label: "Option 2",
          value: "2",
        },
      ]}
    />
  );
  const container = screen.getByTestId("customRadioInput");
  expect(container.textContent).toBe("Custom RadioOption 1Option 2");
});
test("Switch", () => {
  render(<SwitchInput label="Switch" />);
  const input = screen.getByTestId("switchInput");
  expect(input.textContent).toBe("SwitchYesNo");
});
test("Toggle", () => {
  render(<Toggle label="Switch" />);
  const input = screen.getByTestId("toggleInput");
  expect(input.textContent).toBe("");
});
test("Checkbox", () => {
  render(<Checkbox label="Switch" />);
  const time = screen.getByTestId("checkbox-input");
  expect(time.textContent).toBe("Switch");
});
describe("Table Actions", () => {
  beforeAll(async () => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    });
    let portal = document.querySelector("#portal");
    if (!portal) {
      portal = document.createElement("div");
      portal.id = "portal";
      document.body.appendChild(portal);
    }

    let prompt = document.querySelector("#prompt");
    if (!prompt) {
      const prompt = document.createElement("div");
      prompt.id = "prompt";
      document.body.appendChild(prompt);
    }
  });
  test("2 actions", async () => {
    await act(async () =>
      render(
        <table>
          <tbody>
            <tr>
              <TableActions
                actions={[
                  { icon: "Icon 1", label: "Action 1", callBack: () => {} },
                  { icon: "Icon 2", label: "Action 2", callBack: () => {} },
                ]}
              />
            </tr>
          </tbody>
        </table>
      )
    );
    const container = screen.getByTestId("tableActions");
    expect(container.textContent).toBe("Icon 1Icon 2");
  });
  test("4 actions", async () => {
    await act(async () =>
      render(
        <table>
          <tbody>
            <tr>
              <TableActions
                actions={[
                  { icon: "Icon 1", label: "Action 1", callBack: () => {} },
                  { icon: "Icon 2", label: "Action 2", callBack: () => {} },
                  { icon: "Icon 3", label: "Action 3", callBack: () => {} },
                  { icon: "Icon 4", label: "Action 4", callBack: () => {} },
                  { icon: "Icon 5", label: "Action 5", callBack: () => {} },
                ]}
              />
            </tr>
          </tbody>
        </table>
      )
    );
    const gearBtn = screen.getByTestId("gear-btn");
    fireEvent.click(gearBtn);

    const opt1 = document.querySelector(".modal button");
    fireEvent.click(opt1);

    fireEvent.click(gearBtn);
    const backdrop = document.querySelector(".modalBackdrop");
    fireEvent.click(backdrop);
  });
  test("Table", async () => {
    await act(async () =>
      render(
        <Table
          columns={[{ label: "Label 1" }, { label: "Label 2" }]}
          sortable={true}
        >
          <tr>
            <td>Name</td>
            <td>Email</td>
          </tr>
          <tr>
            <td>Name 2</td>
            <td>Email 2</td>
          </tr>
        </Table>
      )
    );
  });
});
test("Moment", () => {
  const component = render(
    <Moment format="DD/MM/YYYY ddd hh:mm">
      {new Date("2021-05-12 13:45")}
    </Moment>
  );
  const time = screen.getByTestId("moment");
  expect(time.textContent).toBe("12/05/2021 Wed 01:45");
});
test("Invalid Date", () => {
  const component = render(
    <Moment format="DD/MM/YYYY ddd hh:mm">1agdasdgsd33*&**9</Moment>
  );
  const time = screen.getByTestId("moment");
  expect(time.textContent).toBe("1agdasdgsd33*&**9");
});
test("Chip", () => {
  const component = render(<Chip label="test chip" remove={jest.fn()} />);
  const button = document.querySelector("button.clear");
  fireEvent.click(button);
});
test("Tabs", () => {
  const component = render(
    <BrowserRouter>
      <Tabs
        tabs={[
          { path: "/admin/path-1", label: "Path 1" },
          { path: "/admin/path-2", label: "Path 2" },
        ]}
      />
    </BrowserRouter>
  );
  const a = document.querySelector("a");
  fireEvent.click(a);
});

const Form = () => {
  const { handleSubmit, register, setValue, watch, clearErrors } = useForm();
  return (
    <form onSubmit={handleSubmit((data) => {})}>
      <MobileNumberInput
        name="number"
        required={true}
        register={register}
        error={null}
        clearErrors={clearErrors}
        setValue={setValue}
        watch={watch}
      />
    </form>
  );
};

describe("Form", () => {
  beforeAll(async () => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    });
    let portal = document.querySelector("#portal");
    if (!portal) {
      portal = document.createElement("div");
      portal.id = "portal";
      document.body.appendChild(portal);
    }

    let prompt = document.querySelector("#prompt");
    if (!prompt) {
      const prompt = document.createElement("div");
      prompt.id = "prompt";
      document.body.appendChild(prompt);
    }

    await act(async () => render(<Form />));
  });
  test("Plain render", async () => {
    const container = document.querySelector("section");

    const arrow = screen.getByTestId("combobox-btn");
    await act(async () => {
      await fireEvent.click(arrow);
    });

    const country = document.querySelector(".modal ul li");
    await act(async () => {
      await fireEvent.click(country);
    });

    await act(async () => {
      await fireEvent.click(arrow);
    });

    let input = document.querySelector(
      `section[data-testid="mobileNumberInput"] > div > span > input`
    );
    await act(async () => {
      await fireEvent.click(input);
    });

    await act(async () => {
      await userEvent.type(input, "+8801989479749");
    });
    expect(input.value).toBe("+8801989479749");
  });
});
