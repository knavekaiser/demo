import ReactDOM from "react-dom";
import IrPreview from "./irPreview";
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
              irScreenDetails: [],
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
const setMockFailFetch = () => {
  jest.spyOn(global, "fetch").mockResolvedValue();
};

describe("Incident Preview With Data", () => {
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

    setMockFetch({
      _embedded: {
        user: [
          {
            id: 6,
            name: "John",
            role: "1,2,4,7,9",
            department: 1,
          },
          {
            id: 15,
            name: "Jane",
            role: "1,2,4,7,9",
            department: 2,
          },
        ],
        location: [
          {
            id: 5,
            name: "some location",
          },
          {
            id: 7,
            name: "some other location",
          },
        ],
        department: [
          {
            id: 2,
            name: "some department",
          },
          {
            id: 4,
            name: "Some other department",
          },
        ],
      },
      id: 24982,
      actionTaken: [
        {
          id: 3,
          immedActionTaken: "sdfds",
          accessTakenBy: 6,
          accessDateTime: "2022-02-16T16:23:00.000+05:30",
        },
      ],
      witness: [
        {
          id: 3,
          witnessName: 6,
          witnessDept: 1,
          witnessDateTime: null,
        },
      ],
      notification: [
        {
          id: 3,
          name: 6,
          dept: 1,
          notificationDateTime: "2022-02-16T16:23:00.000+05:30",
        },
      ],
      upload: [],
      sequence: "2164 /08/2022 NAP H",
      status: "2",
      department: "2",
      userDept: "",
      userId: 15,
      irInvestigator: null,
      capturedBy: null,
      reportingDate: "2022-08-02T18:36:47.731+05:30",
      irStatusDetails: [
        {
          id: 25176,
          status: 2,
          dateTime: "2022-08-02T18:36:48.423+05:30",
          userid: 15,
        },
      ],
      templateData: [],
      irHodAck: [],
      reqInput: [],
      recordInput: [],
      responseIrInput: [],
      irInvestigation: [],
      location: 5,
      incident_Date_Time: "2022-08-02T18:36:00.000+05:30",
      locationDetailsEntry: "",
      patientYesOrNo: null,
      patientname: "",
      complaIntegerDatetime: null,
      complaIntegerIdEntry: null,
      typeofInci: 1,
      inciCateg: 2,
      inciSubCat: 3,
      template: null,
      personAffected: null,
      inciDescription: "ir re",
      deptsLookupMultiselect: "",
      contribFactorYesOrNo: null,
      preventability: null,
      incidentReportedDept: null,
      headofDepart: 15,
      actionTakens: [],
      contribFactor: null,
    });

    const providerProps = {
      user: { id: 10, name: "Test User", department: 3 },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
    };
    await customRender(<IrPreview />, { providerProps });
  });

  test("Render Preview", async () => {
    const summary = document.querySelector("div div section");
    expect(summary.textContent).toBe("IR Code: 2164 /08/2022 NAP H");
  });

  test("Acknowledge", async () => {
    const ackBtn = await screen.getByText("Acknowledge");
    await act(async () => {
      await fireEvent.click(ackBtn);
    });

    const textarea = document.querySelector("#portal .modal form textarea");
    await act(async () => {
      await userEvent.type(textarea, "Some note");
    });

    setMockFetch({
      serverDate: "2022-08-09",
      serverTime: "17:07:42.621512",
      id: 20148,
      remarks: "ir is approved",
      responseBy: "15",
      userId: 15,
      responseOn: "2022-08-02T18:37:15.239+05:30",
    });

    const submitBtn = document.querySelector(
      "#portal .modal form button[type='submit']"
    );
    await act(async () => {
      await fireEvent.click(submitBtn);
    });
  });
});

describe("Incident Preview Without Data", () => {
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

    setMockFailFetch();

    const providerProps = {
      user: { id: 10, name: "Test User", department: 3 },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
    };
    await customRender(<IrPreview />, { providerProps });
  });

  test("Render Preview", async () => {
    const summary = document.querySelector("div div section");
    expect(summary.textContent).toBe("IR Code: -");
  });
});
