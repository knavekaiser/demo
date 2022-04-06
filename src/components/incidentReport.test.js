import ReactDOM from "react-dom";
import IncidentReport, {
  IncidentCategory,
  Box,
  Notifications,
} from "./incidentReport";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import userEvent from "@testing-library/user-event";

const customRender = async (ui, { providerProps, ...renderOptions }) => {
  return await act(async () => {
    await render(
      <BrowserRouter>
        <SiteContext.Provider value={providerProps}>
          <IrDashboardContext.Provider
            value={{
              count: {},
            }}
          >
            {ui}
          </IrDashboardContext.Provider>
        </SiteContext.Provider>
      </BrowserRouter>,
      renderOptions
    );
  });
};

const setMockFetch = (data, status) => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue(data),
    status: status || 200,
  });
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

    const providerProps = {
      user: { id: 10, name: "Test User", department: 3 },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
    };
    await customRender(<IncidentReport />, { providerProps });
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
    const resetBtn = screen.getByText("Clear");
    await act(async () => {
      await fireEvent.click(resetBtn);
    });
    const btn = document.querySelector(".box .head button");
    await act(async () => {
      await fireEvent.click(btn);
    });

    const btn2 = document.querySelector(".box .head button");
  });

  test("Set notification", async () => {
    const notified = document.querySelector(".notified");
    expect(notified.textContent).toMatch("NameDepartmentDate");
  });
});
