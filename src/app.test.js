import ReactDOM from "react-dom";
import App from "./App";
import {
  Provider,
  SiteContext,
  IrDashboardContext,
  IrDashboardContextProvider,
} from "./SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, act, fireEvent } from "@testing-library/react";

const customRender = async (ui, providerProps) => {
  return act(async () => {
    await render(
      <BrowserRouter>
        <SiteContext.Provider
          value={{
            user: null, //{ id: 10, name: "Test User", role: ["irAdmin"] },
            checkPermission: () => true,
            setUser: jest.fn(),
            setRole: jest.fn(),
            endpoints: {
              locations: "https://endpoint.com/locations",
              users: "https://endpoint.com/users",
              departments: "https://endpoint.com/departments",
            },
            ...providerProps,
          }}
        >
          <IrDashboardContext.Provider
            value={{
              count: {},
              setParameters: jest.fn(),
              setCount: jest.fn(),
              setDashboard: jest.fn(),
            }}
          >
            {ui}
          </IrDashboardContext.Provider>
        </SiteContext.Provider>
      </BrowserRouter>
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

// test("App", async () => {
//   await customRender(<App />);
//   const comp = screen.getByTestId("app");
//   expect(comp.textContent).toMatch("Sign In");
// });

const mockData = {
  _embedded: {
    userPermission: [
      {
        id: 1,
        permission: ",IR Master,IR Configuration",
        role: "irAdmin",
      },
      {
        id: 2,
        permission:
          "View Access to IR closure tab,Incident closure dashboard,CAPA dashboard - access and update CAPA's marked reponsible for,Print Reported IR's,IR Query Dashboard,Incident Reporting,My Dashboard",
        role: "incidentReporter",
      },
      {
        id: 4,
        permission:
          "CAPA Dashboard - access and update CAPA's marked responsible for,Merge IRs,Add addendum,Custom ReportsInjury Reports,Access to view IRs in quality dashboardAssigned IR,Update IR investigation for assigned IRs,CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities,Update CAPA tab for assigned IRs,Update IR Closure report for Assigned IRs,Re-portable IR for Assigned IRs,Update Reportable incident information,PrintReported IR,PrintIR Closure Screen,IR AnalyticsQuick Insights,IR AnalyticsData Analytics,Access to view IRs in quality dashboardAll IRs",
        role: "irInvestigator",
      },
      {
        id: 7,
        permission:
          "Approve IRs,Merge IRs,CAPA dashboard - Access for CAPA's of all IRs,Assign IRs,IR AnalyticsQuick Insights,PrintIR Closure Screen,PrintReported IR,Access and update all IRs,Quality Dashboard",
        role: "incidentManager",
      },
      {
        id: 9,
        permission: ",Acknowledge IR",
        role: "hod",
      },
    ],
    user: [
      {
        id: 6,
        name: "admin",
        gender: "male",
        dob: null,
        employeeId: "111",
        contact: "+919999999999",
        email: null,
        department: 1,
        role: "irAdmin",
        password: "12345678",
        country: null,
      },
      {
        id: 15,
        name: "yashtech",
        gender: "male",
        dob: null,
        employeeId: "7687",
        contact: null,
        email: null,
        department: 2,
        role: "irInvestigator,irAdmin,incidentReporter,hod",
        password: null,
        country: null,
      },
      {
        id: 16,
        name: "venkat",
        gender: "male",
        dob: "1991-02-02T00:00:00.000+05:30",
        employeeId: "99",
        contact: "+919946455466",
        email: "cfr@sdd.vbn",
        department: 2,
        role: "irInvestigator,incidentReporter",
        password: "12345",
      },
    ],
    department: [
      {
        id: 1,
        name: "Dept1",
      },
      {
        id: 2,
        name: "Client",
      },
      {
        id: 4,
        name: "lab",
      },
      {
        id: 5,
        name: "aa",
      },
      {
        id: 6,
        name: "NapierTest",
      },
    ],
    category: [
      {
        id: 1,
        name: "Medication Errors",
        subCategorys: [
          {
            id: 1,
            name: "Other",
            template: 0,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
          {
            id: 6,
            name: "Sub Cat1",
            template: 1,
            sentinel: false,
            reportStatus: true,
            status: true,
            reportable: [
              {
                id: 1,
                reporting_instructions: "this is the report",
                report_to: 6,
              },
            ],
          },
          {
            id: 4,
            name: "cat 1 sub 3",
            template: 21,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
        ],
      },
      {
        id: 2,
        name: "Medical",
        subCategorys: [
          {
            id: 2,
            name: "Other",
            template: 0,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
          {
            id: 5,
            name: "sub2",
            template: 43,
            sentinel: true,
            reportStatus: false,
            status: true,
            reportable: [],
          },
          {
            id: 3,
            name: "subb1",
            template: 2434,
            sentinel: false,
            reportStatus: true,
            status: true,
            reportable: [],
          },
          {
            id: 7,
            name: "asdasdg",
            template: 2323,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
        ],
      },
      {
        id: 3,
        name: "Test",
        subCategorys: [
          {
            id: 8,
            name: "Other",
            template: 32,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
        ],
      },
      {
        id: 4,
        name: "New Category",
        subCategorys: [
          {
            id: 9,
            name: "New1",
            template: 1,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
        ],
      },
      {
        id: 5,
        name: "asdg asdg",
        subCategorys: [
          {
            id: 10,
            name: "asd gha",
            template: 232,
            sentinel: false,
            reportStatus: false,
            status: true,
            reportable: [],
          },
        ],
      },
    ],
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

test("Site Context Provider", () => {
  render(
    <BrowserRouter>
      <Provider />
    </BrowserRouter>
  );
});
test("IR Dashboard Context Provider", async () => {
  setMockFetch(mockData);
  await customRender(<IrDashboardContextProvider />, {
    user: { id: 10, name: "Test User", role: ["irAdmin"] },
  });
});

describe("App tests", () => {
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

    setMockFetch(mockData);
  });

  test("No User", async () => {
    await customRender(<App />);
    const comp = screen.getByTestId("app");
    expect(comp.textContent).toMatch("Sign In");
  });

  test("User logged in", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });
    const comp = screen.getByTestId("app");
    expect(comp.textContent).toMatch("Logged in as: Test User");

    const logoutBtn = screen.getByTestId("logout");
    await act(async () => {
      await fireEvent.click(logoutBtn);
    });
  });

  test("Witness Table", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    const table = document.querySelector(".witnesses");
    const selectInput = table.querySelector("form .select");
    await act(async () => {
      await fireEvent.click(selectInput);
    });

    // const optionsOne = document.querySelector(".modal ul li");
    // await act(async () => {
    //   await fireEvent.click(optionsOne);
    // });

    const submit = table.querySelector(`form .btns button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submit);
    });
  });

  test("Notification Table", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    const table = document.querySelector(".notified");
    const selectInput = table.querySelector("form .reactSelect__control");
    await act(async () => {
      await fireEvent.click(selectInput);
    });

    // const optionsOne = document.querySelector(
    //   ".react-select__menu-list .react-select__option"
    // );
    // const test = screen.getByTestId("sdf");

    // const optionsOne = document.querySelector(
    //   ".react-select__menu-list .react-select__option"
    // );
    // await act(async () => {
    //   await fireEvent.click(optionsOne);
    // });

    const dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-01-01" },
      });
    });

    const submit = table.querySelector(`form .btns button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submit);
    });
  });
});
