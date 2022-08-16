import ReactDOM from "react-dom";
import IncidentReport, {
  IncidentCategory,
  Box,
  Notifications,
} from "./incidentReport";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import { preventability } from "../config";
import userEvent from "@testing-library/user-event";

const providerProps = {
  user: { id: 10, name: "Test User", department: 3 },
  endpoints: {
    locations: "http://endpoints.com/locations",
    users: "http://endpoints.com/users",
    departments: "http://endpoints.com/departments",
  },
  irTypes: [{ label: "test", value: "test" }],
};

const renderState = {
  state: {
    edit: {
      preventability,
    },
    readOnly: true,
    from: "login",
  },
};

const customRender = async (
  ui,
  { providerProps, irProviderProps, renderState, ...renderOptions }
) => {
  return await act(async () => {
    await render(
      <MemoryRouter initialEntries={[renderState]}>
        <SiteContext.Provider value={providerProps}>
          <IrDashboardContext.Provider value={irProviderProps}>
            {ui}
          </IrDashboardContext.Provider>
        </SiteContext.Provider>
      </MemoryRouter>,
      renderOptions
    );
  });
};

const changeComplaintDatetime = async () => {
  const switchInput = screen.getByTestId("switchInput").querySelector("input");
  await act(async () => {
    await fireEvent.click(switchInput);
  });
  const dateTimeInput = screen.getByLabelText("Complaint Date & Time *");
  const date = new Date();
  date.setDate(date.getDate() + 1);
  fireEvent.input(dateTimeInput, {
    target: {
      value: date.toString(),
    },
  });
  const saveBtn = screen.getByText("Save");
  await act(async () => {
    await fireEvent.click(saveBtn);
  });
};

const mockData = {
  _embedded: {
    location: [
      {
        id: 1,
        code: 0,
        name: "ICU",
        locationType: 2,
        status: true,
      },
      {
        id: 2,
        code: 0,
        name: "others",
        locationType: 12,
        status: true,
      },
      {
        id: 5,
        code: 0,
        name: "radiology",
        locationType: 2,
        status: true,
      },
      {
        id: 7,
        code: 0,
        name: "Test",
        locationType: 2,
        status: true,
      },
    ],
  },
};
const setMockFetch = (data, status) => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue(data),
    status: status || 200,
  });
};

const setMockFailFetch = () => {
  jest.spyOn(global, "fetch").mockResolvedValue();
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

    const irProviderProps = {
      count: {},
      irScreenDetails: [
        {
          id: 5,
          enableDisable: true,
          rulesPeriod: "day",
        },
        {
          id: 2,
          enableDisable: true,
        },
      ],
    };
    await customRender(<IncidentReport />, { providerProps, irProviderProps });
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

  test("file upload", async () => {
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    const fileInput = screen
      .getByTestId("fileInput")
      .querySelector(`input[type='file']`);
    await waitFor(() =>
      fireEvent.change(fileInput, {
        target: { files: [file] },
      })
    );
  });

  test("Reset form", async () => {
    const resetBtn = await screen.getByText("Clear");
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

  test("incident_Date_Time", async () => {
    const dateTimeInput = screen.getByLabelText("Incident Date & Time *");
    await act(async () => {
      await fireEvent.change(dateTimeInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
  });

  test("irForm clear", async () => {
    const clearBtn = screen.getByText("Clear");
    await act(async () => {
      await fireEvent.click(clearBtn);
    });
  });

  test("irForm Save", async () => {
    const saveBtn = screen.getByText("Save");
    await act(async () => {
      await fireEvent.click(saveBtn);
    });
  });

  test("irForm Submit", async () => {
    const submitBtn = screen.getByText("Submit");
    await act(async () => {
      await fireEvent.click(submitBtn);
    });
  });

  test("change patient toggle", async () => {
    const switchInput = screen
      .getByTestId("switchInput")
      .querySelector("input");
    await act(async () => {
      await fireEvent.click(switchInput);
      expect(screen.getByLabelText("Complaint Date & Time *")).toBeDefined();
    });
  });
});

describe("Incident Report Form Edit", () => {
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
  });

  test("irForm save - edit", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "day",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
      renderState,
    });
    await changeComplaintDatetime();
  });

  test("complaIntegerDatetime validate", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "week",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
      renderState,
    });
    await changeComplaintDatetime();
    const submitButton = document.querySelector(".incident-details-submit");
    await act(async () => {
      fireEvent.submit(submitButton);
    });
  });

  test("click back to dashboard button", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "month",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
      renderState,
    });

    await changeComplaintDatetime();
    const backBtn = screen.getByText("Back to Dashboard");
    await act(async () => {
      await fireEvent.click(backBtn);
    });
  });
});

describe("Different date format", () => {
  const providerProps = {
    user: { id: 10, name: "Test User", department: 3 },
    endpoints: {
      locations: "http://endpoints.com/locations",
      users: "http://endpoints.com/users",
      departments: "http://endpoints.com/departments",
    },
    irTypes: [{ label: "test", value: "test" }],
  };
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
  });

  test("Incident date time - week", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "week",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
    });
    const dateTimeInput = screen.getByLabelText("Incident Date & Time *");
    await act(async () => {
      await fireEvent.change(dateTimeInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
  });
  test("Incident date time - month", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "month",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
    });
    const dateTimeInput = screen.getByLabelText("Incident Date & Time *");
    await act(async () => {
      await fireEvent.change(dateTimeInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
  });
  test("Incident date time - year", async () => {
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "year",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
    });
    const dateTimeInput = screen.getByLabelText("Incident Date & Time *");
    await act(async () => {
      await fireEvent.change(dateTimeInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
    const submitButton = document.querySelector(".incident-details-submit");
    await act(async () => {
      fireEvent.submit(submitButton);
    });
  });
  test("Location details validation", async () => {
    setMockFetch(mockData);
    await customRender(<IncidentReport />, {
      providerProps,
      irProviderProps: {
        count: {},
        irScreenDetails: [
          {
            id: 5,
            enableDisable: true,
            rulesPeriod: "year",
          },
          {
            id: 2,
            enableDisable: true,
          },
        ],
      },
    });
    const locationDetailsEntry = document.querySelector(
      `input[name="locationDetailsEntry"]`
    );
    await act(async () => {
      await userEvent.type(locationDetailsEntry);
    });
    const submitButton = document.querySelector(".incident-details-submit");
    await act(async () => {
      fireEvent.submit(submitButton);
    });
    const saveBtn = document.querySelector(".ir-form-submit");
    await fireEvent.click(saveBtn);
    const radio = document.querySelector(`input[name='typeofInci']`);
    fireEvent.change(radio, { target: { value: "test" } });
    expect(radio.value).toBe("test");
  });
});
