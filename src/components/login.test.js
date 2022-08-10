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

function changeJSDOMURL(search, url = "http://localhost:3001") {
  const newURL = new URL(url);
  newURL.search = new URLSearchParams(search);
  const href = `${window.origin}${newURL.pathname}${newURL.search}${newURL.hash}`;
  history.replaceState(history.state, null, href);
}

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
            role: "1",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            role: "2",
            department: 5,
          },
        ],
      },
    });
    changeJSDOMURL({ tenantId: "kims" });

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

  test("Plain render", async () => {
    const comp = await screen.getByTestId("login");
    expect(comp.textContent).toMatch("Sign In");
  });

  test("Plain render with user", async () => {
    await customRender(<Login />, {
      providerProps: {
        user: {
          id: 1,
          name: "name",
          role: [1],
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
      id: 1,
      name: "name",
      role: "1",
      department: 3,
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
      id: 1,
      name: "name",
      role: "1",
      department: 3,
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
      id: 1,
      name: "name",
      role: "1",
      department: 3,
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

describe("Login with access token", () => {
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
            role: "1",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            role: "2",
            department: 5,
          },
        ],
      },
      id: 1,
      name: "name",
      role: "1",
      department: 3,
    });

    sessionStorage.setItem(
      "access-token",
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY2hlbWEiOiJraW1zIiwidXNlcl9uYW1lIjoieWFzaHRlY2giLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNjYwMDM0NTYzLCJhdXRob3JpdGllcyI6WyJST0xFX1NZU1RFTUFETUlOIl0sImp0aSI6ImNuQzBGenRiRjhxYllRdFhUQkhiOVBFQTFsYyIsImNsaWVudF9pZCI6Im5hcGllciJ9.ts28utjI5v8k5D23IeypFtXXVKq-06OckULJ_jIVhQuzo6C_i1eWcgi_uXIwOqqG6yTs1-q8CZyII00GDYS-AgA45QUO1UaiNyKWDXwLoph5yZmvFEWQT7P0_QInTpSoqCwIewtXFfSmdq8JsYUgZiEOGEoP-iV354iXd2D5DjAIBt4LUivB8GPUhzk8UK8XM7GEeEcQk0-KtomUEZoPMXmfnxv1CvpUZzet7zfhcEay4lYeMhXcC2qzL7XGlRFfUMdtG--65Bx72OFFi9WXFKCFQRN7QMAuu_7ZIqgd9R1BuY3Odzsip_pT_P-kbI0DkvqqE-Zl1Z3za-OdHUyDpQ"
    );

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

  test("Plain render", async () => {
    const comp = await screen.getByTestId("login");
    expect(comp.textContent).toMatch("Sign In");
  });
});

describe("Login with HIS access token", () => {
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
            role: "1",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            role: "2",
            department: 5,
          },
        ],
        apiurls: [
          {
            id: 2,
            action: "locations",
            url:
              "https://his_21_3_to_gar_qa.napierhealthcare.com:9652/napier-his-web/Integration/userMasterService/getAllLocations",
            key1: null,
            key2: null,
            key3: null,
          },
          {
            id: 3,
            action: "departments",
            url:
              "https://his_21_3_to_gar_qa.napierhealthcare.com:9652/napier-his-web/Integration/userMasterService/getAllDepartments",
            key1: "dataBean",
            key2: null,
            key3: null,
          },
          {
            id: 5,
            action: "users",
            url:
              "https://his_21_3_to_gar_qa.napierhealthcare.com:9652/napier-his-web/Integration/userMasterService/getUserDeatils",
            key1: "userViewList",
            key2: "fullName",
            key3: null,
          },
        ],
      },
      id: 1,
      name: "name",
      role: "1",
      department: 3,
    });
    changeJSDOMURL({ tenantId: "kims" });

    sessionStorage.setItem(
      "access-token",
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY2hlbWEiOiJraW1zIiwidXNlcl9uYW1lIjoieWFzaHRlY2giLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNjYwMDM0NTYzLCJhdXRob3JpdGllcyI6WyJST0xFX1NZU1RFTUFETUlOIl0sImp0aSI6ImNuQzBGenRiRjhxYllRdFhUQkhiOVBFQTFsYyIsImNsaWVudF9pZCI6Im5hcGllciJ9.ts28utjI5v8k5D23IeypFtXXVKq-06OckULJ_jIVhQuzo6C_i1eWcgi_uXIwOqqG6yTs1-q8CZyII00GDYS-AgA45QUO1UaiNyKWDXwLoph5yZmvFEWQT7P0_QInTpSoqCwIewtXFfSmdq8JsYUgZiEOGEoP-iV354iXd2D5DjAIBt4LUivB8GPUhzk8UK8XM7GEeEcQk0-KtomUEZoPMXmfnxv1CvpUZzet7zfhcEay4lYeMhXcC2qzL7XGlRFfUMdtG--65Bx72OFFi9WXFKCFQRN7QMAuu_7ZIqgd9R1BuY3Odzsip_pT_P-kbI0DkvqqE-Zl1Z3za-OdHUyDpQ"
    );
    sessionStorage.setItem(
      "HIS-access-token",
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY2hlbWEiOiJraW1zIiwidXNlcl9uYW1lIjoieWFzaHRlY2giLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNjYwMDM0NTYzLCJhdXRob3JpdGllcyI6WyJST0xFX1NZU1RFTUFETUlOIl0sImp0aSI6ImNuQzBGenRiRjhxYllRdFhUQkhiOVBFQTFsYyIsImNsaWVudF9pZCI6Im5hcGllciJ9.ts28utjI5v8k5D23IeypFtXXVKq-06OckULJ_jIVhQuzo6C_i1eWcgi_uXIwOqqG6yTs1-q8CZyII00GDYS-AgA45QUO1UaiNyKWDXwLoph5yZmvFEWQT7P0_QInTpSoqCwIewtXFfSmdq8JsYUgZiEOGEoP-iV354iXd2D5DjAIBt4LUivB8GPUhzk8UK8XM7GEeEcQk0-KtomUEZoPMXmfnxv1CvpUZzet7zfhcEay4lYeMhXcC2qzL7XGlRFfUMdtG--65Bx72OFFi9WXFKCFQRN7QMAuu_7ZIqgd9R1BuY3Odzsip_pT_P-kbI0DkvqqE-Zl1Z3za-OdHUyDpQ"
    );

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

  test("Plain render", async () => {
    const comp = await screen.getByTestId("login");
    expect(comp.textContent).toMatch("Sign In");
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
            role: "1,2,4,7,9",
            department: 3,
          },
          {
            id: 2,
            name: "name2",
            role: "1,2,4,7,9",
            department: 5,
          },
        ],
      },
      id: 1,
      name: "name",
      role: "1,2,4,7,9",
      department: 3,
      access_token: "asdfasdfasdf",
    });
    changeJSDOMURL({ tenantId: "kims" });

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

    setMockFetch({
      id: 1,
      name: "name",
      role: "1,2,4,7,9",
      department: 3,
      gender: "M",
      dob: "1994-12-08T00:00:00.000+05:30",
      employeeId: "2023",
      contact: "+919160030216",
      email: "ganesh@gmail.com",
      country: null,
      username: "Ganesh",
      grantedAuthoritiesList: [],
    });

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

    setMockFetch(null);
    changeJSDOMURL({ tenantId: "kims" });

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
