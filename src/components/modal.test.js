import ReactDOM from "react-dom";
import { Modal, Prompt } from "./modal";
import { render, screen, fireEvent, act } from "@testing-library/react";

const testPrompt = (prompt) => {
  return async () => {
    render(
      <div>
        <div id="prompt" />
        <button
          data-testid="prompt-test-btn"
          onClick={() => {
            Prompt(prompt);
          }}
        >
          Open Prompt
        </button>
      </div>
    );
    const btn = await screen.getByTestId("prompt-test-btn");
    fireEvent.click(btn);
    expect(btn.textContent).toEqual("Open Prompt");

    const _prompt = await screen.getByTestId("prompt");
    expect(_prompt.textContent).toMatch(prompt.message);

    if (prompt.name === "Confirm - Yes") {
      const yes = await screen.getByText("Yes");
      fireEvent.click(yes);
    } else if (prompt.name === "Confirm - No") {
      const no = await screen.getByText("No");
      fireEvent.click(no);
    } else {
      const ok = await screen.getByText("Ok");
      fireEvent.click(ok);
    }
  };
};

describe("Prompt", () => {
  it(
    "Confirm - Yes",
    testPrompt({
      name: "Confirm - Yes",
      type: "confirmation",
      message: "This is Confirm - YES",
      callback: jest.fn(),
    })
  );

  it(
    "Confirm - No",
    testPrompt({
      name: "Confirm - No",
      type: "confirmation",
      message: "This is Confirm - NO",
    })
  );

  it(
    "Success",
    testPrompt({
      type: "success",
      message: "This is Success",
    })
  );
  it(
    "Error",
    testPrompt({
      type: "error",
      message: "This is Error",
    })
  );
  it(
    "information",
    testPrompt({
      type: "information",
      message: "This is Information",
    })
  );
});

describe("Modal", () => {
  const handleOpen = jest.fn();
  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    });
  });
  it("Open", async () => {
    render(
      <Modal open={true} head={true} setOpen={handleOpen}>
        <p>This is a test modal!</p>
      </Modal>
    );
    const modal = await screen.getByText("This is a test modal!");
    expect(modal.textContent).toBe("This is a test modal!");

    const backdrop = document.querySelector(`.modalBackdrop`);
    fireEvent.click(backdrop);

    const closeBtn = document.querySelector(`.btn`);
    fireEvent.click(closeBtn);
  });
});
