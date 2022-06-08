import { moment } from "../components/elements";

export default {
  incidentReport: "/incidentReport",
  irPreview: "/irPreview",
  incidentDashboard: {
    basePath: "/incidentDashboard",
    myDashboard: "myDashboard",
    qualityDashboard: "qualityDashboard",
    irInvestigation: {
      basePath: ":irId/irInvestigation",
      reportedIr: {
        basePath: "reportedIr",
      },
      irApproval: {
        basePath: "irApproval",
      },
      investigation: {
        basePath: "investigation",
        irInput: "irInput",
        irDetails: "irDetails",
        irRca: "irRca",
      },
    },
  },
  irQueryDashboard: "/irQueryDashboard",
  capaReport: "/capaReport",
  reports: "/reports",
  irConfig: {
    basePath: "/irConfiguration",
    mainConfig: "mainConfig",
    userPermission: "userPermission",
    irDataAnalytics: "irDataAnalytics",
  },
  masters: {
    basePath: "/masters",
    location: "location",
    department: "department",
    category: "categoryAndSubCategory",
    userMaster: "userMaster",
    riskAssessment: "riskAssessment",
    personAffected: "personAffected",
    twoFieldMaster: "twoFieldMaster",
    contributingFactor: "contributingFactor",
    rca: "rca",
    irCodeConfig: "irCodeConfig",
  },
};