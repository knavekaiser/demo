const endpoints = {
  locations: {
    url: "",
    key1: "",
    key2: "",
    key3: "",
  },
  departments: {
    url:
      "https://hisir.napierhealthcare.com:9876/napier-nh-api/api/v1/service/security/department",
    key1: "dataBean",
    key2: "",
    key3: "",
  },
  users: {
    url:
      "https://hisir.napierhealthcare.com:9876/napier-nh-api/api/v1/service/integration/users",
    key1: "dataBean",
    key2: "",
    key3: "",
  },
  logout: {
    url:
      "https://hisir.napierhealthcare.com:7654/napier-his-web/Integration/loginService/logout",
    key1: "",
    key2: "",
    key3: "",
  },
  discardSession: {
    url: "",
    key1: "dataBean",
    key2: "",
    key3: "",
  },
  getSalt: {
    url: "",
    key1: "",
    key2: "",
    key3: "",
  },
  login: {
    url:
      "https://hisir.napierhealthcare.com:9876/napier-nh-api/api/v1/service/security/authentication/login",
    key1: "",
    key2: "",
    key3: "",
  },
  tenantValidation: {
    url:
      "https://hisir.napierhealthcare.com:9876/napier-nh-api/api/v1/service/tenant/validateTenant/SG_DC_RC",
    key1: "dataBean",
    key2: "",
    key3: "",
  },
};

export default endpoints;
