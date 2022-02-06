import { useEffect, useContext, useState } from "react";
import { SiteContext } from "../SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "./elements";
import { Prompt } from "./modal";
import s from "./login.module.scss";
import paths from "./path";

export default function Login() {
  const { user, setUser } = useContext(SiteContext);
  const [users, setUsers] = useState([]);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  useEffect(() => {
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
          onSubmit={handleSubmit((data) => {
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
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
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
