import ReactDOM from "react-dom";
import IrQueryDashboard from "./IrQueryDashboard";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  getByTestId,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SiteContext, IrDashboardContext } from "../SiteContext";
import userEvent from "@testing-library/user-event";

const customRender = async (ui, { providerProps, ...renderOptions }) => {
  return await act(async () => {
    await render(
      <BrowserRouter>
        <SiteContext.Provider value={providerProps}>
          <IrDashboardContext.Provider
            value={{
              irConfig: { hodAcknowledgement: true },
              count: {},
              setDashboard: jest.fn(),
              parameters: {
                locations: [
                  { label: 1, value: "Loc 1" },
                  { label: 2, value: "Loc 2" },
                  { label: 3, value: "Loc 3" },
                ],
                categories: [
                  {
                    id: 1,
                    name: "Cat 1",
                    subCategorys: [
                      {
                        id: 1,
                        name: "Sub Cat 1",
                        reportable: [{ id: 2, description: "sdfasdf" }],
                      },
                      {
                        id: 3,
                        name: "Other",
                        reportable: [],
                      },
                    ],
                  },
                  {
                    id: 2,
                    name: "Cat 2",
                    subCategorys: [
                      {
                        id: 1,
                        name: "Other",
                        reportable: [],
                      },
                    ],
                  },
                ],
                users: [
                  { label: 1, value: "User 1" },
                  { label: 2, value: "User 2" },
                  { label: 3, value: "User 3" },
                ],
                investigators: [
                  { label: 1, value: "User 1", assignedIr: 2 },
                  { label: 2, value: "User 2", assignedIr: 4 },
                  { label: 3, value: "User 3", assignedIr: 8 },
                ],
              },
              irScreenDetails: [],
              tatConfig: {},
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

const setMockFetch = (data, status) => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue(data),
    status: status || 200,
  });
};
const setMockFailFetch = () => {
  jest.spyOn(global, "fetch").mockResolvedValue();
};

const irData = {
  _embedded: {
    IncidentReport: [
      {
        id: 1,
        actionTaken: [],
        witness: [],
        notification: [],
        upload: [],
        sequence: "002 /02/2022 IR NAP",
        status: "2",
        department: "1",
        userDept: null,
        userId: 6,
        irInvestigator: null,
        capturedBy: null,
        reportingDate: "2022-02-16T15:23:35.763+05:30",
        irStatusDetails: [
          {
            id: 1,
            status: 2,
            dateTime: "2022-02-16T15:18:16.084+05:30",
            userid: 6,
          },
        ],
        templateData: [],
        irHodAck: [
          {
            id: 1,
            remarks: "remarks",
            responseBy: "responseBy",
            userId: 1,
            responseOn: "2017-01-23T00:00:00.000+05:30",
          },
          {
            id: 20091,
            remarks: "remarks",
            responseBy: "responseBy",
            userId: 1,
            responseOn: "2017-01-23T00:00:00.000+05:30",
          },
        ],
        reqInput: [
          {
            id: 10017,
            deptId: 1,
            userId: 1,
            irInfo: "irInfo",
            copyPrev: "copyPrev",
            description: "description",
            deptInv: "deptInv",
            personAff: "personAff",
            subcateg: "subcateg",
            queryDateTime: "2017-01-23T00:00:00.000+05:30",
            query: null,
            queryRaisedBy: 0,
          },
        ],
        recordInput: [],
        responseIrInput: [
          {
            id: 10017,
            reqId: 10017,
            response: "final test",
            upload: "",
            responseBy: 15,
            responseOn: "2022-05-09T16:04:50.814+05:30",
            deptId: 2,
            fileName: null,
          },
        ],
        irInvestigation: [],
        location: 1,
        incident_Date_Time: "2022-02-16T03:18:00.000+05:30",
        locationDetailsEntry: "",
        patientYesOrNo: false,
        patientname: null,
        complaIntegerDatetime: null,
        complaIntegerIdEntry: null,
        typeofInci: 1,
        inciCateg: 1,
        inciSubCat: 1,
        template: null,
        personAffected: null,
        inciDescription: "Test",
        deptsLookupMultiselect: "1",
        contribFactorYesOrNo: null,
        preventability: null,
        incidentReportedDept: null,
        headofDepart: 6,
        actionTakens: [],
        contribFactor: null,
        _links: {
          self: {
            href: "http://139.59.44.254:8080/IncidentReport/1",
          },
          incidentReport: {
            href: "http://139.59.44.254:8080/IncidentReport/1",
          },
        },
      },
      {
        id: 6,
        actionTaken: [
          {
            id: 5,
            immedActionTaken: "dfgdf",
            accessTakenBy: 6,
            accessDateTime: "2022-02-16T18:41:00.000+05:30",
          },
        ],
        witness: [
          {
            id: 4,
            witnessName: 6,
            witnessDept: 1,
            witnessDateTime: null,
          },
        ],
        notification: [
          {
            id: 4,
            name: 6,
            dept: 1,
            notificationDateTime: "2022-02-16T18:42:00.000+05:30",
          },
        ],
        upload: [],
        sequence: "005 /02/2022 IR NAP",
        status: "11",
        department: "2",
        userDept: null,
        userId: 15,
        irInvestigator: 6,
        capturedBy: null,
        reportingDate: "2022-02-16T18:40:26.091+05:30",
        irStatusDetails: [
          {
            id: 13,
            status: 3,
            dateTime: "2022-02-17T16:58:06.343+05:30",
            userid: 16,
          },
          {
            id: 12,
            status: 3,
            dateTime: "2022-02-17T17:06:47.229+05:30",
            userid: 6,
          },
          {
            id: 6,
            status: 2,
            dateTime: "2022-02-16T18:42:19.436+05:30",
            userid: 15,
          },
          {
            id: 5,
            status: 11,
            dateTime: "2022-06-21T15:45:57.951+05:30",
            userid: 15,
          },
          {
            id: 22879,
            status: 3,
            dateTime: "2022-02-16T18:49:32.245+05:30",
            userid: 6,
          },
        ],
        templateData: [],
        irHodAck: [],
        reqInput: [],
        recordInput: [],
        responseIrInput: [],
        irInvestigation: [],
        location: 1,
        incident_Date_Time: "2022-02-16T06:40:00.000+05:30",
        locationDetailsEntry: "dsfds",
        patientYesOrNo: false,
        patientname: null,
        complaIntegerDatetime: null,
        complaIntegerIdEntry: null,
        typeofInci: 8,
        inciCateg: 2,
        inciSubCat: 2,
        template: null,
        personAffected: null,
        inciDescription: "dfgdfg",
        deptsLookupMultiselect: "102",
        contribFactorYesOrNo: null,
        preventability: 3,
        incidentReportedDept: null,
        headofDepart: 15,
        actionTakens: [
          {
            id: 5,
            immedActionTaken: "dfgdf",
            accessTakenBy: 6,
            accessDateTime: "2022-02-16T18:41:00.000+05:30",
          },
        ],
        contribFactor: null,
        _links: {
          self: {
            href: "http://139.59.44.254:8080/IncidentReport/6",
          },
          incidentReport: {
            href: "http://139.59.44.254:8080/IncidentReport/6",
          },
        },
      },
      {
        id: 24,
        actionTaken: [
          {
            id: 21,
            immedActionTaken: "no action",
            accessTakenBy: 6,
            accessDateTime: "2021-03-15T05:20:00.000+05:30",
          },
        ],
        witness: [
          {
            id: 7,
            witnessName: 6,
            witnessDept: 1,
            witnessDateTime: null,
          },
        ],
        notification: [
          {
            id: 6,
            name: 6,
            dept: 1,
            notificationDateTime: "2021-01-14T01:55:00.000+05:30",
          },
        ],
        upload: [],
        sequence: "6588 /02/2022 IR NAP",
        status: "2",
        department: "1",
        userDept: null,
        userId: 6,
        irInvestigator: null,
        capturedBy: null,
        reportingDate: "2022-02-17T19:48:40.656+05:30",
        irStatusDetails: [
          {
            id: 12655,
            status: 2,
            dateTime: "2022-02-23T20:13:42.315+05:30",
            userid: 6,
          },
        ],
        templateData: [],
        irHodAck: [],
        reqInput: [],
        recordInput: [],
        responseIrInput: [],
        irInvestigation: [],
        location: 1,
        incident_Date_Time: "2022-02-12T18:39:00.000+05:30",
        locationDetailsEntry: "nil",
        patientYesOrNo: true,
        patientname: "Max",
        complaIntegerDatetime: "2022-02-10T04:50:00.000+05:30",
        complaIntegerIdEntry: "1524",
        typeofInci: 8,
        inciCateg: 1,
        inciSubCat: 1,
        template: null,
        personAffected: null,
        inciDescription: "Immediate death",
        deptsLookupMultiselect: "4",
        contribFactorYesOrNo: null,
        preventability: 3,
        incidentReportedDept: null,
        headofDepart: 6,
        actionTakens: [
          {
            id: 21,
            immedActionTaken: "no action",
            accessTakenBy: 6,
            accessDateTime: "2021-03-15T05:20:00.000+05:30",
          },
        ],
        contribFactor: null,
        _links: {
          self: {
            href: "http://139.59.44.254:8080/IncidentReport/24",
          },
          incidentReport: {
            href: "http://139.59.44.254:8080/IncidentReport/24",
          },
        },
      },
    ],
  },
  data: [
    {
      id: 12816,
      incident_Date_Time: "2022-04-28T13:47:00.000+05:30",
      status: "11",
      department: "2",
      userDept: "",
      userId: 15,
      irInvestigator: 332,
      capturedBy: null,
      reportingDate: "2022-04-28T13:48:23.152+05:30",
      ReqInputId: 10019,
      deptId: 1,
      irInfo: null,
      copyPrev: null,
      description: "TEST UAT",
      deptInv: null,
      personAff: null,
      subcateg: null,
      queryDateTime: "2022-05-09T09:22:41.774+05:30",
      query: null,
      queryRaisedBy: 0,
      sequence: "375 /2022 CONFIG CODE",
      responseIrInput: {
        id: 10015,
        reqId: 10019,
        response: "asdgasdgasd",
        upload: "",
        responseBy: 15,
        responseOn: "2022-05-09T16:01:14.185+05:30",
        deptId: 2,
        fileName: null,
      },
      location: 7,
      locationDetailsEntry: "",
      patientYesOrNo: null,
      patientname: "",
      complaIntegerDatetime: null,
      complaIntegerIdEntry: null,
      typeofInci: 7,
      inciCateg: 1,
      inciSubCat: 17,
      template: null,
      personAffected: null,
      inciDescription: "TEST UAT",
      deptsLookupMultiselect: "101,103",
      contribFactorYesOrNo: null,
      preventability: null,
      incidentReportedDept: null,
      headofDepart: null,
      contribFactor: null,
      reqInputId: 10019,
    },
    {
      id: 12813,
      incident_Date_Time: "2021-11-02T18:39:00.000+05:30",
      status: "11",
      department: null,
      userDept: "",
      userId: null,
      irInvestigator: null,
      capturedBy: null,
      reportingDate: "2022-04-27T21:35:52.909+05:30",
      ReqInputId: 20020,
      deptId: 2,
      irInfo: null,
      copyPrev: null,
      description: "DescriptionAK",
      deptInv: null,
      personAff: null,
      subcateg: null,
      queryDateTime: "2022-05-09T13:04:35.020+05:30",
      query: "test query",
      queryRaisedBy: 0,
      sequence: "373 /2022 CONFIG CODE",
      responseIrInput: {
        id: 10031,
        reqId: 20020,
        response: "reposenassdf",
        upload: "",
        responseBy: 15,
        responseOn: "2022-07-02T19:52:22.415+05:30",
        deptId: 2,
        fileName: "",
      },
      location: 3,
      locationDetailsEntry: "Location Details AK",
      patientYesOrNo: true,
      patientname: "EMR210000000690",
      complaIntegerDatetime: "2021-11-02T18:39:00.000+05:30",
      complaIntegerIdEntry: "001",
      typeofInci: 1,
      inciCateg: 2,
      inciSubCat: 2,
      template: null,
      personAffected: null,
      inciDescription: "DescriptionAK",
      deptsLookupMultiselect: "102",
      contribFactorYesOrNo: null,
      preventability: 1,
      incidentReportedDept: null,
      headofDepart: null,
      contribFactor: null,
      reqInputId: 20020,
    },
    {
      id: 12775,
      incident_Date_Time: "2022-04-18T19:37:00.000+05:30",
      status: "11",
      department: "2",
      userDept: "",
      userId: 15,
      irInvestigator: null,
      capturedBy: null,
      reportingDate: "2022-04-23T18:38:07.312+05:30",
      ReqInputId: 20026,
      deptId: 6,
      irInfo: null,
      copyPrev: null,
      description: "Test description",
      deptInv: "",
      personAff: "",
      subcateg: null,
      queryDateTime: "2022-05-30T15:14:02.274+05:30",
      query: "Test query",
      queryRaisedBy: 15,
      sequence: "376 /2022 CONFIG CODE",
      responseIrInput: null,
      location: 29,
      locationDetailsEntry: "",
      patientYesOrNo: false,
      patientname: "",
      complaIntegerDatetime: null,
      complaIntegerIdEntry: "",
      typeofInci: 2,
      inciCateg: 3,
      inciSubCat: 8,
      template: null,
      personAffected: null,
      inciDescription: "Test description",
      deptsLookupMultiselect: "1,6,7",
      contribFactorYesOrNo: null,
      preventability: null,
      incidentReportedDept: null,
      headofDepart: 15,
      contribFactor: null,
      reqInputId: 20026,
    },
  ],
};
const singleIr = {
  id: 61,
  actionTaken: [
    {
      id: 40,
      immedActionTaken: "es",
      accessTakenBy: 6,
      accessDateTime: "2022-02-09T13:22:00.000+05:30",
    },
  ],
  witness: [
    {
      id: 29,
      witnessName: 6,
      witnessDept: 1,
      witnessDateTime: null,
    },
  ],
  notification: [
    {
      id: 17,
      name: 6,
      dept: 1,
      notificationDateTime: "2022-02-20T13:22:00.000+05:30",
    },
  ],
  upload: [],
  sequence: "038 /02/2022 IR NAP",
  status: "3",
  department: "1",
  userDept: "",
  userId: 6,
  irInvestigator: 6,
  capturedBy: null,
  reportingDate: "2022-02-20T13:22:57.278+05:30",
  irStatusDetails: [
    {
      id: 51,
      status: 3,
      dateTime: "2022-02-20T17:29:06.682+05:30",
      userid: 6,
    },
    {
      id: 53,
      status: 2,
      dateTime: "2022-02-20T13:23:03.774+05:30",
      userid: 6,
    },
  ],
  location: 2,
  template: null,
  actionTakens: [
    {
      id: 40,
      immedActionTaken: "es",
      accessTakenBy: 6,
      accessDateTime: "2022-02-09T13:22:00.000+05:30",
    },
  ],
  incident_Date_Time: "2022-02-20T13:21:00.000+05:30",
  locationDetailsEntry: "weg",
  patientYesOrNo: null,
  patientname: "",
  complaIntegerDatetime: null,
  complaIntegerIdEntry: null,
  typeofInci: 1,
  inciCateg: 1,
  inciSubCat: 6,
  personAffected: null,
  inciDescription: "kludsrf xxgh",
  deptsLookupMultiselect: "",
  contribFactorYesOrNo: null,
  contribFactor: null,
  preventability: 2,
  incidentReportedDept: null,
  headofDepart: 6,
};

describe("IR Dashboard", () => {
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

    const providerProps = {
      irTypes: [],
      user: {
        id: 10,
        name: "Test User",
        role: [
          "incidentManager",
          "irInvestigator",
          "irAdmin",
          "hod",
          "incidentReporter",
        ],
      },
      endpoints: {
        locations: "http://endpoints.com/locations",
        users: "http://endpoints.com/users",
        departments: "http://endpoints.com/departments",
      },
      checkPermission: () => true,
    };
    setMockFetch(irData);
    await customRender(<IrQueryDashboard />, { providerProps });
  });

  test("Render", async () => {
    const clearBtn = document.querySelector("form button[type='button']");
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    const irCodeInput = document.querySelector("form input");
    userEvent.type(irCodeInput, "22");

    const searchBtn = document.querySelector("form button");
    await act(async () => {
      await fireEvent.click(searchBtn);
    });
  });

  test("render with only data", async () => {
    setMockFetch(irData.data);
    const clearBtn = document.querySelector("form button[type='button']");
    await act(async () => {
      await fireEvent.click(clearBtn);
    });

    const irCodeInput = document.querySelector("form input");
    userEvent.type(irCodeInput, "22");
    const clrBtn = document.querySelectorAll("button.clear[title='Response']");
    // await act(async () => {
    //   await fireEvent.click(clrBtn[1]);
    //   expect(screen.getByText('Please provide inputs on this incident.')).toBeInTheDocument();
    // });
  });
});
