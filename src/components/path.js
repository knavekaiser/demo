import { moment } from "../components/elements";

export default {
  incidentReport: "/incidentReport",
  incidentDashboard: {
    basePath: "/incidentDashboard",
    myDashboard: "myDashboard",
    qualityDashboard: "qualityDashboard",
  },
  capaReport: "/capaReport",
  reports: "/reports",
  irConfig: {
    basePath: "/irConfiguration",
    mainConfig: {
      basePath: "/mainConfig",
      irScreen: "irScreen",
      typeOfIncident: "typeOfIncident",
      sentinelEventNotification: "sentinelEventNotification",
      // notificationContent: "notificationContent",
      hodApprovalProcess: "hodApprovalProcess",
      dashboardDataElements: "dashboardDataElements",
      irClosure: "irClosure",
      acceptableTat: "acceptableTat",
      irInvestigationDetail: "irInvestigationDetail",
    },
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
