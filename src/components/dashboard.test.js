import Dashboard, { Accordion } from "./dashboard";
import { SiteContext, IrDashboardContext, Provider } from "../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";

const irDashboardDataElements = [
  {
    id: 3,
    statusOption: "Enable cancel IR function",
    irMgr: true,
    irInvestigator: true,
    type: 3,
  },
  {
    id: 4,
    statusOption: "Submitted IRs",
    irMgr: true,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 5,
    statusOption: "Approved IRs",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 6,
    statusOption: "Rejected IRs",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 7,
    statusOption: "Re-approval request",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 8,
    statusOption: "Assigned IRs",
    irMgr: false,
    irInvestigator: true,
    type: 1,
  },
  {
    id: 9,
    statusOption: "Under Investigation",
    irMgr: true,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 10,
    statusOption: "CAPA Planning",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 11,
    statusOption: "Closure confirmation",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 12,
    statusOption: "Closure confirmed",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 13,
    statusOption: "IR closure",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 14,
    statusOption: "CAPA Closed",
    irMgr: false,
    irInvestigator: false,
    type: 1,
  },
  {
    id: 15,
    statusOption: "Current Months IRs",
    irMgr: true,
    irInvestigator: false,
    type: 2,
  },
  {
    id: 16,
    statusOption: "Open sentinel event",
    irMgr: true,
    irInvestigator: false,
    type: 2,
  },
  {
    id: 17,
    statusOption: "Open Patient complaints",
    irMgr: false,
    irInvestigator: false,
    type: 2,
  },
  {
    id: 18,
    statusOption: "IR beyond acceptable TAT",
    irMgr: false,
    irInvestigator: false,
    type: 2,
  },
  {
    id: 19,
    statusOption: "CAPA closure enabled",
    irMgr: false,
    irInvestigator: false,
    type: 2,
  },
  {
    id: 20,
    statusOption: "Open Reportable Event",
    irMgr: true,
    irInvestigator: false,
    type: 2,
  },
];

const capaDashboardDataElements = [
  {
    id: 3,
    statusOption: "CAPA Action",
    irMgr: true,
    irInvestigator: true,
    type: 3,
  },
  {
    id: 4,
    statusOption: "CAPA Monitoring",
    irMgr: true,
    irInvestigator: false,
    type: 1,
  },
];

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <SiteContext.Provider value={providerProps}>
        <IrDashboardContext.Provider
          value={{
            count: {},
            irDashboardDataElements,
            capaDashboardDataElements,
            irScreenDetails: [],
            checkDataElements: () => true,
          }}
        >
          {ui}
        </IrDashboardContext.Provider>
      </SiteContext.Provider>
    </BrowserRouter>,
    renderOptions
  );
};

const customRenderStaticProvider = (ui, { ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <Provider>
        <IrDashboardContext.Provider
          value={{
            count: {},
            irDashboardDataElements,
            capaDashboardDataElements,
            irScreenDetails: [],
            checkDataElements: () => true,
          }}
        >
          {ui}
        </IrDashboardContext.Provider>
      </Provider>
    </BrowserRouter>,
    renderOptions
  );
};

test("Dashboard", async () => {
  const providerProps = {
    user: { id: 10, name: "Test User", role: [2, 4, 7, 9, 1] },
    checkPermission: () => true,
    setUser: jest.fn(),
    setRole: jest.fn(),
    endpoints: {
      locations: "http://endpoints.com/locations",
      users: "http://endpoints.com/users",
      departments: "http://endpoints.com/departments",
    },
  };
  customRender(<Dashboard />, { providerProps });
  const comp = await screen.getByTestId("dashboard");
  expect(comp.textContent).toMatch(
    "There is a blame free reporting culture. No punitive measure will be taken against any staff reporting any incident"
  );

  const btn = document.querySelector("button.clear");
  await act(async () => {
    await fireEvent.click(btn);
  });

  const logoutBtn = document.querySelector(
    `div[data-testid="dashboard"] div div div button:last-child`
  );
  await act(async () => {
    await fireEvent.click(logoutBtn);
  });
});

test("Dashboard - Static provider", async () => {
  customRenderStaticProvider(<Dashboard />, {});
  // const comp = screen.getByTestId("dashboard");
  // expect(comp.textContent).toMatch(
  //   "There is a blame free reporting culture. No punitive measure will be taken against any staff reporting any incident"
  // );

  // const btn = document.querySelector("button.clear");
  // await act(async () => {
  //   await fireEvent.click(btn);
  // });

  // const logoutBtn = document.querySelector(
  //   `div[data-testid="dashboard"] div div div button:last-child`
  // );
  // await act(async () => {
  //   await fireEvent.click(logoutBtn);
  // });
});
