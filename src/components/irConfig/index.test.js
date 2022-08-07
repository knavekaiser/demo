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
        }}
      >
        <IrDashboardContext.Provider
          value={{
            irConfig: { hodAcknowledgement: true },
            irInvestigationDetails: [],
            setIrInvestigationDetails: jest.fn(),
            irScreenDetails: [],
          }}
        >
          {ui}
        </IrDashboardContext.Provider>
      </SiteContext.Provider>
    </BrowserRouter>
  );
};

test("Dashboard", () => {
  customRender(<IrConfig />);
  const comp = screen.getByTestId("irConfigs");
  expect(comp.textContent).toMatch("404");
});

test("IR Data Analytics", () => {
  render(<IrDataAnalytics />);
  const comp = screen.getByTestId("irDataAnalytics");
  expect(comp.textContent).toMatch("IR Data analytics coming");
});

test("Main Configuration", () => {
  customRender(<MainConfiguration />);
  const comp = screen.getByTestId("mainConfig");
  expect(comp.textContent).toMatch("INCIDENT REPORTING");
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
      },
    });

    await act(async () => {
      await customRender(<UserPermission />);
    });
  });

  test("Full Render", () => {
    const comp = screen.getByTestId("userPermission");
    expect(comp.textContent).toMatch("USER MANAGEMENT");
  });

  test("Save update success", async () => {
    const input = screen.getByText("Acknowledge IR");
    await act(async () => {
      await fireEvent.click(input);
    });

    const save = document.querySelector(`button.btn.wd-100`);
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
