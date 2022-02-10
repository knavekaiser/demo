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
            //   headers: {
            //
            //     SECURITY_TOKEN: token },
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
