import ReactDOM from "react-dom";
import Masters from "./index";
import { Provider, SiteContext, IrDashboardContext } from "../../SiteContext";
import { BrowserRouter } from "react-router-dom";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Categories, { ReportableForm } from "./categories";
import ContributingFactor from "./contributingFactor";
import Departments from "./department";
import IrConfig from "./irCodeConfig";
import Location from "./location";
import PersonAffected from "./personAffected";
import Ram from "./ram";
import Rca from "./rca";
import TwoFieldMaster from "./twoFieldMaster";
import User from "./userMaster";

const customRender = async (ui, { providerProps, ...renderOptions }) => {
  return await act(async () => {
    await render(
      <BrowserRouter>
        <SiteContext.Provider value={providerProps}>
          <IrDashboardContext.Provider
            value={{
              irConfig: {},
            }}
          >
            {ui}
          </IrDashboardContext.Provider>
        </SiteContext.Provider>
      </BrowserRouter>,
      renderOptions
    );
  });
};

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

test("Dashboard", async () => {
  await customRender(<Masters />, { providerProps });
  const comp = screen.getByTestId("masters");
  expect(comp.textContent).toMatch("404");
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

const renderWithData = async (ui, data) => {
  setMockFetch(data);
  await act(async () => {
    await customRender(ui, { providerProps });
  });
};

const testParent = ({
  testId,
  name,
  ui,
  allRenderTextMatch,
  data,
  addConflictValue,
  inputSelector,
  addBtnSelector,
  editBtnSelector,
  clearFormBtnSelector,
  dltBtnSelector,
}) => {
  describe(name, () => {
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

      await renderWithData(ui, data);
    });

    test("Fails to load", async () => {
      setMockFailFetch();
      await act(async () => {
        await customRender(ui, { providerProps });
      });
    });
    test("Renders All Parents", async () => {
      const categories = screen.getByTestId(testId);
      expect(categories.textContent).toMatch(allRenderTextMatch);
    });

    test("Add success", async () => {
      let input = document.querySelector(inputSelector);

      userEvent.type(input, "hello world");

      let addBtn = document.querySelector(addBtnSelector);
      expect(addBtn.textContent).toMatch("Add");

      setMockFetch({
        id: 13,
        name: "hello world",
      });
      await act(async () => {
        await fireEvent.click(addBtn);
      });
    });
    test("Add fail", async () => {
      let addBtn = document.querySelector(addBtnSelector);

      let input = document.querySelector(inputSelector);
      userEvent.type(input, "new");

      setMockFailFetch();
      await act(async () => {
        await fireEvent.click(addBtn);
      });
    });
    test("Add conflict", async () => {
      let addBtn = document.querySelector(addBtnSelector);

      let input = document.querySelector(inputSelector);
      userEvent.type(input, addConflictValue);
      expect(input.value).toBe(addConflictValue);

      setMockFailFetch();
      await act(async () => {
        await fireEvent.click(addBtn);
      });
    });

    test("Edit & clear", async () => {
      const editBtn = document.querySelector(editBtnSelector);
      await act(async () => {
        await fireEvent.click(editBtn);
      });

      let input = document.querySelector(inputSelector);

      const clearBtn = document.querySelector(clearFormBtnSelector);
      await act(async () => {
        await fireEvent.click(clearBtn);
      });
    });
    test("Edit success", async () => {
      const editBtn = document.querySelector(editBtnSelector);
      await act(async () => {
        await fireEvent.click(editBtn);
      });

      const input = document.querySelector(inputSelector);
      userEvent.type(input, " update");

      let addBtn = document.querySelector(addBtnSelector);
      setMockFetch({
        id: 1,
        name: "Cardiology update",
      });
      await act(async () => {
        await fireEvent.click(addBtn);
      });
    });

    test("Delete", async () => {
      let dltBtn = document.querySelector(dltBtnSelector);
      await act(async () => {
        await fireEvent.click(dltBtn);
      });

      setMockFetch({});
      let modal_yes = screen.getByText("Yes");
      await act(async () => {
        await fireEvent.click(modal_yes);
      });

      await act(async () => {
        await fireEvent.click(dltBtn);
      });

      setMockFetch({}, 204);
      modal_yes = screen.getByText("Yes");
      await act(async () => {
        await fireEvent.click(modal_yes);
      });
    });
  });
};
const testChild = ({ testId, name, ui, data }) => {
  describe(name, () => {
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

      await renderWithData(ui, data);
    });

    test("edit & clear", async () => {
      const editBtn = document.querySelector(
        `div[data-testid="${testId}"] button[title="Edit"]`
      );
      await act(async () => {
        await fireEvent.click(editBtn);
      });
      const clearBtn = document.querySelector(
        `div[data-testid="${testId}"] form button[type="button"]`
      );
      await act(async () => {
        await fireEvent.click(clearBtn);
      });
    });
    test("edit success", async () => {
      const editBtn = document.querySelector(
        `div[data-testid="${testId}"] button[title="Edit"]`
      );
      await act(async () => {
        await fireEvent.click(editBtn);
      });

      const input = document.querySelector(
        `div[data-testid="${testId}"] form input`
      );
      userEvent.type(input, " update");

      let addBtn = document.querySelector(
        `div[data-testid="${testId}"] form button[type="submit"]`
      );
      setMockFailFetch();
      await act(async () => {
        await fireEvent.click(addBtn);
      });

      setMockFetch({
        id: 1,
        name: "Cardiology update",
      });
      await act(async () => {
        await fireEvent.click(addBtn);
      });
    });

    test("Delete", async () => {
      let dltBtn = document.querySelector(
        `div[data-testid="${testId}"] button[title="Delete"]`
      );
      await act(async () => {
        await fireEvent.click(dltBtn);
      });

      setMockFetch({});
      let modal_yes = screen.getByText("Yes");
      await act(async () => {
        await fireEvent.click(modal_yes);
      });

      await act(async () => {
        await fireEvent.click(dltBtn);
      });

      setMockFetch({}, 204);
      modal_yes = screen.getByText("Yes");
      await act(async () => {
        await fireEvent.click(modal_yes);
      });
    });
  });
};

