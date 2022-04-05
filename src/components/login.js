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
import { Input, Checkbox } from "./elements";
import { Prompt } from "./modal";
import bcrypt from "bcryptjs";
import s from "./login.module.scss";
import { useFetch } from "../hooks";
import { appConfig, endpoints as defaultEndpoints, paths } from "../config";
// import hisEndpoints from "../config/hisEndpoints.js";
import jwt_decode from "jwt-decode";

export default function Login() {
  const { user, setUser, setEndpoints, his, setHis } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { get: getUserDetail } = useFetch(
    defaultEndpoints.searchUserByUsername
  );
  const { get: getEndpoints } = useFetch(defaultEndpoints.apiUrl);

  const handleUser = useCallback(
    (user) => {
      setUser(user);
      if (
        location.state?.lastLocation &&
        location.state.lastLocation.pathname !== "/login"
      ) {
        navigate({
          pathname: location.state.lastLocation.pathname,
          search: location.state.lastLocation.search,
          replace: true,
        });
      } else {
        navigate(paths.incidentReport, { replace: true });
      }
    },
    [location.state]
  );

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const accessToken = sessionStorage.getItem("access-token");
    const hisAccessToken = sessionStorage.getItem("HIS-access-token");
    if (accessToken) {
      var decoded = jwt_decode(accessToken);
      if (decoded && new Date() > new Date(decoded.exp)) {
        getUserDetail(null, {
          query: { username: decoded.user_name },
        }).then(async (user) => {
          if (user) {
            if (hisAccessToken) {
              setHis(true);
              const endpoints = await getEndpoints()
                .then((data) => {
                  const _urls = {};
                  if (data._embedded.apiurls) {
                    data._embedded.apiurls.forEach((url) => {
                      _urls[url.action] = url;
                    });
                    return _urls;
                  }
                  return null;
                })
                .catch((err) =>
                  Prompt({ type: "error", message: err.message })
                );

              setEndpoints(endpoints);
            }
            handleUser({
              ...user,
              role: user.role.split(",").filter((role) => role),
            });
          }
        });
      }
    }
    if (user) {
      navigate("/");
      return;
    }
    if (new URLSearchParams(location.search).get("tenantId")) {
      sessionStorage.setItem(
        "db-schema",
        new URLSearchParams(location.search).get("tenantId")
      );
    }
  }, []);
  return (
    <div className={s.login} data-testid="login">
      <img src="/asset/new_login_img.jpg" />
      <div className={s.formWrapper}>
        <img src="/asset/logo.jpg" />
        <form
          onSubmit={handleSubmit(async (data) => {
            if (!new URLSearchParams(location.search).get("tenantId")) {
              return Prompt({
                type: "error",
                message: "No Tenant ID found",
              });
            }

            setLoading(true);
            let token = sessionStorage.getItem("access-token");

            if (!token) {
              await fetch(
                `${defaultEndpoints.token}?tenantId=${sessionStorage.getItem(
                  "db-schema"
                )}`,
                {
                  method: "POST",
                  headers: {
                    Authorization:
                      "Basic " +
                      Buffer.from(`napier:my-secret-key`).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    grant_type: "password",
                    username: data.username,
                    password: data.password,
                  }).toString(),
                }
              )
                .then((res) => res.json())
                .then((data) => {
                  if (data.access_token) {
                    sessionStorage.setItem("access-token", data.access_token);
                  }
                })
                .catch((err) => {
                  setLoading(false);
                });
            }

            if (his) {
              let hisToken = sessionStorage.getItem("HIS-access-token");

              const endpoints = await getEndpoints()
                .then((data) => {
                  const _urls = {};
                  if (data._embedded.apiurls) {
                    data._embedded.apiurls.forEach((url) => {
                      _urls[url.action] = url;
                    });
                    return _urls;
                  }
                  return null;
                })
                .catch((err) => {
                  setLoading(false);
                  Prompt({ type: "error", message: err.message });
                });

              if (!endpoints || !Object.keys(endpoints).length) {
                setLoading(false);
                return Prompt({
                  type: "error",
                  message:
                    "Could not load HIS API endpoints. Please try again.",
                });
              }

              if (!hisToken) {
                let salt, hash;
                if (endpoints.getSalt?.url) {
                  salt = await fetch(
                    `${endpoints.getSalt.url}?userid=${data.username}`
                  )
                    .then((res) => res.json())
                    .then((data) => data?.password)
                    .catch((err) => {
                      setLoading(false);
                    });
                  if (!salt) {
                    setLoading(false);
                    return Prompt({
                      type: "error",
                      message: "Could not load salt. Please try again.",
                    });
                  }
                  hash = bcrypt.hashSync(data.password, salt);
                  await fetch(
                    `${endpoints.discardSession.url}?userId=${data.username}`
                  );
                }

                if (endpoints.tenantValidation?.url) {
                  const tenantDetail = await fetch(
                    endpoints.tenantValidation.url
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      const key1 = endpoints.tenantValidation.key1;
                      if (key1 && data[key1]) {
                        sessionStorage.setItem(
                          "tenant-id",
                          data[key1].tenant.tenantId
                        );
                        sessionStorage.setItem(
                          "tenant-timezone",
                          data[key1].locale.timeZone
                        );
                        return data[key1];
                      }
                    })
                    .catch((err) => {
                      return Prompt({
                        type: "error",
                        message: "Could not validate Tenant.",
                      });
                    });

                  if (!tenantDetail) {
                    return;
                  }
                }

                hisToken = await fetch(`${endpoints.login.url}`, {
                  method: "POST",
                  headers: {
                    "x-tenantid": sessionStorage.getItem("tenant-id"),
                    "x-timezone": sessionStorage.getItem("tenant-timezone"),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    username: data.username,
                    password: hash || data.password,
                    overrideSession: true,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    // console.log(data);
                    if (data.success) {
                      return data?.dataBean.token;
                    }
                    Prompt({
                      type: "error",
                      message: data.errorMessage,
                    });
                  })
                  .catch((err) => {
                    setLoading(false);
                  });
                if (hisToken) {
                  sessionStorage.setItem("HIS-access-token", hisToken);
                }
              }
              if (!hisToken) {
                setLoading(false);
                return Prompt({
                  type: "error",
                  message: "Could not load Token. Please try again.",
                });
              }

              const user = await getUserDetail(null, {
                query: { username: data.username },
              })
                .then((user) =>
                  user
                    ? {
                        ...user,
                        role: user.role.split(",").filter((role) => role),
                      }
                    : null
                )
                .catch((err) => {
                  setLoading(false);
                  Prompt({ type: "error", message: err.message });
                });

              if (!user) {
                setLoading(false);
                return Prompt({
                  type: "error",
                  message:
                    "Please make sure that the logged in user is added in the Users master.",
                });
              }

              setEndpoints(endpoints);

              handleUser(user);
            } else {
              const _user = await getUserDetail(null, {
                query: { username: data.username },
              }).then((user) => {
                return user
                  ? {
                      ...user,
                      role: user.role.split(",").filter((role) => role),
                    }
                  : null;
              });

              if (_user) {
                handleUser(_user);
              } else {
                setLoading(false);
                Prompt({
                  type: "error",
                  message: "Invalid credentials.",
                });
              }
            }
          })}
        >
          <h1>Sign In</h1>
          <section>
            <Checkbox
              label="Login with HIS"
              checked={his}
              onChange={(e) => setHis(e.target.checked)}
            />
          </section>
          <Input
            label={"Username"}
            {...register("username", {
              required: `Plase enter a Username`,
            })}
            error={errors.username}
          />
          <Input
            type="password"
            label="Password"
            {...register("password", {
              required: "Plase enter your password",
            })}
            error={errors.password}
          />
          <button className="btn wd-100">Sign in</button>
        </form>
      </div>
    </div>
  );
}
