import ReactDOM from "react-dom";
import IrDashboard, { MyDashboard, QualityDashboard } from "./irDashboard";
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
              setDashboard: jest.fn(),
              parameters: {
                locations: [
                  { label: 1, value: "Loc 1" },
                  { label: 2, value: "Loc 2" },
                  { label: 3, value: "Loc 3" },
                ],
                categories: [
                  {
                    id: 1,
                    name: "Cat 1",
                    subCategorys: [
                      {
                        id: 1,
                        name: "Sub Cat 1",
                        reportable: [{ id: 2, description: "sdfasdf" }],
                      },
                      {
                        id: 3,
                        name: "Other",
                        reportable: [],
                      },
                    ],
                  },
                  {
                    id: 2,
                    name: "Cat 2",
                    subCategorys: [
                      {
                        id: 1,
                        name: "Other",
                        reportable: [],
                      },
                    ],
                  },
                ],
                users: [
                  { label: 1, value: "User 1" },
                  { label: 2, value: "User 2" },
                  { label: 3, value: "User 3" },
                ],
                investigators: [
                  { label: 1, value: "User 1", assignedIr: 2 },
                  { label: 2, value: "User 2", assignedIr: 4 },
                  { label: 3, value: "User 3", assignedIr: 8 },
                ],
              },
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

const irData = {
  _embedded: {
    IncidentReport: [
      {
        id: 61,
        actionTaken: [
          {
            id: 40,
            immedActionTaken: "es",
            accessTakenBy: 6,
            accessDateTime: "2022-02-09T13:22:00.000+05:30",
          },
        ],
        witness: [
          {
            id: 29,
            witnessName: 6,
            witnessDept: 1,
            witnessDateTime: null,
          },
        ],
        notification: [
          {
            id: 17,
            name: 6,
            dept: 1,
            notificationDateTime: "2022-02-20T13:22:00.000+05:30",
          },
        ],
        upload: [],
        sequence: "038 /02/2022 IR NAP",
        status: 2,
        department: "1",
        userDept: "",
        userId: 6,
        irInvestigator: 6,
        capturedBy: null,
        reportingDate: "2022-02-20T13:22:57.278+05:30",
        irStatusDetails: [
          {
            id: 51,
            status: 3,
            dateTime: "2022-02-20T17:29:06.682+05:30",
            userid: 6,
          },
          {
            id: 53,
            status: 2,
            dateTime: "2022-02-20T13:23:03.774+05:30",
            userid: 6,
          },
        ],
        location: 2,
        template: null,
        actionTakens: [
          {
            id: 40,
            immedActionTaken: "es",
            accessTakenBy: 6,
            accessDateTime: "2022-02-09T13:22:00.000+05:30",
          },
        ],
        incident_Date_Time: "2022-02-20T13:21:00.000+05:30",
        locationDetailsEntry: "weg",
        patientYesOrNo: null,
        patientname: "",
        complaIntegerDatetime: null,
        complaIntegerIdEntry: null,
        typeofInci: 1,
        inciCateg: 1,
        inciSubCat: 6,
        personAffected: null,
        inciDescription: "kludsrf xxgh",
        deptsLookupMultiselect: "",
        contribFactorYesOrNo: null,
        contribFactor: null,
        preventability: 2,
        incidentReportedDept: null,
        headofDepart: 6,
      },
      {
        id: 62,
        actionTaken: [],
        witness: [
          {
            id: 30,
            witnessName: 15,
            witnessDept: 2,
            witnessDateTime: null,
          },
        ],
        notification: [],
        upload: [],
        sequence: "040 /02/2022 IR NAP",
        status: "3",
        department: "1",
        userDept: null,
        userId: 6,
        irInvestigator: 6,
        capturedBy: null,
        reportingDate: "2022-02-20T19:36:39.078+05:30",
        irStatusDetails: [
          {
            id: 55,
            status: 2,
            dateTime: "2022-02-20T19:36:38.737+05:30",
            userid: 6,
          },
          {
            id: 58,
            status: 3,
            dateTime: "2022-02-21T10:07:06.411+05:30",
            userid: 6,
          },
        ],
        location: 1,
        template: null,
        actionTakens: [],
        incident_Date_Time: "2022-02-20T19:36:00.000+05:30",
        locationDetailsEntry: "",
        patientYesOrNo: false,
        patientname: null,
        complaIntegerDatetime: null,
        complaIntegerIdEntry: null,
        typeofInci: 2,
        inciCateg: 1,
        inciSubCat: 1,
        personAffected: null,
        inciDescription: "sgf sg",
        deptsLookupMultiselect: "",
        contribFactorYesOrNo: null,
        contribFactor: null,
        preventability: null,
        incidentReportedDept: null,
        headofDepart: 6,
      },
      {
        id: 4,
        actionTaken: [
          {
            id: 4,
            immedActionTaken: "werewr",
            accessTakenBy: 6,
            accessDateTime: "2022-02-16T18:36:00.000+05:30",
          },
        ],
        witness: [],
        notification: [],
        upload: [],
        sequence: "004 /02/2022 IR NAP",
        status: "3",
        department: "2",
        userDept: null,
        userId: 15,
        irInvestigator: 6,
        capturedBy: null,
        reportingDate: "2022-02-16T18:19:15.874+05:30",
        irStatusDetails: [
          {
            id: 4,
            status: 3,
            dateTime: "2022-02-16T18:50:15.853+05:30",
            userid: 6,
          },
          {
            id: 7,
            status: 2,
            dateTime: "2022-02-16T18:36:44.210+05:30",
            userid: 15,
          },
        ],
        location: 1,
        template: null,
        actionTakens: [
          {
            id: 4,
            immedActionTaken: "werewr",
            accessTakenBy: 6,
            accessDateTime: "2022-02-16T18:36:00.000+05:30",
          },
        ],
        incident_Date_Time: "2022-02-16T03:18:00.000+05:30",
        locationDetailsEntry: "rtret",
        patientYesOrNo: false,
        patientname: null,
        complaIntegerDatetime: null,
        complaIntegerIdEntry: null,
        typeofInci: 7,
        inciCateg: 1,
        inciSubCat: 1,
        personAffected: null,
        inciDescription: "wewe",
        deptsLookupMultiselect: "",
        contribFactorYesOrNo: null,
        contribFactor: null,
        preventability: 1,
        incidentReportedDept: null,
        headofDepart: null,
      },
    ],
  },
};
const singleIr = {
  id: 61,
  actionTaken: [
    {
      id: 40,
      immedActionTaken: "es",
      accessTakenBy: 6,
      accessDateTime: "2022-02-09T13:22:00.000+05:30",
    },
  ],
  witness: [
    {
      id: 29,
      witnessName: 6,
      witnessDept: 1,
      witnessDateTime: null,
    },
  ],
  notification: [
    {
      id: 17,
      name: 6,
      dept: 1,
      notificationDateTime: "2022-02-20T13:22:00.000+05:30",
    },
  ],
  upload: [],
  sequence: "038 /02/2022 IR NAP",
  status: "3",
  department: "1",
  userDept: "",
  userId: 6,
  irInvestigator: 6,
  capturedBy: null,
  reportingDate: "2022-02-20T13:22:57.278+05:30",
  irStatusDetails: [
    {
      id: 51,
      status: 3,
      dateTime: "2022-02-20T17:29:06.682+05:30",
      userid: 6,
    },
    {
      id: 53,
      status: 2,
      dateTime: "2022-02-20T13:23:03.774+05:30",
      userid: 6,
    },
  ],
  location: 2,
  template: null,
  actionTakens: [
    {
      id: 40,
      immedActionTaken: "es",
      accessTakenBy: 6,
      accessDateTime: "2022-02-09T13:22:00.000+05:30",
    },
  ],
  incident_Date_Time: "2022-02-20T13:21:00.000+05:30",
  locationDetailsEntry: "weg",
  patientYesOrNo: null,
  patientname: "",
  complaIntegerDatetime: null,
  complaIntegerIdEntry: null,
  typeofInci: 1,
  inciCateg: 1,
  inciSubCat: 6,
  personAffected: null,
  inciDescription: "kludsrf xxgh",
  deptsLookupMultiselect: "",
  contribFactorYesOrNo: null,
  contribFactor: null,
  preventability: 2,
  incidentReportedDept: null,
  headofDepart: 6,
};

