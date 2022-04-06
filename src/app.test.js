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
import userEvent from "@testing-library/user-event";

import reportWebVitals from "./reportWebVitals";

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
        id: 3,
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
        department: 4,
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

  test("whole form", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    let dateInput = document.querySelector("input[name='incident_Date_Time']");
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
    expect(dateInput.value).toBe("2020-05-12T20:20");

    const btns = await screen.getByTestId("irFormActions");

    const clearBtn = btns.querySelector(`.btn.secondary[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    dateInput = document.querySelector("input[name='incident_Date_Time']");
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
    expect(dateInput.value).toBe("2020-05-12T20:20");

    const saveBtn = btns.querySelector(`.btn.secondary[type="button"]`);
    await act(async () => {
      await fireEvent.click(saveBtn);
    });
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

  test("Categories", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    let box = document.querySelector(".incidentCategory");

    const category = box.querySelector(".select:nth-child(1) input");
    await act(async () => {
      await userEvent.type(category, "Medication Errors");
      await userEvent.type(category, "{enter}");
    });

    const subCategory = box.querySelector(".select:nth-child(2) input");
    await act(async () => {
      await userEvent.type(subCategory, "Sub Cat1");
      await userEvent.type(subCategory, "{enter}");
    });

    let infoBtn = box.querySelector("button.info");
    await act(async () => {
      await fireEvent.click(infoBtn);
    });

    const tableCat = document.querySelector(
      ".modal table tr:nth-child(2) td:nth-child(2) label"
    );
    await act(async () => {
      await fireEvent.click(tableCat);
    });

    const saveBtn = document.querySelector(".modal .btns .btn.secondary");
    await act(async () => {
      await fireEvent.click(saveBtn);
    });

    infoBtn = box.querySelector("button.info");
    await act(async () => {
      await fireEvent.click(infoBtn);
    });

    const infoCloseBtn = document.querySelector(".modal .head button.clear");
    await act(async () => {
      await fireEvent.click(infoCloseBtn);
    });

    infoBtn = box.querySelector("button.info");
    await act(async () => {
      await fireEvent.click(infoBtn);
    });

    const cancelButton = document.querySelector(".modal .btns .btn.ghost");
    await act(async () => {
      await fireEvent.click(cancelButton);
    });
  });

  test("Action Table", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    let table = document.querySelector(".actionTaken");

    let textInput = table.querySelector("form textarea");
    await act(async () => {
      await userEvent.type(textInput, "description");
    });

    let selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "admin");
      await userEvent.type(selectInput, "{enter}");
    });

    let select = table.querySelector("form .reactSelect");
    expect(select.textContent).toBe("admin");

    let dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
    expect(dateInput.value).toBe("2020-05-12T20:20");

    let submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    let editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    let clearBtn = table.querySelector(`form .btns button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    textInput = table.querySelector("form textarea");
    await act(async () => {
      await userEvent.type(textInput, "description for yashtech");
    });

    selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "");
      await userEvent.type(selectInput, "yashtech");
      await userEvent.type(selectInput, "{enter}");
    });

    dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    clearBtn = table.querySelector(`form .btns button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-01-12T10:80" },
      });
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    clearBtn = table.querySelector(`form .btns button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    textInput = table.querySelector("form textarea");
    await act(async () => {
      await userEvent.type(textInput, "description");
    });

    selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "");
      await userEvent.type(selectInput, "admin");
      await userEvent.type(selectInput, "{enter}");
    });

    dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    const deleteBtn = table.querySelector(`button[title="Delete"]`);
    await act(async () => {
      await fireEvent.click(deleteBtn);
    });

    const deleteYes = document.querySelector(".prompt .actions button.yes");
    expect(deleteYes.textContent).toBe("Yes");

    await act(async () => {
      await fireEvent.click(deleteYes);
    });

    table = document.querySelector(".actionTaken");
    expect(table.textContent).toMatch("Action TakenAction Taken By");
  });

  test("Witness Table", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    let table = document.querySelector(".witnesses");

    let selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "admin");
      await userEvent.type(selectInput, "{enter}");
    });

    let select = table.querySelector("form .reactSelect");
    expect(select.textContent).toBe("admin");

    let deparmentInput = table.querySelector("form input[readonly]");
    expect(deparmentInput.value).toBe("Dept1");

    let submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "yashtech");
      await userEvent.type(selectInput, "{enter}");
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    const deleteBtn = table.querySelector(`button[title="Delete"]`);
    await act(async () => {
      await fireEvent.click(deleteBtn);
    });

    const deleteYes = document.querySelector(".prompt .actions button.yes");
    expect(deleteYes.textContent).toBe("Yes");

    await act(async () => {
      await fireEvent.click(deleteYes);
    });

    table = document.querySelector(".witnesses");
    expect(table.textContent).toMatch("NameDepartmentActionEnter");
  });

  test("Notification Table", async () => {
    await customRender(<App />, {
      user: { id: 10, name: "Test User", role: ["irAdmin"], department: 1 },
    });

    let table = document.querySelector(".notified");

    let selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "admin");
      await userEvent.type(selectInput, "{enter}");
    });

    let select = table.querySelector("form .reactSelect");
    expect(select.textContent).toBe("admin");

    let deparmentInput = table.querySelector("form input[readonly]");
    expect(deparmentInput.value).toBe("Dept1");

    let dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });
    expect(dateInput.value).toBe("2020-05-12T20:20");

    let submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    let editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    let clearBtn = table.querySelector(`form .btns button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "");
      await userEvent.type(selectInput, "yashtech");
      await userEvent.type(selectInput, "{enter}");
    });

    dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    editBtn = table.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    clearBtn = table.querySelector(`form .btns button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    selectInput = table.querySelector("form .reactSelect input");
    await act(async () => {
      await userEvent.type(selectInput, "");
      await userEvent.type(selectInput, "admin");
      await userEvent.type(selectInput, "{enter}");
    });

    dateInput = table.querySelector(`form input[type="datetime-local"]`);
    await act(async () => {
      await fireEvent.change(dateInput, {
        target: { value: "2020-05-12T20:20" },
      });
    });

    submitBtn = table.querySelector(`form button[type="submit"]`);
    await act(async () => {
      await fireEvent.click(submitBtn);
    });

    const deleteBtn = table.querySelector(`button[title="Delete"]`);
    await act(async () => {
      await fireEvent.click(deleteBtn);
    });

    const deleteYes = document.querySelector(".prompt .actions button.yes");
    expect(deleteYes.textContent).toBe("Yes");

    await act(async () => {
      await fireEvent.click(deleteYes);
    });

    table = document.querySelector(".notified");
    expect(table.textContent).toMatch("NameDepartmentDate");
  });
});

test("Web Vital Report", () => {
  const fun = jest.fn();
  expect(reportWebVitals(fun));
});