const testParentChild = ({
  parent,
  child,
  ui,
  data,
  allRenderTextMatch,
  addConflictValue,
}) => {
  testParent({
    testId: parent.testId,
    name: parent.name,
    ui,
    allRenderTextMatch,
    data,
    addConflictValue,
    inputSelector: `input[name]`,
    addBtnSelector: `button[type="submit"]`,
    editBtnSelector: `button[title="Edit"]`,
    clearFormBtnSelector: `button[type="button"].btn`,
    dltBtnSelector: `button[title="Delete"]`,
  });
  testChild({
    testId: child.testId,
    name: child.name,
    ui,
    data,
  });
};

testParent({
  testId: "departments",
  name: "Department",
  ui: <Departments />,
  allRenderTextMatch: "NeurologyGynaecology",
  data: {
    _embedded: {
      department: [
        {
          id: 1,
          name: "Cardiology",
        },
        {
          id: 2,
          name: "Neurology",
        },
        {
          id: 4,
          name: "Gynaecology",
        },
      ],
    },
  },
  addConflictValue: "Cardiology",
  inputSelector: `input[name]`,
  addBtnSelector: `button[type="submit"]`,
  editBtnSelector: `button[title="Edit"]`,
  clearFormBtnSelector: `button[type="button"].btn`,
  dltBtnSelector: `button[title="Delete"]`,
});

