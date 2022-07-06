const permissions = [
  {
    id: 7,
    role: "incidentManager",
    label: "IR Manager",
    permissions: [
      {
        id: 56,
        permission: "Access and update all IRs",
        enable: false,
        readOnly: true,
      },
      {
        id: 57,
        permission: "Quality Dashboard",
        enable: false,
      },
      {
        label: "Print",
        permissions: [
          { id: 58, permission: "Reported IR", enable: false },
          { id: 59, permission: "IR Closure Screen", enable: false },
        ],
      },
      { id: 89, permission: "Cancel IR", enable: false },
      { id: 61, permission: "Assign IRs", enable: false, readOnly: true },
      { id: 62, permission: "Merge IRs", enable: false },
      {
        id: 63,
        permission: "CAPA dashboard - Access for CAPA's of all IRs",
        enable: false,
      },
      {
        label: "IR Analytics",
        permissions: [
          { id: 65, permission: "Quick Insights", enable: false },
          { id: 64, permission: "Data Analytics", enable: false },
        ],
      },
      {
        label: "Custom Reports",
        permissions: [
          { id: 90, permission: "Monthly IR Reports", enable: false },
          { id: 67, permission: "Injury Reports", enable: false },
          { id: 66, permission: "CAPA Reports", enable: false },
        ],
      },
    ],
  },
  {
    id: 4,
    role: "irInvestigator",
    label: "IR Investigator",
    permissions: [
      {
        label: "Access to view IRs in quality dashboard",
        permissions: [
          { id: 69, permission: "Assign IR", enable: false, readOnly: true },
          { id: 70, permission: "All IRs", enable: false },
        ],
      },
      { id: 71, permission: "Merge IRs", enable: false },
      { id: 91, permission: "Cancel IR", enable: false },
      {
        id: 73,
        permission: "Update IR investigation for assigned IRs",
        enable: false,
        readOnly: true,
      },
      {
        id: 74,
        permission:
          "CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities",
        enable: false,
        readOnly: true,
      },
      {
        id: 75,
        permission: "Update CAPA tab for assigned IRs",
        enable: false,
        readOnly: true,
      },
      {
        id: 95,
        permission: "Update IR Closure report for Assigned IRs",
        enable: false,
        readOnly: true,
      },
      {
        id: 76,
        permission: "Re-portable IR for Assigned IRs",
        enable: false,
        readOnly: true,
      },
      {
        id: 92,
        permission: "Rectify IR information for assigned IR",
        enable: false,
      },
      {
        id: 78,
        permission: "Update Reportable incident information",
        enable: false,
      },
      { id: 79, permission: "Add addendum", enable: false, readOnly: true },
      {
        label: "IR Analytics",
        permissions: [
          { id: 81, permission: "Quick Insights", enable: false },
          { id: 80, permission: "Data Analysis", enable: false },
        ],
      },
      {
        label: "Custom Reports",
        permissions: [
          { id: 93, permission: "Monthly IR Reports", enable: false },
          { id: 83, permission: "Injury Reports", enable: false },
          { id: 82, permission: "CAPA Reports", enable: false },
        ],
      },
      {
        label: "Print",
        permissions: [
          { id: 85, permission: "Reported IR", enable: false },
          { id: 86, permission: "IR Closure Screen", enable: false },
        ],
      },
    ],
  },
  {
    id: 1,
    role: "irAdmin",
    label: "IR Admin",
    permissions: [
      { id: 33, permission: "IR Master", enabled: false, readOnly: false },
      {
        id: 46,
        permission: "IR Configuration",
        enabled: false,
        readOnly: false,
      },
    ],
  },
  {
    id: 9,
    role: "hod",
    label: "Head of Department",
    permissions: [
      { id: 47, permission: "Acknowledge IR", enable: true },
      { id: 48, permission: "View Departments IR", enable: true },
    ],
  },
  {
    id: 2,
    role: "incidentReporter",
    label: "IR Reporter",
    permissions: [
      {
        id: 49,
        permission: "Incident Reporting",
        enable: true,
        readOnly: true,
      },
      {
        id: 50,
        permission: "My Dashboard",
        enable: true,
      },
      {
        id: 51,
        permission: "IR Query Dashboard",
        enable: true,
        readOnly: true,
      },
      {
        id: 52,
        permission: "View Access to IR closure tab",
        enable: true,
      },
      { id: 94, permission: "Incident closure dashboard", enabled: false },
      {
        id: 54,
        permission:
          "CAPA dashboard - access and update CAPA's marked reponsible for",
        enable: true,
      },
      {
        id: 55,
        permission: "Print Reported IR's",
        enable: true,
      },
    ],
  },
];

// 7 -> 34, 35, 20, 21, 46, 29, 9, 28, 23, 31, 25 11, 50
// 4 -> 12, 24, 9, 46, 14, 15, 16, 18, 48, 19, 10, 23, 31, 25, 11,  20, 21, 50
// 1 -> 1, 2
// 9 -> 36, 37
// 2 -> 6, 7, 5, 3, 49, 8, 4
//
// 34	 Access and update all IRs
// 12	 Access to view IRs in quality dashboard -----> has to be edited Assigned IR
// 24	 Access to view IRs in quality dashboardAll IRs
// 36	 Acknowledge IR
// 10	 Add addendum
// 26	 Approve IRs
// 29	 Assign IRs
// 13	 Assigned IR
// 46  Cancel IR
// 8	 CAPA dashboard - access and update CAPA's marked reponsible for
// 28  CAPA dashboard - Access for CAPA's of all IRs
// 15	 CAPA Dashboard - Update CAPA for assigned IRs and Re-Assign CAPA activities
// 25	 Custom ReportsCAPA Reports
// 11	 Custom ReportsInjury Reports
// 6	 Incident Reporting
// 2	 IR Configuration
// 23	 IR AnalyticsData Analytics
// 31	 IR AnalyticsQuick Insights
// 1	 IR Master
// 5   IR Query Dashboard
// 9	 Merge IRs
// 50  Monthly IR Reports
// 7	 My Dashboard
// 4   Print Reported IR's
// 20	 PrintReported IR
// 21	 PrintIR Closure Screen
// 35	 Quality Dashboard
// 18	 Re-portable IR for Assigned IRs
// 48  Rectify IR information for assigned IR
// 16	 Update CAPA tab for assigned IRs
// 14	 Update IR investigation for assigned IRs
// 17	 Update IR Closure report for Assigned IRs
// 19	 Update Reportable incident information
// 3	 View Access to IR closure tab
// 37  View Departments IR
// 49  Incident closure dashboard

export default permissions;
