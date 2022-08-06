import Dashboard, { Accordion } from "./dashboard";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <SiteContext.Provider value={providerProps}>
        <IrDashboardContext.Provider value={{ count: {}, dataElements: [] }}>
          {ui}
        </IrDashboardContext.Provider>
      </SiteContext.Provider>
    </BrowserRouter>,
    renderOptions
  );
};

test("Dashboard", async () => {
  const providerProps = {
    user: { id: 10, name: "Test User" },
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
  const comp = screen.getByTestId("dashboard");
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
