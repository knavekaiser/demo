import { appConfig, incidentTypes, irStatus, permissions } from "./index";
import endpoints from "./endpoints";

test("App Config", () => {
  expect(appConfig.orgUrl).toEqual(
    "https://hisir.napierhealthcare.com:7654/napier-his-web/Integration"
  );
});

test("Endpoints", () => {
  expect(endpoints.departments).toMatch("department");
});
