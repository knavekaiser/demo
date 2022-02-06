const permissions = [
  {
    role: "irAdmin",
    label: "IR ADMIN",
    permissions: {
      "IR Master": false,
      "IR Configuration": false,
    },
  },
  {
    role: "incidentReporter",
    label: "INCIDNET REPORTER",
    permissions: {
      "Incident Reporting": false,
      "View access to reported incident by self": false,
      "View Access to Root cause analysis tab": false,
      "View Access to CAPA tab": false,
      "View Access to IR closure tab": false,
      "Incident closure dashboard": false,
      "CAPA dashboard - access and update CAPA's marked reponsible for": false,
      "Print Reported IR's": false,
    },
  },
  {
    role: "irInvestigator",
    label: "IR INVESTIGATOR",
    permissions: {
      "Access to view IR's": false,
      "Merge IRs": false,
      "Cancel IRs": false,
      "Update IR investigation for assigned IRs": false,
      "CAPA Dashboard - Update CAPA for assigned IRs": false,
      "CAPA Dashboard - access and update CAPA's marked responsible for": false,
      "Update IR Closure": false,
      "Recity IR information for assigned IR": false,
      "Update Reportable incident information": false,
      "Add addendum": false,
      "IR Analytics": false,
      "Custom Reports": false,
      Print: false,
    },
  },
  {
    role: "incidentManager",
    label: "INCIDENT MANAGER",
    permissions: {
      "Approve IRs": false,
      "Cancel IRs": false,
      "Assign IRs": false,
      "Merge IRs": false,
      "CAPA dashboard - Access for CAPA's of all IRs": false,
      "IR Analytics": false,
      "Custom Reports": false,
      Print: false,
    },
  },
  {
    role: "hod",
    label: "HEAD OF THE DEPARTMENT",
    permissions: {
      "Approve IRs": false,
      "Acknowledge IRs": false,
      "View Departments IRs": false,
    },
  },
];

export default permissions;
