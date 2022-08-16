import ReactDOM from "react-dom";
import IrConfig from "./index";
import { Provider, SiteContext, IrDashboardContext } from "../../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import IrDataAnalytics from "./irDataAnalytics";
import MainConfiguration from "./mainConfiguration";
import UserPermission from "./userPermission";

const customRender = async (ui) => {
  return await render(
    <BrowserRouter>
      <SiteContext.Provider
        value={{
          user: { id: 10, name: "Test User", role: ["irAdmin"] },
          checkPermission: () => true,
          setUser: jest.fn(),
          setRole: jest.fn(),
          setPermissions: jest.fn(),
        }}
      >
        <IrDashboardContext.Provider
          value={{
            irConfig: { hodAcknowledgement: true },
            irInvestigationDetails: [
              {
                id: 1,
                elements: 1,
                element_descrip: "View Related incidents",
                enable: true,
                value: null,
              },
              {
                id: 2,
                elements: 2,
                element_descrip: "Same category",
                enable: true,
                value: null,
              },
              {
                id: 3,
                elements: 3,
                element_descrip: "Same Sub-category",
                enable: true,
                value: null,
              },
              {
                id: 4,
                elements: 4,
                element_descrip: "Type of incident",
                enable: false,
                value: null,
              },
              {
                id: 5,
                elements: 5,
                element_descrip: "Same Location type",
                enable: true,
                value: null,
              },
              {
                id: 6,
                elements: 6,
                element_descrip: "Duration",
                enable: false,
                value: "threeMonths",
              },
              {
                id: 7,
                elements: 7,
                element_descrip: "Conduct Risk Assessment",
                enable: true,
                value: null,
              },
              {
                id: 8,
                elements: 8,
                element_descrip: "Mark Self-reporting IRs",
                enable: true,
                value: null,
              },
              {
                id: 9,
                elements: 9,
                element_descrip: "Mark IPSG Type",
                enable: true,
                value: null,
              },
              {
                id: 10,
                elements: 10,
                element_descrip:
                  "Send thank you notification for Self-Reporting IR",
                enable: true,
                value: null,
              },
            ],
            setIrInvestigationDetails: jest.fn(),
            irScreenDetails: [
              {
                id: "1",
                optionDescrp: "test",
              },
            ],
            setIrScreenDetails: jest.fn(),
          }}
        >
          {ui}
        </IrDashboardContext.Provider>
      </SiteContext.Provider>
    </BrowserRouter>
  );
};

test("Dashboard", async () => {
  customRender(<IrConfig />);
  const comp = await screen.getByTestId("irConfigs");
  expect(comp.textContent).toMatch("404");
});

test("IR Data Analytics", async () => {
  render(<IrDataAnalytics />);
  const comp = await screen.getByTestId("irDataAnalytics");
  expect(comp.textContent).toMatch("IR Data analytics coming");
});

const setMockFetch = (data, status) => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue(data),
    status: status || 200,
  });
};
const setMockFailFetch = () => {
  jest.spyOn(global, "fetch").mockResolvedValue();
};