testParentChild({
  parent: {
    name: "Categories",
    testId: "categories",
  },
  child: {
    name: "Subcategories",
    testId: "subcategories",
  },
  ui: <Categories />,
  data: {
    _embedded: {
      category: [
        {
          id: 4,
          name: "Medication Error",
          subCategorys: [
            {
              id: 12,
              name: "Department3",
              template: 45,
              sentinel: true,
              reportStatus: false,
              status: false,
              reportable: [],
            },
            {
              id: 39,
              name: "asdgasd",
              template: 234,
              sentinel: true,
              reportStatus: false,
              status: true,
              reportable: [],
            },
            {
              id: 18,
              name: "Critical 45",
              template: 454,
              sentinel: true,
              reportStatus: false,
              status: true,
              reportable: [
                {
                  id: 16,
                  reporting_instructions: "asdh asdhgasdh asdh",
                  report_to: 23,
                },
                {
                  id: 14,
                  reporting_instructions: "asdh asdhgasdh asdhasd ghasdhg",
                  report_to: 22,
                },
                {
                  id: 15,
                  reporting_instructions: "asdh asdhgasdh asdh",
                  report_to: 24,
                },
                {
                  id: 13,
                  reporting_instructions: "asdh asdhgasdh asdh",
                  report_to: 25,
                },
              ],
            },
          ],
        },
        {
          id: 5,
          name: "category 2",
          subCategorys: [],
        },
      ],
    },
  },
  allRenderTextMatch: "Medication Errorcategory 2",
  addConflictValue: "Medication Error",
});
describe("Reportable test", () => {
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
      id: 10,
      name: "Report to",
      twoFieldMasterDetails: [
        {
          id: 22,
          name: "Person 1",
          showToggle: false,
        },
        {
          id: 23,
          name: "Person 2",
          showToggle: true,
        },
      ],
    });
    await act(async () => {
      await customRender(
        <ReportableForm
          categoryId={4}
          subCategoryId={18}
          _reportables={[
            {
              id: 16,
              reporting_instructions: "asdh asdhgasdh asdh",
              report_to: 23,
            },
            {
              id: 14,
              reporting_instructions: "asdh asdhgasdh asdhasd ghasdhg",
              report_to: 22,
            },
            {
              id: 15,
              reporting_instructions: "asdh asdhgasdh asdh",
              report_to: 24,
            },
            {
              id: 13,
              reporting_instructions: "asdh asdhgasdh asdh",
              report_to: 25,
            },
          ]}
          setCategories={jest.fn()}
        />,
        { providerProps }
      );
    });
  });

  test("edit & clear", async () => {
    const editBtn = document.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });
    const clearBtn = document.querySelector(`form button[type="button"]`);
    await act(async () => {
      await fireEvent.click(clearBtn);
    });
  });
  test("edit success", async () => {
    const editBtn = document.querySelector(`button[title="Edit"]`);
    await act(async () => {
      await fireEvent.click(editBtn);
    });

    const input = document.querySelector(`form textarea`);
    userEvent.type(input, " update");

    let addBtn = document.querySelector(`form button[type="submit"]`);
    setMockFailFetch();
    await act(async () => {
      await fireEvent.click(addBtn);
    });

    setMockFetch({
      id: 1,
      name: "Person 1 update",
    });
    await act(async () => {
      await fireEvent.click(addBtn);
    });
  });

  test("Delete", async () => {
    let dltBtn = document.querySelector('button[title="Delete"]');
    await act(async () => {
      await fireEvent.click(dltBtn);
    });

    let modal_yes = screen.getByText("Yes");

    setMockFetch({}, 409);
    await act(async () => {
      await fireEvent.click(modal_yes);
    });

    await act(async () => {
      await fireEvent.click(dltBtn);
    });

    modal_yes = screen.getByText("Yes");

    setMockFetch({}, 204);
    await act(async () => {
      await fireEvent.click(modal_yes);
    });
  });
});

testParentChild({
  parent: {
    name: "Contributing Factor",
    testId: "contributingFactor",
  },
  child: {
    name: "Contributing Factor Detail",
    testId: "contributingFactorDetail",
  },
  ui: <ContributingFactor />,
  data: {
    _embedded: {
      contributingFactors: [
        {
          id: 4,
          name: "Parent 1",
          contributingFactorDetails: [
            {
              id: 12,
              name: "Department3",
            },
            {
              id: 39,
              name: "asdgasd",
            },
            {
              id: 18,
              name: "Critical 45",
            },
          ],
        },
        {
          id: 5,
          name: "Parent 2",
          contributingFactorDetails: [],
        },
      ],
    },
  },
  allRenderTextMatch: "Parent 1Parent 2",
  addConflictValue: "Parent 1",
});

testParent({
  testId: "locations",
  name: "Locations",
  ui: <Location />,
  allRenderTextMatch: "Front OfficeLaboratoryICU #2",
  data: {
    _embedded: {
      location: [
        {
          id: 2,
          code: 0,
          name: "Front Office",
          locationType: 32,
          status: true,
        },
        {
          id: 3,
          code: 0,
          name: "ICU #2",
          locationType: 13,
          status: true,
        },
        {
          id: 4,
          code: 0,
          name: "General Ward #2",
          locationType: 13,
          status: true,
        },
      ],
    },
    id: 6,
    name: "Location Type",
    twoFieldMasterDetails: [
      {
        id: 13,
        name: "Type 1",
        showToggle: true,
      },
      {
        id: 14,
        name: "Type 2",
        showToggle: true,
      },
      {
        id: 15,
        name: "Type 3",
        showToggle: true,
      },
      {
        id: 32,
        name: "Laboratory",
        showToggle: true,
      },
    ],
  },
  addConflictValue: "Front Office",
  inputSelector: `input[name]`,
  addBtnSelector: `button[type="submit"]`,
  editBtnSelector: `button[title="Edit"]`,
  clearFormBtnSelector: `button[type="button"].btn`,
  dltBtnSelector: `button[title="Delete"]`,
});

