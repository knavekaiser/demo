import ReactDOM from "react-dom";
import IncidentReport, { IncidentCategory, Box } from "./incidentReport";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SiteContext } from "../SiteContext";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <SiteContext.Provider value={providerProps}>{ui}</SiteContext.Provider>
    </BrowserRouter>,
    renderOptions
  );
};

describe("Incident Report Form", () => {
  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    });
  });
  beforeEach(async () => {
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

    const providerProps = { user: { id: 10, name: "Test User" } };
    await act(async () => customRender(<IncidentReport />, { providerProps }));
  });

  test("Context test", async () => {
    const comp = screen.getByTestId("incidentReportingForm");
    expect(comp.textContent).toMatch(
      "There is a blame free reporting culture. No punitive measure will be taken against any staff reporting any incident"
    );
    expect(comp.textContent).toMatch("INCIDENT DESCRIPTION");
    expect(comp.textContent).toMatch("ClearSaveSubmit");

    const actionTaken_add = document.querySelector(
      `div[data-testid="actionTakenBtns"] button[type="submit"]`
    );
    await act(async () => {
      await fireEvent.click(actionTaken_add);
    });
  });

  test("Reset form", async () => {
    // const resetBtn = document.querySelector(".btns .btn.secondary");
    const resetBtn = screen.getByText("Clear");
    await act(async () => {
      await fireEvent.click(resetBtn);
    });
  });

  test("Set notification", async () => {
    const notified = document.querySelector(".notified");
    expect(notified.textContent).toBe("Clear");
  });
});

test("Box", () => {
  const component = render(
    <Box>
      <div>Test box</div>
    </Box>
  );
  const comp = component.getByTestId("box");
  expect(comp.textContent).toMatch("Test box");
});
