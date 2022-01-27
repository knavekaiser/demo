import Dashboard, { Accordion } from "./dashboard";
import { SiteContext } from "../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <SiteContext.Provider value={providerProps}>{ui}</SiteContext.Provider>
    </BrowserRouter>,
    renderOptions
  );
};

test("Dashboard", () => {
  const providerProps = {
    user: { id: 10, name: "Test User" },
    checkPermission: () => true,
  };
  customRender(<Dashboard />, { providerProps });
  const comp = screen.getByTestId("dashboard");
  expect(comp.textContent).toMatch(
    "Incident Reporting Incident Dashboard CAPA Reporting Reports IR Configuration  Masters"
  );

  const btn = document.querySelector("button.clear");
  fireEvent.click(btn);

  // const logoutBtn = document.querySelector(
  //   `div[data-testid="dashboard"] div div div button:last-child`
  // );
  // fireEvent.click(logoutBtn);
});