describe("Main Configuration", () => {
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
        userPermission: [
          {
            id: 342,
            role: "irAdmin",
            permission: "IR Master,IR Configuration",
          },
          {
            id: 123,
            role: "hod",
            permission: "Acknowledge IRs,View Departments IRs",
          },
        ],
        configAcceptableTAT: [
          {
            id: 1,
            start: "Incident Reporting Date",
            endValue: "IR Closure Date",
            acceptableTAT: 2,
            excludeWeek: "4",
            acceptableTatSentinel: 1,
            sentinelExcludeWeek: "0,6",
          },
        ],
      },
    });

    await act(async () => {
      await customRender(<MainConfiguration />);
    });
  });

  test("Main Render", async () => {
    const comp = screen.getByTestId("mainConfig");
    expect(comp.textContent).toMatch("INCIDENT REPORTING");

    const thanksCheckbox = screen.getByText(
      "Send thank you notification for Self-Reporting IR"
    );
    await act(async () => {
      await fireEvent.click(thanksCheckbox);
    });

    const allToggle = screen.getAllByTestId("toggleInput");
    await act(async () => {
      await fireEvent.click(allToggle[0]);
    });
    await act(async () => {
      await fireEvent.click(allToggle[1]);
    });
    await act(async () => {
      await fireEvent.click(allToggle[2]);
    });
    await act(async () => {
      await fireEvent.click(allToggle[3]);
    });
    await act(async () => {
      await fireEvent.click(allToggle[4]);
    });
    await act(async () => {
      await fireEvent.click(allToggle[5]);
    });

    const allSaves = screen.getAllByText("Save");
    await act(async () => {
      await fireEvent.click(allSaves[0]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[1]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[2]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[3]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[4]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[5]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[6]);
    });
    await act(async () => {
      await fireEvent.click(allSaves[7]);
    });
  });

  test("checkbox 3 change event", async () => {
    const ele = screen.getByLabelText("Same Sub-category");
    await act(async () => {
      await fireEvent.click(ele);
    });
  });

  test("checkbox change event", async () => {
    const ele = screen.getByLabelText(
      "Send thank you notification for Self-Reporting IR"
    );
    await act(async () => {
      await fireEvent.change(ele);
    });
  });

  test("save button click event", async () => {
    const ele = document.querySelector(".ir-investigation-save");
    await act(async () => {
      await fireEvent.click(ele);
    });
  });

  test("IrInvestigationDetails", async () => {
    const irInvestigationDetail = document.querySelector(
      ".irInvestigationDetail"
    );
    const toggleInputs = irInvestigationDetail.querySelectorAll(
      'input[type="checkbox"]'
    );
    for (let i = 0; i < 9; i++) {
      await act(async () => {
        await fireEvent.change(toggleInputs[i]);
      });
    }
  });
});

describe("User Permission", () => {
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
        userPermission: [
          {
            id: 342,
            role: "irAdmin",
            permission: "IR Master,IR Configuration",
          },
          {
            id: 123,
            role: "hod",
            permission: "Acknowledge IRs,View Departments IRs",
          },
        ],
        rolePermission: [
          {
            id: 47,
            role: {
              id: 9,
              permission: ",Acknowledge IR,View Departments IR",
              role: "hod",
              user: null,
            },
            permission: {
              id: 36,
              permission: "Acknowledge IR",
            },
            enable: false,
          },
          {
            id: 48,
            role: {
              id: 9,
              permission: ",Acknowledge IR,View Departments IR",
              role: "hod",
              user: null,
            },
            permission: {
              id: 37,
              permission: "View Departments IR",
            },
            enable: true,
          },
        ],
      },
    });

    await act(async () => {
      await customRender(<UserPermission />);
    });
  });

  test("Full Render", async () => {
    const comp = await screen.getByTestId("userPermission");
    expect(comp.textContent).toMatch("USER MANAGEMENT");
  });

  test("Save update success", async () => {
    const input = await screen.getByText("Acknowledge IR");
    await act(async () => {
      await fireEvent.click(input);
    });

    setMockFetch({
      _embedded: {
        rolePermission: [
          {
            id: 47,
            role: {
              id: 9,
              permission: ",Acknowledge IR,View Departments IR",
              role: "hod",
              user: null,
            },
            permission: {
              id: 36,
              permission: "Acknowledge IR",
            },
            enable: false,
          },
          {
            id: 48,
            role: {
              id: 9,
              permission: ",Acknowledge IR,View Departments IR",
              role: "hod",
              user: null,
            },
            permission: {
              id: 37,
              permission: "View Departments IR",
            },
            enable: true,
          },
        ],
        id: 47,
        role: {
          id: 9,
          permission: null,
          role: null,
          user: null,
        },
        permission: {
          id: 36,
          permission: null,
        },
        enable: false,
      },
    });

    const save = await screen.getByText("Save");
    await act(async () => {
      await fireEvent.click(save);
    });
  });

  test("Save update fail", async () => {
    const input = document.querySelector(`input[type="checkbox"]`);
    await act(async () => {
      await fireEvent.click(input);
    });

    const save = document.querySelector(`button.btn.wd-100`);
    await act(async () => {
      await fireEvent.click(save);
    });
  });
});
