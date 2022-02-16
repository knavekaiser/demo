import ReactDOM from "react-dom";
import Login from "./login";
import { Provider, SiteContext } from "../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const customRender = async (ui, { providerProps, ...renderOptions }) => {
  return await act(async () => {
    await render(
      <BrowserRouter>
        <SiteContext.Provider value={providerProps}>{ui}</SiteContext.Provider>
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

describe("Login with his", () => {
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
            id: 1,
            name: "name",
            password: "1234",
            role: "irAdmin",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            password: "1234",
            role: "incidentReporter",
            department: 5,
          },
        ],
      },
    });

    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
        his: true,
        setHis: jest.fn(),
        setEndpoints: jest.fn(),
      },
    });
  });

  test("Plain render", () => {
    const comp = screen.getByTestId("login");
    expect(comp.textContent).toMatch("Sign In");
  });

  test("Plain render with user", async () => {
    await customRender(<Login />, {
      providerProps: {
        user: {
          id: 1,
          name: "name",
          password: "1234",
          role: ["irAdmin"],
          department: 3,
        },
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
      },
    });
  });

  test("Failed to load users", async () => {
    setMockFailFetch();
    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
      },
    });
  });

  test("Login with his - fail", async () => {
    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    setMockFailFetch();

    const loginBtn = await screen.findByText("Sign in");
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });

  test("Login with his", async () => {
    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    setMockFetch({
      password: "$2a$08$.reXbG1GLFaZTKDY/GVHju",
      tokenID: "24234234234",
      userViewList: [
        {
          userId: "name",
          gender: "Male",
          department: {
            code: "3241",
            description: "OP",
          },
        },
      ],
    });

    const loginBtn = await screen.findByText("Sign in");
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });

  test("Login with his - no salt", async () => {
    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    setMockFetch({});

    const loginBtn = await screen.findByText("Sign in");
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });

  test("Login with his - no token", async () => {
    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    setMockFetch({
      password: "$2a$08$.reXbG1GLFaZTKDY/GVHju",
    });

    const loginBtn = await screen.findByText("Sign in");
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });

  test("Login with his - no user", async () => {
    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    setMockFetch({
      password: "$2a$08$.reXbG1GLFaZTKDY/GVHju",
      tokenID: "24234234234",
      userViewList: [],
    });

    const loginBtn = await screen.findByText("Sign in");
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });

  test("Login with his - checkbox", async () => {
    const checkbox = document.querySelector(`input[type="checkbox"]`);

    await act(async () => {
      await fireEvent.click(checkbox);
    });
  });
});

describe("Login independent - success", () => {
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
            id: 1,
            name: "name",
            password: "1234",
            role: "irAdmin",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            password: "1234",
            role: "incidentReporter",
            department: 5,
          },
        ],
      },
    });

    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
        his: false,
        setHis: jest.fn(),
        setEndpoints: jest.fn(),
      },
    });
  });

  test("Independent login", async () => {
    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
        his: false,
        setHis: jest.fn(),
        setEndpoints: jest.fn(),
      },
    });

    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    const loginBtn = document.querySelector(`form button`);
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });
});

describe("Login independent - fail", () => {
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
            id: 2,
            name: "name2",
            password: "1234",
            role: "incidentReporter",
            department: 5,
          },
        ],
      },
    });

    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
        his: false,
        setHis: jest.fn(),
        setEndpoints: jest.fn(),
      },
    });
  });

  test("Independent login", async () => {
    await customRender(<Login />, {
      providerProps: {
        user: null,
        setUser: jest.fn(),
        setRole: jest.fn(),
        checkPermission: jest.fn(),
        his: false,
        setHis: jest.fn(),
        setEndpoints: jest.fn(),
      },
    });

    const usernameInput = document.querySelector(`input[type="text"]`);
    userEvent.type(usernameInput, "name");

    const passwordInput = document.querySelector(`input[type="password"]`);
    userEvent.type(passwordInput, "1234");

    const loginBtn = document.querySelector(`form button`);
    await act(async () => {
      await fireEvent.click(loginBtn);
    });
  });
});
