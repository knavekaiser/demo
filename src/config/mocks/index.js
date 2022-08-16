export const mockData = {
    _embedded: {
      reqInput: [
        {
          id: 1,
          deptId: 2,
          userId: 17,
          irInfo: null,
          copyPrev: "",
          description: "NA",
          deptInv: "",
          personAff: "",
          subcateg: null,
          queryDateTime: "2022-06-08T15:02:41.756+05:30",
          query: "document pls",
          queryRaisedBy: 332,
        },
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
        {
          id: 10018,
          deptId: 2,
          userId: 17,
          irInfo: null,
          copyPrev: null,
          description: "TEST UAT",
          deptInv: null,
          personAff: null,
          subcateg: null,
          queryDateTime: "2022-05-09T17:22:43.326+05:30",
          query: "Venkat new req",
          queryRaisedBy: 15,
        },
      ],
      recordInput: [
        {
          id: 4,
          source: 0,
          responseFrom: "asd fasd",
          recdOn: "2022-04-23T11:11:00.000+05:30",
          response: "asdg asdgasgd asdg",
          upload:
            "http://139.59.44.254:8080/uploads/b116c420-3f5d-4ccf-8f47-47a2e65b4b4a.jpg",
          fileName: null,
          dept: 0,
        },
        {
          id: 5,
          source: 0,
          responseFrom: "as dgasdg sdg",
          recdOn: "2022-04-18T11:09:00.000+05:30",
          response: "asdfasdgasgd",
          upload: null,
          fileName: null,
          dept: 0,
        },
        {
          id: 6,
          source: 0,
          responseFrom: "asdga sdgas",
          recdOn: "2022-04-26T09:29:00.000+05:30",
          response: "as dgasgd sdg",
          upload:
            "http://139.59.44.254:8080/uploads/7f3ed5ae-08b9-4ccb-871b-265ca6b5cc6f.png",
          fileName: null,
          dept: 0,
        },
      ],
      user: [
        {
          id: 6,
          name: "admin",
          gender: "male",
          dob: null,
          employeeId: "111",
          contact: "+919999999999",
          email: null,
          department: 1,
          role: "7,1,2",
          country: null,
          dbSchema: null,
          username: "admin",
          grantedAuthoritiesList: [],
          designation: "some designation",
        },
        {
          id: 15,
          name: "yashtech",
          gender: "male",
          dob: null,
          employeeId: "7687",
          contact: null,
          email: null,
          department: 2,
          role: "7,4,1,9,2",
          country: null,
          dbSchema: null,
          username: "yashtech",
          grantedAuthoritiesList: [],
          designation: "some designation",
        },
        {
          id: 17,
          name: "venkatc",
          gender: "male",
          dob: null,
          employeeId: "980",
          contact: "",
          email: "venkatch",
          department: 2,
          role: "4,1,2",
          country: null,
          dbSchema: null,
          username: "venkatc",
          grantedAuthoritiesList: [],
          designation: "some designation",
        },
      ],
      department: [
        { id: 1, name: "Dept1" },
        { id: 2, name: "Client" },
        { id: 4, name: "lab" },
        { id: 5, name: "aa" },
      ],
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
      rca: [
        {
          id: 3,
          name: "People",
          show: true,
          rcaCauses: [
            {
              id: 3,
              name: "Secretary",
            },
            {
              id: 4,
              name: "Escort",
            },
            {
              id: 5,
              name: "Pholebotomist",
            },
          ],
        },
        {
          id: 4,
          name: "Environment",
          show: true,
          rcaCauses: [
            {
              id: 6,
              name: "Clocks",
            },
            {
              id: 7,
              name: "Rounding",
            },
          ],
        },
        {
          id: 5,
          name: "Material",
          show: true,
          rcaCauses: [
            {
              id: 8,
              name: "Lab Supplies",
            },
            {
              id: 9,
              name: "Specimen",
            },
          ],
        },
        {
          id: 13,
          name: "Methods",
          show: true,
          rcaCauses: [
            {
              id: 10,
              name: "Too many people Involved",
            },
            {
              id: 11,
              name: "Handling in lab",
            },
            {
              id: 12,
              name: "Escort Stopped Other places",
            },
            {
              id: 13,
              name: "Unnecessary steps",
            },
            {
              id: 14,
              name: "Lab not following FIFO",
            },
          ],
        },
        {
          id: 14,
          name: "Equipment",
          show: true,
          rcaCauses: [
            {
              id: 17,
              name: "Broken",
            },
          ],
        },
        {
          id: 15,
          name: "passwd",
          show: true,
          rcaCauses: [],
        },
      ],
      category: [
        {
          id: 1,
          name: "Medication Errors",
          subCategorys: [
            {
              id: 1,
              name: "Other",
              template: 0,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
            {
              id: 6,
              name: "Sub Cat1",
              template: 1,
              sentinel: false,
              reportStatus: true,
              status: true,
              reportable: [
                {
                  id: 1,
                  reporting_instructions: "this is the report",
                  report_to: 6,
                },
              ],
            },
            {
              id: 4,
              name: "cat 1 sub 3",
              template: 21,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
          ],
        },
        {
          id: 2,
          name: "Medical",
          subCategorys: [
            {
              id: 2,
              name: "Other",
              template: 0,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
            {
              id: 5,
              name: "sub2",
              template: 43,
              sentinel: true,
              reportStatus: false,
              status: true,
              reportable: [],
            },
            {
              id: 3,
              name: "subb1",
              template: 2434,
              sentinel: false,
              reportStatus: true,
              status: true,
              reportable: [],
            },
            {
              id: 7,
              name: "asdasdg",
              template: 2323,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
          ],
        },
        {
          id: 3,
          name: "Test",
          subCategorys: [
            {
              id: 8,
              name: "Other",
              template: 32,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
          ],
        },
        {
          id: 4,
          name: "New Category",
          subCategorys: [
            {
              id: 9,
              name: "New1",
              template: 1,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
          ],
        },
        {
          id: 5,
          name: "asdg asdg",
          subCategorys: [
            {
              id: 10,
              name: "asd gha",
              template: 232,
              sentinel: false,
              reportStatus: false,
              status: true,
              reportable: [],
            },
          ],
        },
      ],
      inputEvidences: [
        {
            id: 1,
            eviType: 'test',
            eviSource: 'test',
            dateTime: '2021-02-14 12:00:00',
            fileName: 'test',
            upload: 'test'
        }
      ]
    },
    id: 24979,
    actionTaken: [],
    witness: [
      {
        id: 24769,
        witnessName: 6,
        witnessDept: 1,
        witnessDateTime: null,
      },
    ],
    notification: [],
    upload: [],
    sequence: "2162 /08/2022 NAP H",
    status: "4",
    department: "2",
    userDept: "",
    userId: 381,
    irInvestigator: 381,
    capturedBy: null,
    reportingDate: "2022-08-02T11:03:22.539+05:30",
    irStatusDetails: [
      {
        id: 25174,
        status: 2,
        dateTime: "2022-08-02T11:04:13.576+05:30",
        userid: 381,
      },
      {
        id: 25173,
        status: 4,
        dateTime: "2022-08-02T11:11:33.343+05:30",
        userid: 381,
      },
    ],
    templateData: [],
    irHodAck: [
      {
        id: 20147,
        remarks: "approved",
        responseBy: "15",
        userId: 15,
        responseOn: "2022-08-02T11:09:14.740+05:30",
      },
    ],
    reqInput: [
      {
        id: 20129,
        deptId: 1,
        userId: 6,
        irInfo: "description",
        copyPrev: null,
        description: "incident at NS 24",
        deptInv: "",
        personAff: null,
        subcateg: null,
        queryDateTime: "2022-08-02T11:13:04.776+05:30",
        query: "provide the details ",
        queryRaisedBy: 381,
      },
    ],
    recordInput: [
      {
        id: 20078,
        source: 16,
        responseFrom: "ram",
        recdOn: "2022-08-02T11:14:00.000+05:30",
        response: "IR is reported ",
        upload: "",
        fileName: "",
        dept: 2,
      },
    ],
    responseIrInput: [
      {
        id: 10179,
        reqId: 20129,
        response: "NA",
        upload: "",
        responseBy: 6,
        responseOn: "2022-08-02T11:13:26.963+05:30",
        deptId: 1,
        fileName: "",
      },
    ],
    irInvestigation: [
      {
        id: 20098,
        prevSimilar: false,
        riskSeverity: 7,
        riskLikeliHood: 5,
        riskCateg: "High",
        riskIncluded: false,
        riskId: null,
        selfRep: false,
        name: 0,
        dept: 0,
        designaion: null,
        ipsgBreach: false,
        ipsg: 0,
        events: [
          {
            id: 20146,
            irId: 24979,
            details: "Nurse provide the tablet",
            dateTime: "2022-08-01T11:18:00.000+05:30",
            problem: false,
            sequence: 1,
          },
          {
            id: 20145,
            irId: 24979,
            details: "patient adverse effect time",
            dateTime: "2022-08-01T12:45:00.000+05:30",
            problem: false,
            sequence: 2,
          },
        ],
        notes: [
          {
            id: 20093,
            irId: 24979,
            notes: "taken in adition",
            dateTime: "2022-08-02T11:16:00.000+05:30",
          },
        ],
      },
    ],
    location: 7,
    incident_Date_Time: "2022-08-02T10:45:00.000+05:30",
    locationDetailsEntry: "",
    patientYesOrNo: false,
    patientname: "",
    complaIntegerDatetime: null,
    complaIntegerIdEntry: "",
    typeofInci: 2,
    inciCateg: 1,
    inciSubCat: 17,
    template: null,
    personAffected: null,
    inciDescription: "incident at NS 24",
    deptsLookupMultiselect: "",
    contribFactorYesOrNo: null,
    preventability: null,
    incidentReportedDept: null,
    headofDepart: 15,
    actionTakens: [],
    contribFactor: null,
    userDetails: [
      {userName: 'admin'}
    ],
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
    ]
};

export const irContextData = {
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
};

export const setMockFetch = (data, status) => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(data),
      status: status || 200,
    });
};
export const setMockFailFetch = () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error('Invalid Token'));
};

