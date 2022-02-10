import { useEffect, useContext, useState, useCallback } from "react";
import { SiteContext } from "../SiteContext";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  createSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "./elements";
import { Prompt } from "./modal";
import { loadScript } from "../helpers";
import bcrypt from "bcryptjs";
import s from "./login.module.scss";
import paths from "./path";

import { appConfig } from "../config";

// const setupLogin = async () => {
//   await loadScript("/js/jquery-1.11.3.min.js");
//   var isChrome =
//     /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
//   /*if(!isChrome){
// window.location.href = 'error.html';
// }*/
//   if (window.top != window.self) {
//     window.top.location = window.self.location;
//   }
//
//   var href = window.location.href;
//   var url = new URL(href);
//   // var reg = new RegExp( '[?&]' +"env"+ '=([^&#]*)', 'i' );
//   // var customer = reg.exec(href);
//   var customer = url.searchParams.get("env");
//   if (customer == null) {
//     navigate({
//       pathname: location.pathname,
//       search: `?${createSearchParams({ env: "Tenant1" })}`,
//     });
//     // window.top.location.href = window.top.location.href + "?env=Tenant1";
//     //customer="";
//     url = new URL(window.location.href);
//     customer = url.searchParams.get("env");
//   }
//   var swfVersionStr = "10.0.0";
//   var xiSwfUrlStr = "";
//   var flashvars = {};
//   var params = {};
//   params.quality = "high";
//   params.bgcolor = "#25557d";
//   params.allowscriptaccess = "sameDomain";
//   params.allowfullscreen = "true";
//   var attributes = {};
//   attributes.id = "CryptoPlugin";
//   attributes.name = "CryptoPlugin";
//   attributes.align = "middle";
//
//   await loadScript("/js/Base64.js");
//   await loadScript("/js/bCrypt.js");
//   await loadScript("/js/sec.js");
//   await loadScript("/js/sjcl.js");
//
//   const $ = window.$;
//   const gensalt = window.gensalt;
//   const hashpw = window.hashpw;
//
//   // function RemoveSavePassword() {
//   //   inputValue = $(".real-input").val();
//   //   numChars = inputValue.length;
//   //   showText = "";
//   //
//   //   for (i = 0; i < numChars; i++) {
//   //     showText += "&#8226;";
//   //   }
//   //
//   //   $(".masked-input").html(showText);
//   // }
//
//   if (sessionStorage) {
//     sessionStorage.clear();
//   }
//   const NAPIER = {};
//   NAPIER.config = {};
//   NAPIER.config.AppConfig = {};
//
//   function showMessage(text) {
//     alert(`Message: ${text}`);
//   }
//
//   function dropData(uid, pwd, rawPwd) {
//     var ddList = $("#ddlGender").val();
//     if (ddList == "0") {
//       showMessage("Please select facilities");
//     } else {
//       authenticateUser(uid, pwd, rawPwd);
//     }
//   }
//
//   var newHash = "";
//   function doLogin() {
//     crypt("user@2", 0, doLoginCallback);
//   }
//
//   function doSSOLogin() {
//     document.cookie =
//       "JSESSIONID=; Path=/napier-his-web; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
//     localStorage.clear();
//     sessionStorage.clear();
//     doClear();
//     window.location.href = "samlLogin.html";
//   }
//
//   function doLoginCallback() {
//     var uid = "yashtech",
//       pwd = newHash; //pwd = $("#password").val()
//     var rawPwd = "user@2"; //$("#password").val();
//     if (uid && pwd) {
//       dropData(uid, pwd, rawPwd);
//     } else {
//       showMessage("Please enter User name and Password");
//     }
//   }
//
//   function doClear() {
//     $("#username").val("");
//     $("#password").val("");
//   }
//
//   function getSalt() {
//     var userNameValue = "yashtech"; //$("#username").val();
//     var workingDataJson =
//       '{"com.napier.core.services.HITService":{"operation":"getSaltCode","messageId":"","destination":"securityService","message":{"@class":"com.napier.core.service.vo.security.User","username":"' +
//       userNameValue.trim() +
//       '"},"context":{"contextList":[{"com.napier.core.context.ContextElement":[{"attrName":"com.napier.core.context.ExecutionContext#SECURITY_TOKEN","attrValue":{"@class":"string","$":""}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID","attrValue":{"@class":"string","$":' +
//       NAPIER.config.AppConfig.login_FACILITY_ID +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_REF_ID","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_CLIENT_REF_ID +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#USER_SEQ_ID","attrValue":{"@class":"long","$":' +
//       NAPIER.config.AppConfig.login_USER_SEQ_ID +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#WORKSTATION","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_WORKSTATION +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID_DESC","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_FACILITY_ID_DESC +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_DATE","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_CLIENT_DATE +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#LOGIN_NAME","attrValue":{"@class":"string","$":"' +
//       userNameValue +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#APP_CONTEXT","attrValue":{"@class":"string","$":"' +
//       customer +
//       '"}}]}]}}}';
//
//     $.ajax({
//       url:
//         "https://hisir.napierhealthcare.com:7654/napier-his-web/Integration/loginService/getSaltCode?userid=rjsnaveen",
//       method: "POST",
//       // data: workingDataJson,
//       contentType: "text/html; charset=utf-8",
//       success: function (data) {
//         var response = JSON.parse(data);
//         if (
//           response.HITService.message &&
//           response.HITService.message.password
//         ) {
//           var salt_code = response.HITService.message.password.substring(0, 29);
//           sessionStorage.setItem("salt_code", salt_code);
//         } else {
//           sessionStorage.removeItem("salt_code");
//         }
//       },
//     });
//   }
//
//   function dropList(userNameValue, passValue, rawpassValue) {
//     console.log("----------------running dropList------------------");
//     var workingDataJson =
//       '{"com.napier.core.services.HITService":{"operation":"preLogin","messageId":"","destination":"securityService","message":{"@class":"com.napier.core.service.vo.security.AuthenticationRequest","userName":"' +
//       userNameValue.trim() +
//       '","passWord":"' +
//       passValue.trim() +
//       '","authenticationType":1,"isLDAPEnable":"Y"},"context":{"contextList":[{"com.napier.core.context.ContextElement":[{"attrName":"com.napier.core.context.ExecutionContext#SECURITY_TOKEN","attrValue":{"@class":"string","$":""}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID","attrValue":{"@class":"string","$":' +
//       NAPIER.config.AppConfig.login_FACILITY_ID +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_REF_ID","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_CLIENT_REF_ID +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#USER_SEQ_ID","attrValue":{"@class":"long","$":' +
//       NAPIER.config.AppConfig.login_USER_SEQ_ID +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#WORKSTATION","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_WORKSTATION +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID_DESC","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_FACILITY_ID_DESC +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_DATE","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_CLIENT_DATE +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#LOGIN_NAME","attrValue":{"@class":"string","$":"' +
//       userNameValue +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#APP_CONTEXT","attrValue":{"@class":"string","$":"' +
//       customer +
//       '"}}]}]}}}';
//
//     $.ajax({
//       url:
//         "https://hisir.napierhealthcare.com:7654/napier-his-web/HISServices/securityService",
//       method: "POST",
//       data: workingDataJson,
//       contentType: "text/html; charset=utf-8",
//       success: function (data) {
//         var response = JSON.parse(data);
//         //console.log(response);
//         console.log("response from /HISServices/securityService", response);
//
//         if (response.HITService && response.HITService.message) {
//           if (
//             response.HITService.message.responseCode == 1025 ||
//             response.HITService.message.responseCode == 1101 ||
//             response.HITService.message.responseCode == 1094
//           ) {
//             showMessage(response.HITService.message.responseMessage);
//           } else if (
//             response.HITService.message.responseMessage &&
//             response.HITService.message.authenticatedAndValidSession == false &&
//             response.HITService.message.authenticate == false
//           ) {
//             showMessage("Invalid Credentials or Facility not Available");
//           } else {
//             sessionStorage.setItem(
//               "appConfig",
//               JSON.stringify(NAPIER.config.AppConfig)
//             );
//             sessionStorage.setItem("rawUserName", userNameValue);
//             //sessionStorage.setItem('rawUserPwd', rawpassValue);
//             //sessionStorage.setItem('rawUserPwd', passValue);
//             sessionStorage.setItem("rawloginResponse", data);
//             sessionStorage.setItem(
//               "imagepath",
//               response.HITService.context.contextList[0][
//                 "com.napier.core.context.ContextElement"
//               ][11]
//                 ? response.HITService.context.contextList[0][
//                     "com.napier.core.context.ContextElement"
//                   ][11].attrValue
//                 : ""
//             );
//             sessionStorage.setItem(
//               "facilityCode",
//               response.HITService.message.facilitiesList[0][
//                 "com.napier.core.service.vo.masters.FacilityMaster"
//               ].code
//             );
//             sessionStorage.setItem(
//               "facilityDesc",
//               response.HITService.message.facilitiesList[0][
//                 "com.napier.core.service.vo.masters.FacilityMaster"
//               ].description
//             );
//             var optStr =
//               "width=" +
//               window.screen.availWidth +
//               ",height=" +
//               (window.screen.availHeight - 60) +
//               ",left=0,top=0";
//           }
//         } else {
//           showMessage("Login Failed, Please contact administrator");
//           return;
//         }
//
//         $("#ddlGender").get(0).options.length = 0;
//
//         var facilities = response.HITService.message.facilitiesList;
//         var item1 = "com.napier.core.service.vo.masters.FacilityMaster";
//         var fac = facilities[0][item1];
//
//         if (fac.length > 1) {
//           for (var i = 0; i < fac.length; i++) {
//             var addItems = fac[i].code + " " + fac[i].facilityId;
//             if (fac[i].code)
//               $("#ddlGender").get(0).options[
//                 $("#ddlGender").get(0).options.length
//               ] = new Option(fac[i].description, addItems);
//             var x = document.createElement("input");
//             x.setAttribute("type", "hidden");
//             x.setAttribute("id", "code");
//             x.setAttribute("value", fac[i].code);
//             document.getElementById("hidden").append(x);
//             var y = document.createElement("input");
//             y.setAttribute("type", "hidden");
//             y.setAttribute("id", "facilityId");
//             y.setAttribute("value", fac[i].facilityId);
//             document.getElementById("hidden").append(y);
//             //  }
//           }
//         } else {
//           var addItems = fac.code + " " + fac.facilityId;
//           if (fac.code)
//             $("#ddlGender").get(0).options[
//               $("#ddlGender").get(0).options.length
//             ] = new Option(fac.description, addItems);
//           var x = document.createElement("input");
//           x.setAttribute("type", "hidden");
//           x.setAttribute("id", "code");
//           x.setAttribute("value", fac.code);
//           document.getElementById("hidden").append(x);
//           var y = document.createElement("input");
//           y.setAttribute("type", "hidden");
//           y.setAttribute("id", "facilityId");
//           y.setAttribute("value", fac.facilityId);
//           document.getElementById("hidden").append(y);
//         }
//       },
//     });
//   }
//
//   $.ajax({
//     url:
//       "https://hisir.napierhealthcare.com:7654/napier-his-web/ClientInformation?config=json",
//     success: function (data) {
//       console.log(data);
//       const baseString = window.sec.cryptDecode(data);
//       //baseString = Base64.decode(data),
//       const appconfigData = JSON.parse(baseString);
//       NAPIER.config.AppConfig = appconfigData.configdata;
//       $.ajax({
//         url: "ClientInformation?format=js",
//         success: function (data) {
//           eval(data);
//           NAPIER.config.AppConfig.login_WORKSTATION =
//             NAPIER.clientInfo.machineIP;
//           NAPIER.config.AppConfig.completed = true;
//           NAPIER.config.AppConfig.serviceURL =
//             location.protocol +
//             "//" +
//             location.hostname +
//             ":" +
//             location.port +
//             "/" +
//             NAPIER.config.AppConfig.serviceURL;
//           NAPIER.config.AppConfig.pdfServletURL =
//             location.protocol +
//             "//" +
//             location.hostname +
//             ":" +
//             location.port +
//             "/" +
//             NAPIER.config.AppConfig.pdfServletURL;
//           if (callInQueue) {
//             callInQueue();
//             callInQueue = null;
//           }
//         },
//       });
//     },
//   });
//   var facilityId = "";
//   var clientRefId = "";
//
//   function authenticateUser(userNameValue, passValue, rawpassValue) {
//     const ddlGender = {};
//     // console.log(ddlGender.selectedIndex + "ddlGender.selectedIndex");
//     var facilityInfo = "";
//     var facilityName = "";
//     if (ddlGender.selectedIndex != -1) {
//       facilityInfo = ddlGender.options[ddlGender.selectedIndex].value;
//       facilityName = ddlGender.options[ddlGender.selectedIndex].text;
//     } else if (getURLParameters("userobj")) {
//     } else {
//       return false;
//     }
//     if (facilityInfo != "") {
//       facilityInfo = facilityInfo.split(" ");
//       facilityId = facilityInfo[0];
//       clientRefId = facilityInfo[1];
//     }
//     var workingDataJson =
//       '{"com.napier.core.services.HITService":{"operation":"login","messageId":"","destination":"securityService","message":{"@class":"com.napier.core.service.vo.security.AuthenticationRequest","userName":"' +
//       userNameValue.trim() +
//       '","passWord":"' +
//       passValue.trim() +
//       '","authenticationType":1,"isLDAPEnable":"Y"},"context":{"contextList":[{"com.napier.core.context.ContextElement":[{"attrName":"com.napier.core.context.ExecutionContext#SECURITY_TOKEN","attrValue":{"@class":"string","$":""}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID","attrValue":{"@class":"string","$":' +
//       facilityId +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_REF_ID","attrValue":{"@class":"string","$":"' +
//       clientRefId +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#USER_SEQ_ID","attrValue":{"@class":"long","$":' +
//       NAPIER.config.AppConfig.login_USER_SEQ_ID +
//       '}},{"attrName":"com.napier.core.context.ExecutionContext#WORKSTATION","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_WORKSTATION +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#FACILITY_ID_DESC","attrValue":{"@class":"string","$":"' +
//       facilityName +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#CLIENT_DATE","attrValue":{"@class":"string","$":"' +
//       NAPIER.config.AppConfig.login_CLIENT_DATE +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#LOGIN_NAME","attrValue":{"@class":"string","$":"' +
//       userNameValue +
//       '"}},{"attrName":"com.napier.core.context.ExecutionContext#APP_CONTEXT","attrValue":{"@class":"string","$":"' +
//       customer +
//       '"}}]}]}}}';
//     $.ajax({
//       url: "HISServices/securityService",
//       method: "POST",
//       data: workingDataJson,
//       contentType: "text/html; charset=utf-8",
//       success: function (data) {
//         var response = JSON.parse(data);
//         console.log("response from HISServices/securityService", response);
//         if (response.HITService.context != undefined) {
//           var contextData =
//             response.HITService.context.contextList[0][
//               "com.napier.core.context.ContextElement"
//             ];
//           var responseXSRFTOKEN = "";
//           for (var i = 0; i < contextData.length; i++) {
//             if (
//               contextData[i].attrName ==
//               "com.napier.core.context.ExecutionContext#XSRF_TOKEN"
//             ) {
//               responseXSRFTOKEN = contextData[i].attrValue;
//             }
//           }
//           sessionStorage.setItem("responseXSRFTOKEN", responseXSRFTOKEN);
//         }
//
//         if (response.HITService && response.HITService.message) {
//           if (
//             response.HITService.message.responseCode == 1025 ||
//             response.HITService.message.responseCode == 1101
//           ) {
//             showMessage(response.HITService.message.responseMessage);
//           } else if (response.HITService.message.errorCode) {
//             showMessage(response.HITService.message.errorMessage);
//           } else {
//             //Setting Data In AppConfig Session Storage From Langauge DropDown
//             var sessionAppConfig = NAPIER.config.AppConfig;
//             sessionAppConfig.locale = $("#loginLang").val();
//
//             // Added code for HSC-ARC
//             sessionAppConfig.projectSpecificDeployment = $("#loginMorph").val();
//             sessionStorage.setItem(
//               "productCustomization",
//               sessionAppConfig.projectSpecificDeployment
//             );
//             sessionStorage.setItem("facilityCode", facilityId);
//             sessionStorage.setItem("facilityDesc", facilityName);
//             sessionStorage.setItem("rawUserName", userNameValue);
//             // sessionStorage.setItem('rawUserPwd', rawpassValue);
//             sessionStorage.setItem("appContext", customer);
//             sessionStorage.setItem("rawloginResponse", data);
//             // appconfigData.configdata.login_FACILITY_ID = facilityId;
//             // appconfigData.configdata.login_FACILITY_ID_DESC = facilityName;
//             // appconfigData.configdata.login_CLIENT_REF_ID = clientRefId;
//             sessionStorage.setItem(
//               "appConfig",
//               JSON.stringify(sessionAppConfig)
//             );
//             var optStr =
//               "width=" +
//               window.screen.availWidth +
//               ",height=" +
//               (window.screen.availHeight - 60) +
//               ",left=0,top=0";
//             //window.location.href = 'app.html';
//             //window.location.href = 'dashboard.html';
//             window.location.href = "his-web-ui/dist/index.html#/login";
//             doClear();
//           }
//         } else {
//           showMessage("Login Failed, Please contact administrator");
//         }
//       },
//     });
//   }
//
//   function validData() {
//     // hash raw pwd and set return value to 'newHash' varibale
//     console.log("----------------validData------------------");
//     crypt($("#password").val(), 0, function () {
//       var userNameValue = $("#username").val(),
//         passValue = newHash,
//         rawPwd2 = $("#password").val();
//       if (userNameValue && passValue) {
//         dropList(userNameValue, passValue, rawPwd2);
//       }
//     });
//   }
//
//   function validateLogin(userNameValue, passValue) {
//     if (!NAPIER.config.AppConfig.completed) {
//       callInQueue = function () {
//         authenticateUser(userNameValue, passValue, passValue);
//       };
//     } else {
//       authenticateUser(userNameValue, passValue, passValue);
//     }
//   }
//   var callInQueue = null;
//
//   $("#login_submit_frm").on("click", doLogin);
//   $("#login_sso_frm").on("click", doSSOLogin);
//
//   $("#login_clear_frm").on("click", doClear);
//
//   function getURLParameters(paramName) {
//     console.log("paramName" + paramName);
//
//     var sURL = window.document.URL.toString();
//     if (sURL.indexOf("?") > 0) {
//       var arrParams = sURL.split("?");
//       var arrURLParams = arrParams[1].split("&");
//       var arrParamNames = new Array(arrURLParams.length);
//       var arrParamValues = new Array(arrURLParams.length);
//
//       var i = 0;
//       for (i = 0; i < arrURLParams.length; i++) {
//         var sParam = arrURLParams[i].split("=");
//         arrParamNames[i] = sParam[0];
//         if (sParam[1] != "") arrParamValues[i] = unescape(sParam[1]);
//         else arrParamValues[i] = null;
//       }
//
//       for (i = 0; i < arrURLParams.length; i++) {
//         if (arrParamNames[i] == paramName) {
//           return arrParamValues[i];
//         }
//       }
//       return null;
//     }
//   }
//   if (getURLParameters("userobj")) {
//     var usrobj = localStorage.getItem("userobj")
//       ? JSON.parse(localStorage.getItem("userobj"))
//       : null;
//     var usrContext = sessionStorage.getItem("userContextObj")
//       ? JSON.parse(sessionStorage.getItem("userContextObj"))
//       : null;
//     console.log(usrContext + "usrContext");
//     sessionStorage.setItem("isNewWindow", true);
//     $("body").addClass("bodyblock");
//     setTimeout(function () {
//       if (usrobj) {
//         facilityId = usrobj.FACILITY_ID;
//         clientRefId = usrobj.CLIENT_REF_ID;
//         authenticateUser(usrobj.username, usrobj.password, usrobj.password);
//       }
//     }, 5000);
//   } else {
//     localStorage.clear();
//   }
//
//   /*------------------ to display text as password ------------*/
//   // var x = document.getElementById("password");
//   // if (x.type === "password") {
//   //   x.type = "text";
//   // } else {
//   //   x.type = "text";
//   // }
//   /*------------------ to display text as password ------------*/
//
//   var gCallbackFn;
//   var hashSetFn = function (hash) {
//     newHash = hash;
//     gCallbackFn();
//   };
//   var progressFn = function () {
//     // Required in case of shoing progress % for hashing
//   };
//
//   function crypt(rawPwd, flag, callbackFn) {
//     //var salt = "$2a$08$b0MHMsT3ErLoTRjpjzsCie";
//     var salt = "";
//     var roundsVal = 8;
//     if (flag == 1) {
//       salt = gensalt(roundsVal);
//     } else {
//       salt = sessionStorage.getItem("salt_code");
//     }
//     if (salt == null) {
//       showMessage("Invalid credentials.");
//       return;
//     }
//     // console.log(salt);
//     gCallbackFn = callbackFn;
//
//     /*try {
//       salt = gensalt(roundsVal);
//     } catch (err) {
//       alert(err);
//       return;
//     }*/
//     console.log("this is the salt ", salt);
//     try {
//       hashpw(rawPwd, "5", hashSetFn, progressFn);
//     } catch (err) {
//       console.log("hashpw err", err);
//       alert(err);
//       return;
//     }
//   }
//   // if (customer) {
//   //   document.getElementById("logo").src =
//   //     "resources/images/" + customer + ".png";
//   // }
//
//   sessionStorage.setItem("salt_code", "user@2");
//
//   // getSalt();
//
//   fetch(
//     "https://hisir.napierhealthcare.com:7654/napier-his-web/Integration/loginService/getSaltCode?userid=rjsnaveen"
//   )
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("salt ", data);
//     });
//
//   setTimeout(() => {
//     console.log("login in");
//     doLogin();
//   }, 3000);
// };