const personAffectedData = {
  _embedded: {
    personAffected: [
      {
        pa_id: 1,
        name: "Person 1",
        show: true,
        personAffectedDetails: [
          {
            id: 2,
            name: "Season",
            show: true,
          },
          {
            id: 3,
            name: "Age",
            show: true,
          },
          {
            id: 4,
            name: "Gender",
            show: true,
          },
        ],
      },
      {
        pa_id: 5,
        name: "Person 2",
        show: true,
        personAffectedDetails: [
          {
            id: 6,
            name: "Medical",
            show: false,
          },
        ],
      },
    ],
  },
};
testParentChild({
  parent: {
    name: "Person Affected",
    testId: "personAffected",
  },
  child: {
    name: "Person Affected Detail",
    testId: "personAffectedDetail",
  },
  ui: <PersonAffected />,
  data: personAffectedData,
  allRenderTextMatch: "Person 1Person 2",
  addConflictValue: "Person 1",
});

testParent({
  testId: "riskAssessment",
  name: "Risk Assessment",
  ui: <Ram />,
  allRenderTextMatch: "Most Likely3857",
  data: {
    _embedded: {
      riskAssement: [
        {
          id: 17,
          likelihood: 20,
          serverity: 40,
          riskscore: 5,
          riskstatus: 8,
          color: "2",
          template: null,
          status: true,
          show: false,
        },
        {
          id: 18,
          likelihood: 35,
          serverity: 38,
          riskscore: 5,
          riskstatus: 7,
          color: "4",
          template: null,
          status: true,
          show: false,
        },
      ],
    },
    id: 9,
    name: "Likelihood",
    twoFieldMasterDetails: [
      {
        id: 20,
        name: "likely",
        showToggle: true,
      },
      {
        id: 21,
        name: "unlikely",
        showToggle: true,
      },
      {
        id: 35,
        name: "Most Likely",
        showToggle: true,
      },
      {
        id: 50,
        name: "Most unlikely",
        showToggle: true,
      },
    ],
  },
  addConflictValue: "",
  inputSelector: `input[name]`,
  addBtnSelector: `button[type="submit"]`,
  editBtnSelector: `button[title="Edit"]`,
  clearFormBtnSelector: `button[type="button"].btn`,
  dltBtnSelector: `button[title="Delete"]`,
});

testParentChild({
  parent: {
    name: "RCA",
    testId: "rca",
  },
  child: {
    name: "RCA detail",
    testId: "rcaDetail",
  },
  ui: <Rca />,
  data: {
    _embedded: {
      rca: [
        {
          id: 4,
          name: "Parent 1",
          rcaCauses: [
            {
              id: 12,
              name: "Department3",
            },
            {
              id: 39,
              name: "asdgasd",
            },
            {
              id: 18,
              name: "Critical 45",
            },
          ],
        },
        {
          id: 5,
          name: "Parent 2",
          rcaCauses: [],
        },
      ],
    },
  },
  allRenderTextMatch: "Parent 1Parent 2",
  addConflictValue: "Parent 1",
});

testParentChild({
  parent: {
    name: "Two Field Master",
    testId: "twoFieldMasters",
  },
  child: {
    name: "Two Field Master Detail",
    testId: "twoFieldMasterDetails",
  },
  ui: <TwoFieldMaster />,
  data: {
    _embedded: {
      twoFieldMaster: [
        {
          id: 4,
          name: "Parent 1",
          twoFieldMasterDetails: [
            {
              id: 12,
              name: "Department3",
            },
            {
              id: 39,
              name: "asdgasd",
            },
            {
              id: 18,
              name: "Critical 45",
            },
          ],
        },
        {
          id: 5,
          name: "Parent 2",
          twoFieldMasterDetails: [],
        },
      ],
    },
  },
  allRenderTextMatch: "Parent 1Parent 2",
  addConflictValue: "Parent 1",
});

