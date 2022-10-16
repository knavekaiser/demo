const baseApiUrl = process.env.REACT_APP_HOST;

export default {
  baseApiUrl,
  locations: `${baseApiUrl}/location`,
  categories: `${baseApiUrl}/category`,
  subCategories: `${baseApiUrl}/sub-category`,
  reportables: `${baseApiUrl}/reportable`,
  contributingFactors: `${baseApiUrl}/contributing-factors`,
  contributingFactorDetails: `${baseApiUrl}/contributing-factordetails`,
  twoFieldMasters: `${baseApiUrl}/twofield-master`,
  twoFieldMasterDetails: `${baseApiUrl}/twofield-master-details`,
  users: `${baseApiUrl}/user`,
  searchUserByUsername: `${baseApiUrl}/user/search/findby_username`,
  departments: `${baseApiUrl}/department`,
  riskAssessments: `${baseApiUrl}/risk-assement`,
  rcas: `${baseApiUrl}/rca`,
  personAffecteds: `${baseApiUrl}/person-affected`,
  personAffectedDetails: `${baseApiUrl}/person-affected-details`,
  rcaCauses: `${baseApiUrl}/rca-causes`,

  userPermissions: `${baseApiUrl}/userpermission`,
  userPermission_updateByRole: `${baseApiUrl}/userpermission/search/updatebyrole`,
  rolePermissions: `${baseApiUrl}/rolepermission`,

  uploadFiles: `${baseApiUrl}/upload-multiple-files`,
  apiUrl: `${baseApiUrl}/apiurls`,
  token: `${baseApiUrl}/authenticate`,
  refreshToken: `${baseApiUrl}/refreshtoken`,
  hisToken: `${baseApiUrl}/authenticate/his`,

  incidentReport: `${baseApiUrl}/incidentreport`,
  searchIrs: `${baseApiUrl}/incidentreport/search/bydetails`,
  sequence: `${baseApiUrl}/sequence`,

  countStateDetailByStatus: `${baseApiUrl}/ir-statusdetailscount/search/countbystatus`,
  countIrByStatusAndUserId: `${baseApiUrl}/incidentreport/countbystatusanduserid`,
  countIrByStatus: `${baseApiUrl}/incidentreport/countbystatus`,

  countIrCurrentMonth: `${baseApiUrl}/incidentreport/search/count-currentmonth`,
  countIrByType: `${baseApiUrl}/incidentreport/search/countby-typeofinci`,
  countIrByPatientComplaint: `${baseApiUrl}/incidentreport/search/countby-ispatient`,
  countIrByUserId: `${baseApiUrl}/incidentreport/countbyuserid`,
  countIrByDepartment: `${baseApiUrl}/incidentreport/search/countby-department`,
  countIrByTat: `${baseApiUrl}/ir-statusdetails/search/countbydays`,
  countAnonymousIr: `${baseApiUrl}/incidentreport/getanonymouscount`,

  typesOfIncident: `${baseApiUrl}/configtype-of-incident`,
  configTat: `${baseApiUrl}/config-acceptabletat`,
  dashboardElements: `${baseApiUrl}/dashboardelements`,
  hodApproval: `${baseApiUrl}/config-hodapproval`,
  sentinelNotifications: `${baseApiUrl}/config-sentine-ieventnotification`,
  incidentClosureFields: `${baseApiUrl}/incident-closurefields`,
  configirscreen: `${baseApiUrl}/configirscreen`,
  irInvestigationDetails: `${baseApiUrl}/ir-investigation-details`,

  irHodAck: `${baseApiUrl}/irhod-ack`,

  formTemplates: `https://his19-3-1sit.napierhealthcare.com/napier-componentbuilder/componentbuilder/formData/search`,
  templateData: `${baseApiUrl}/template-data`,

  irQuerySearch: `${baseApiUrl}/incidentreport/ir-querysearch`,

  investigationEvents: `${baseApiUrl}/events`,
  investigationNotes: `${baseApiUrl}/notes`,
  evidences: `${baseApiUrl}/input-evidences`,
  evidenceSearch: `${baseApiUrl}/input-evidences/search/findByirid`,
  recordInputs: `${baseApiUrl}/record-input`,
  requestInputs: `${baseApiUrl}/req-input`,
  responseInputs: `${baseApiUrl}/response-ir-input`,
  irInvestigation: `${baseApiUrl}/ir-investigation`,

  serverDateTime: `${baseApiUrl}/getserverdatetime`,

  rcaRootCauses: `${baseApiUrl}/rca-rootcause`,
  rcaIdentified: `${baseApiUrl}/rca-identified`,
  rcaTeam: `${baseApiUrl}/rca-team`,
  capaPlan: `${baseApiUrl}/capaplan`,
  capaMonitoringPlan: `${baseApiUrl}/capa-monitoringplan`,
};