export default function Login() {
  const { user, setUser } = useContext(SiteContext);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    // setupLogin();
    if (user) {
      navigate("/");
      return;
    }
    fetch(`${process.env.REACT_APP_HOST}/user`)
      .then((res) => res.json())
      .then((users) => {
        if (users._embedded.user) {
          setUsers(
            users._embedded.user.map((user) => ({
              ...user,
              role: user.role.split(",").filter((r) => r),
            }))
          );
        }
      })
      .catch((err) => {
        Prompt({ type: "error", message: err.message });
      });
  }, []);
  return (
    <div className={s.login}>
      <img src="/asset/new_login_img.jpg" />
      <div className={s.formWrapper}>
        <img src="/asset/logo.jpg" />
        <form
          onSubmit={handleSubmit(async (data) => {
            // const salt = await fetch(
            //   `${appConfig.orgUrl}/loginService/getSaltCode?userid=${data.email}`
            // )
            //   .then((res) => res.json())
            //   .then((data) => data?.password)
            //   .catch((err) => {
            //     console.log(err);
            //   });
            // if (!salt) {
            //   return Prompt({
            //     type: "error",
            //     message: "Could not load salt. Please try again.",
            //   });
            // }
            // const hash = bcrypt.hashSync(data.password, salt);
            // const token = await fetch(
            //   `${appConfig.orgUrl}/loginService/login`,
            //   {
            //     method: "POST",
            //     headers: { "Content-type": "application/json" },
            //     body: JSON.stringify({
            //       userName: data.email,
            //       passWord: hash,
            //       authenticationType: 1,
            //       authPassword: "",
            //       isLDAPEnable: "Y",
            //     }),
            //   }
            // )
            //   .then((res) => res.json())
            //   .then((data) => data?.tokenID)
            //   .catch((err) => {
            //     console.log(err);
            //   });
            // if (!token) {
            //   return Prompt({
            //     type: "error",
            //     message: "Could not load Token. Please try again.",
            //   });
            // }
            //
            // fetch(`${appConfig.orgUrl}/userMasterService/getAllLocations`, {
            //   method: "GET",
            //   headers: { SECURITY_TOKEN: token },
            // })
            //   .then((res) => res.json())
            //   .then((data) => {
            //     console.log(data);
            //   })
            //   .catch((err) => {
            //     console.error(err);
            //     return Prompt({
            //       type: "error",
            //       message: "Could not get user data. Please try again.",
            //     });
            //   });

            const _user = users.find(
              (u) => u.email === data.email && u.password === data.password
            );
            if (_user) {
              setUser(_user);
              navigate(paths.incidentReport);
            } else {
              Prompt({
                type: "error",
                message: "Invalid credentials.",
              });
            }
          })}
        >
          <h1>Sign In</h1>
          <Input
            label="Email"
            {...register("email", {
              required: "Plase provide an email address",
              // pattern: {
              //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              //   message: "Invalid email address",
              // },
            })}
            error={errors.email}
          />
          <Input
            type="password"
            label="Password"
            {...register("password", {
              required: "Plase enter your password",
            })}
            error={errors.password}
          />
          <button className="btn w-100">Sign in</button>
        </form>
      </div>
    </div>
  );
}