const userData = {
  _embedded: {
    user: [
      {
        id: 9,
        name: "Sunny",
        gender: "male",
        dob: "1996-10-03T00:00:00.000+05:30",
        employeeId: "13145",
        contact: "9955414157",
        email: "abc@abc.com",
        department: 5,
        role: "2,4",
      },
      {
        id: 10,
        name: "Suresh Mallela",
        gender: "male",
        dob: "1998-01-04T00:00:00.000+05:30",
        employeeId: "53535",
        contact: "9988761616",
        email: "abc1@abc.com",
        department: 1,
        role: "4,2",
      },
      {
        id: 11,
        name: "Vishnu Reddy",
        gender: "male",
        dob: "1995-10-04T00:00:00.000+05:30",
        employeeId: "1234",
        contact: "997766518",
        email: "abc@@abc.com",
        department: 2,
        role: "2",
      },
    ],
    department: [
      {
        id: 1,
        name: "Cardiology",
      },
      {
        id: 2,
        name: "Neurology",
      },
      {
        id: 5,
        name: "Paediatrics",
      },
    ],
  },
};
testParent({
  testId: "users",
  name: "Users",
  ui: <User />,
  allRenderTextMatch: "SunnyMale03/10/1996131459955414157abc@abc.com",
  data: userData,
  addConflictValue: "Sunny",
  inputSelector: `input[name]`,
  addBtnSelector: `button[type="submit"]`,
  editBtnSelector: `button[title="Edit"]`,
  clearFormBtnSelector: `button[type="button"].btn`,
  dltBtnSelector: `button[title="Delete"]`,
});
describe("User Master more", () => {
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
    await renderWithData(<User />, userData);
  });

  test("Add from HIS", async () => {
    const input = document.querySelector(`header .btn.secondary`);
    await act(async () => {
      await userEvent.click(input);
    });
  });

  test("Search for user success", async () => {
    const input = document.querySelector("table input");

    setMockFetch(userData);

    await act(async () => {
      await userEvent.type(input, "sunn");
    });

    const optionOne = document.querySelector(`.modal .options li`);

    await act(async () => {
      await userEvent.click(optionOne);
    });
  });
  test("Search for user fail", async () => {
    const input = document.querySelector("table input");

    setMockFailFetch();

    await act(async () => {
      await userEvent.type(input, "sunn");
    });

    const h3 = document.querySelector(`h3`);

    await act(async () => {
      await userEvent.click(h3);
    });
  });

  test("Search for email fail", async () => {
    const input = document.querySelector(`input[name="email"]`);

    await act(async () => {
      await userEvent.type(input, "abc");
    });

    const optionOne = document.querySelector(`.modal .options li`);

    await act(async () => {
      await userEvent.click(optionOne);
    });
  });

  test("Search for email success", async () => {
    const input = document.querySelector(`input[name="email"]`);

    setMockFetch(userData);

    await act(async () => {
      await userEvent.type(input, "abcasdfasdf");
    });

    const h3 = document.querySelector(`h3`);

    await act(async () => {
      await userEvent.click(h3);
    });
  });

  test("Search for contact", async () => {
    const input = document.querySelector(`input[name="contact"]`);

    setMockFetch(userData);

    await act(async () => {
      await userEvent.type(input, "+8801989479749");
    });

    const h3 = document.querySelector(`h3`);

    await act(async () => {
      await userEvent.click(h3);
    });
  });

  test("Search for role", async () => {
    const input = document.querySelector(`input[name="role"]`);

    await act(async () => {
      await userEvent.click(input);
    });

    await act(async () => {
      await userEvent.type(input, `{arrowdown}{arrowup}{space}`);
    });

    const optionOne = document.querySelector(`.modal .options li`);

    await act(async () => {
      await userEvent.click(optionOne);
    });

    const h3 = document.querySelector(`h3`);

    await act(async () => {
      await userEvent.click(h3);
    });
  });
});

describe("IR Code Configuration", () => {
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
        sequence: [
          {
            id: 12,
            irCode: 234,
            period: "/MM",
            prefix: "NAP",
            suffix: "PR",
            receed: 2,
            sequence: "3,1,5,2",
          },
        ],
      },
    });
    await act(async () => {
      await customRender(<IrConfig />, { providerProps });
    });
  });

  test("Render", async () => {
    const comp = screen.getByTestId("irCodeConfig");
    expect(comp.textContent).toMatch("IR CODE CONFIGURATION");

    const saveBtn = screen.getByText("Save");
    setMockFailFetch();
    await act(async () => {
      await fireEvent.click(saveBtn);
    });

    setMockFetch({
      id: 12,
      irCode: 234,
      period: "/MM",
      prefix: "NAP",
      suffix: "PR",
      receed: 2,
      sequence: "3,1,5,2",
    });
    await act(async () => {
      await fireEvent.click(saveBtn);
    });

    setMockFetch({});
    await act(async () => {
      await fireEvent.click(saveBtn);
    });
  });

  test("Fail to load", async () => {
    setMockFailFetch();
    await act(async () => {
      await customRender(<IrConfig />, { providerProps });
    });
  });
});
