import App from "./App";
import { Provider, SiteContext } from "./SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, act, fireEvent } from "@testing-library/react";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <BrowserRouter>
      <SiteContext.Provider value={providerProps}>{ui}</SiteContext.Provider>
    </BrowserRouter>,
    renderOptions
  );
};

test("App", () => {
  const providerProps = {
    user: { id: 10, name: "Test User", role: ["irAdmin"] },
    checkPermission: () => true,
    setUser: jest.fn(),
    setRole: jest.fn(),
  };
  customRender(
    <Provider>
      <App />
    </Provider>,
    { providerProps }
  );
  const comp = screen.getByTestId("app");
  expect(comp.textContent).toMatch("Sign In");
});
