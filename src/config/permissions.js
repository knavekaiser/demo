const permissions = [
  {
    id: 7,
    role: "incidentManager",
    label: "IR Manager",
    permissions: {
      "Access and update all IRs": false,
      "Quality Dashboard": false,
      Print: {
        "Reported IR": false,
        "IR Closure Screen": false,
      },
      "Cancel IR": false,
      "Assign IRs": false,
      "Merge IRs": false,
      "CAPA dashboard - Access for CAPA's of all IRs": false,
      "IR Analytics": {
        "Quick Insights": false,
        "Data Analytics": false,
      },
      "Custom Reports": {
        "Monthly IR Reports": false,
        "Injury Reports": false,
        "CAPA Reports": false,
      },
    },
  },
  {
    id: 4,
    role: "irInvestigator",
    label: "IR Investigator",
    permissions: {
      "Access to view IRs in quality dashboard": {
        "Assigned IR": false,
        "All IRs": false,
      },
      "Merge IRs": false,
      "Cancel IR": false,
      "Update IR investigation for assigned IRs": false,
      "CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities": false,
      "Update CAPA tab for assigned IRs": false,
      // "CAPA Dashboard - access and update CAPA's marked responsible for": false,
      "Update IR Closure report for Assigned IRs": false,
      "Re-portable IR for Assigned IRs": false,
      "Rectify IR information for assigned IR": false,
      "Update Reportable incident information": false,
      "Add addendum": false,
      "IR Analytics": {
        "Quick Insights": false,
        "Data Analytics": false,
      },
      "Custom Reports": {
        "Monthly IR Reports": false,
        "Injury Reports": false,
        "CAPA Reports": false,
      },
      Print: {
        "Reported IR": false,
        "IR Closure Screen": false,
      },
    },
  },
  {
    id: 1,
    role: "irAdmin",
    label: "IR Admin",
    permissions: {
      "IR Master": false,
      "IR Configuration": false,
    },
  },
  {
    id: 9,
    role: "hod",
    label: "Head of Department",
    permissions: {
      "Acknowledge IR": false,
      "View Departments IR": false,
    },
  },
  {
    id: 2,
    role: "incidentReporter",
    label: "IR Reporter",
    permissions: {
      "Incident Reporting": false,
      "My Dashboard": false,
      "IR Query Dashboard": false,
      // "View access to reported incident by self": false,
      // "View Access to Root cause analysis tab": false,
      // "View Access to CAPA tab": false,
      "View Access to IR closure tab": false,
      "Incident closure dashboard": false,
      "CAPA dashboard - access and update CAPA's marked reponsible for": false,
      "Print Reported IR's": false,
    },
  },
];

// 7 -> 34, 35, 20, 21, 38, 29, 9, 28, 23, 31, 25 11, 39,
// 4 -> 12, 24, 9, 38, 14, 15, 16, 18, 40, 19, 10, 23, 31, 25, 11, 39, 20, 21
// 1 -> 1, 2
// 9 -> 36, 37
// 2 -> 6, 7, 5, 3, 41, 8, 4
//
// 34	 Access and update all IRs
// 12	 Access to view IRs in quality dashboard -----> has to be edited Assigned IR
// 24	 Access to view IRs in quality dashboardAll IRs
// 36	 Acknowledge IR
// 10	 Add addendum
// 26	 Approve IRs
// 29	 Assign IRs
// 13	 Assigned IR
// 38  Cancel IR <------------
// 8	 CAPA dashboard - access and update CAPA's marked reponsible for
// 28  CAPA dashboard - Access for CAPA's of all IRs
// 15	 CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities
// 25	 Custom ReportsCAPA Reports
// 11	 Custom ReportsInjury Reports
// 39  Custom ReportsCAPA Reports  <------------
// 6	 Incident Reporting
// 2	 IR Configuration
// 23	 IR AnalyticsData Analytics
// 31	 IR AnalyticsQuick Insights
// 1	 IR Master
// 5   IR Query Dashboard
// 9	 Merge IRs
// 7	 My Dashboard
// 4   Print Reported IR's
// 20	 PrintReported IR
// 21	 PrintIR Closure Screen
// 35	 Quality Dashboard
// 18	 Re-portable IR for Assigned IRs
// 40  Rectify IR information for assigned IR  <-----------------
// 16	 Update CAPA tab for assigned IRs
// 14	 Update IR investigation for assigned IRs
// 17	 Update IR Closure report for Assigned IRs
// 19	 Update Reportable incident information
// 3	 View Access to IR closure tab
// 37  View Departments IR
// 41  Incident closure dashboard  <------------------

export default permissions;