export const providerProps = {
    irTypes: [
      {label: 'test', value: 'test'}
    ],
    user: { id: 10, name: "Test User", role: "1,2,4,7,9" },
    endpoints: {
      locations: "http://endpoints.com/locations",
      users: {
        url: "http://endpoints.com/users",
        key1: "userDetails"
      },
      departments: {
        url: "http://endpoints.com/departments",
        key1: "test"
      },
      patients: {
        url: "http://endpoints.com/patients"
      },
      searchIrs: "http://endpoints.com/searchIrs",
    },
    checkPermission: () => true,
};

export const investigationContext = {
    ir: {
      id: 1,
      irTeam: [
        { dept: 2, designation: "asdfasd", username: 1 },
        { dept: 2233, designation: "asdfasd", username: 10 },
      ],
      rcaTeam: [
          { id: 1, userName: 'test', dept: 2, designation: "asdfasd", action: 'add' },
          { id: 2, userName: 'test 2', dept: 3, designation: "asdfasd", action: 'edit' }
      ],
      capaPlan: [
          {id: 1, actionPlan: 'test', details: 'testing purpose', monitorEff: true, category: 'test'}
      ],
      rcaIdentified: [
          {rootCause: 'test', rcaCat: 1, details: 'testing purpose'}
      ],
      deptsLookupMultiselect: "1",
      irInvestigation: [
        {
          id: 20098,
          prevSimilar: false,
          riskSeverity: 7,
          riskLikeliHood: 5,
          riskCateg: "High",
          riskIncluded: false,
          riskId: null,
          selfRep: false,
          name: 0,
          dept: 0,
          designaion: null,
          ipsgBreach: false,
          ipsg: 0,
          events: [
            {
              id: 20146,
              irId: 24979,
              details: "Nurse provide the tablet",
              dateTime: "2022-08-01T11:18:00.000+05:30",
              problem: false,
              sequence: 1,
            },
            {
              id: 20145,
              irId: 24979,
              details: "patient adverse effect time",
              dateTime: "2022-08-01T12:45:00.000+05:30",
              problem: false,
              sequence: 2,
            },
          ],
          notes: [
            {
              id: 20093,
              irId: 24979,
              notes: "taken in adition",
              dateTime: "2022-08-02T11:16:00.000+05:30",
            },
          ],
        },
      ],
      rcaRootcause: [
        {
            causeCat: 3,
            cause: 3,
            why: 'test'
        }
      ]
    },
};
