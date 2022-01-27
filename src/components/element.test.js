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
  Moment,
} from "./elements";
import { render, screen, fireEvent } from "@testing-library/react";

test("input", () => {
  render(<Input type="text" placeholder="input-placeholder" />);
  const input = screen.getByPlaceholderText("input-placeholder");
  expect(input.placeholder).toBe("input-placeholder");
});
test("FileInput", () => {
  render(<FileInput label="Files" />);
  const input = screen.getByTestId("fileInput");
  expect(input.textContent).toBe("Files0 files selectedItem select");
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
test("combobox", () => {
  render(
    <Combobox
      placeholder="Placeholder"
      options={[
        { value: "option1", label: "option 1" },
        { value: "option1", label: "option 2" },
        { value: "option1", label: "option 3" },
      ]}
    />
  );

  const container = screen.getByTestId("combobox-container");
  expect(container.textContent).toBe("Placeholder");

  const btn = screen.getByTestId("combobox-btn");
  fireEvent.click(btn);

  // const options2 = screen.getByTestId("combobox-option 2");
  // expect(options2.textContent).toBe("option 2");

  // fireEvent.click(options2);
  // expect(container.textContent).toBe("Placeholder");
});
test("Checkbox", () => {
  render(<Checkbox label="Switch" />);
  const time = screen.getByTestId("checkbox-input");
  expect(time.textContent).toBe("Switch");
});
test("TableActions", () => {
  render(
    <table>
      <tbody>
        <tr>
          <TableActions
            actions={[
              { icon: "Icon 1", label: "Action 1", callback: () => {} },
              { icon: "Icon 2", label: "Action 2", callback: () => {} },
            ]}
          />
        </tr>
      </tbody>
    </table>
  );
  const container = screen.getByTestId("tableActions");
  expect(container.textContent).toBe("Icon 1Icon 2");
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
