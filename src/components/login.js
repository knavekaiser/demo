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
import { appConfig, endpoints as defaultEndpoints } from "../config";
import paths from "./path";

export default function Login() {
  const { user, setUser, setEndpoints, his, setHis } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { get: getUserDetail } = useFetch(
    defaultEndpoints.searchUserByUsername
  );
  const { get: getEndpoints } = useFetch(defaultEndpoints.apiUrl);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
  }, []);
  return (
    <div className={s.login} data-testid="login">
      <img src="/asset/new_login_img.jpg" />
      <div className={s.formWrapper}>
        <img src="/asset/logo.jpg" />
        <form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            let token = sessionStorage.getItem("access-token");

            if (!token) {
              await fetch(`${defaultEndpoints.token}`, {
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
              })
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

              // const user = await fetch(
              //   `${endpoints.users.url}?userName=${data.username}&status=1`,
              //   {
              //     method: "GET",
              //     headers: {
              //       DNT: null,
              //       "x-auth-token": sessionStorage.getItem("HIS-access-token"),
              //       "x-tenantid": sessionStorage.getItem("tenant-id"),
              //       "x-timezone": sessionStorage.getItem("tenant-timezone"),
              //       "Content-Type": "application/json",
              //     },
              //   }
              // )
              //   .then((res) => res.json())
              //   .then((data) =>
              //     data?.userViewList ? data.userViewList[0] : null
              //   )
              //   .catch((err) => {
              //     setLoading(false);
              //     return Prompt({
              //       type: "error",
              //       message: "Could not get user data. Please try again.",
              //     });
              //   });

              const user = await fetch(
                `${endpoints.users.url}?userName=${data.username}&status=1`,
                {
                  method: "GET",
                  headers: {
                    DNT: null,
                    "x-auth-token": sessionStorage.getItem("HIS-access-token"),
                    "x-tenantid": sessionStorage.getItem("tenant-id"),
                    "x-timezone": sessionStorage.getItem("tenant-timezone"),
                    "Content-Type": "application/json",
                  },
                }
              )
                .then((res) => res.json())
                .then((data) => data?.[endpoints.users.key1]?.[0] || null)
                .catch((err) => {
                  setLoading(false);
                  return Prompt({
                    type: "error",
                    message: "Could not get user data. Please try again.",
                  });
                });

              // console.log({ endpoints });

              if (!user) {
                // sessionStorage.removeItem("HIS-access-token");
                setLoading(false);
                return Prompt({
                  type: "error",
                  message: "Could not log in. Please try again.",
                });
              }

              const userDetail = await getUserDetail(null, {
                query: { username: data.username },
              }).then((user) =>
                user
                  ? {
                      ...user,
                      role: user.role.split(",").filter((role) => role),
                    }
                  : null
              );

              // const users = await fetch(defaultEndpoints.users + "?size=10000")
              //   .then((res) => res.json())
              //   .then((users) =>
              //     (users?._embedded?.user || []).map((user) => ({
              //       ...user,
              //       role: user.role.split(","),
              //     }))
              //   )
              //   .catch((err) => console.log(err));
              //
              // const userDetail = await users.find(
              //   (user) => user.name === data.username
              // );
              // console.log({ users, userDetail });

              if (!userDetail) {
                setLoading(false);
                return Prompt({
                  type: "error",
                  message:
                    "Please make sure that the logged in user is added in the Users master.",
                });
              }

              setEndpoints(endpoints);
              setUser({
                ...userDetail,
                ...user,
              });
              navigate(paths.incidentReport);
            } else {
              const _user = await getUserDetail(null, {
                query: { username: data.username },
              }).then((user) => {
                console.log(user);
                return user
                  ? {
                      ...user,
                      role: user.role.split(",").filter((role) => role),
                    }
                  : null;
              });

              // const users = await fetch(defaultEndpoints.users + "?size=10000")
              //   .then((res) => res.json())
              //   .then((users) =>
              //     (users?._embedded?.user || []).map((user) => ({
              //       ...user,
              //       role: user.role.split(","),
              //     }))
              //   )
              //   .catch((err) => console.log(err));
              //
              // const _user = await users.find(
              //   (user) => user.name === data.username
              // );

              if (_user) {
                setUser(_user);
                navigate(paths.incidentReport);
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
          <button className="btn w-100">Sign in</button>
        </form>
      </div>
    </div>
  );
}