describe("IR Dashboard", () => {
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
      user: {
        id: 10,
        name: "Test User",
        role: [
          "incidentManager",
          "irInvestigator",
          "irAdmin",
          "hod",
          "incidentReporter",
        ],
      },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
      checkPermission: () => true,
    };
    setMockFetch(irData);
    await customRender(<IrDashboard />, { providerProps });
  });

  test("Render", () => {});
});

describe("My Dashboard", () => {
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
      user: { id: 10, name: "Test User" },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
      checkPermission: () => true,
    };
    setMockFetch(irData);
    await customRender(<MyDashboard />, { providerProps });
  });

  test("Search", async () => {
    const input = document.querySelector(`input[name="sequence"]`);
    await act(async () => {
      await userEvent.type(input, "123");
    });

    const submitBtn = await screen.getByText("Search");
    await act(async () => {
      await fireEvent.click(submitBtn);
    });
  });
});

describe("Quality Dashboard", () => {
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
      user: { id: 10, name: "Test User" },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
      checkPermission: () => true,
    };
    setMockFetch(irData);
    await customRender(<QualityDashboard />, { providerProps });
  });

  test("Search", async () => {
    const input = document.querySelector(`input[name="sequence"]`);
    await act(async () => {
      await userEvent.type(input, "123");
    });

    const submitBtn = await screen.getByText("Search");
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    const actionButton = document.querySelector("table td button");
    await act(async () => {
      await fireEvent.click(actionButton);
    });

    let reAssignBtn = document.querySelector(".modal.actionModal div button");
    await act(async () => {
      await fireEvent.click(reAssignBtn);
    });

    const comboInput = document.querySelector(".modal form input");
    await act(async () => {
      await fireEvent.click(comboInput);
    });

    const optionOne = document.querySelector(".modal .options li");
    await act(async () => {
      await fireEvent.click(optionOne);
    });

    setMockFetch(singleIr);

    const assignBtn = document.querySelector(
      `.modal form .btns button:last-child`
    );
    expect(assignBtn.textContent).toBe("Re-Assign");
    await act(async () => {
      await fireEvent.click(assignBtn);
    });

    await act(async () => {
      await fireEvent.click(actionButton);
    });

    reAssignBtn = document.querySelector(".modal.actionModal div button");
    await act(async () => {
      await fireEvent.click(reAssignBtn);
    });

    const closeBtn = document.querySelector(`.modal form .btns button`);
    await act(async () => {
      await fireEvent.click(closeBtn);
    });
  });
});
