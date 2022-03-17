import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Prompt } from "../components/modal";

export const useFetch = (url, { his, headers: hookHeaders } = {}) => {
  const { user, logout } = useContext(SiteContext);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const controller = useRef();
  useEffect(() => {
    controller.current = new AbortController();

    return () => {
      controller.current.abort();
      setError(false);
      setLoading(false);
    };
  }, [url]);

  const onSubmit = useCallback(
    async (payload = {}, method, { headers, params, query } = {}) => {
      let _url = url;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          _url = _url.replace(key, value);
        });
      }
      if (query) {
        _url += `${_url.includes("?") ? "" : "?"}&${new URLSearchParams(
          query
        ).toString()}`;
      }
      try {
        setLoading(true);
        const response = await fetch(_url, {
          method: method,
          headers: {
            ...(!his
              ? {
                  Authorization:
                    "Bearer " + sessionStorage.getItem("access-token"),
                  tenantId: sessionStorage.getItem("db-schema") || null,
                }
              : {
                  SECURITY_TOKEN: sessionStorage.getItem("HIS-access-token"),
                  FACILITY_ID: 1,
                  CLIENT_REF_ID: "Napier123",
                  "x-auth-token": sessionStorage.getItem("HIS-access-token"),
                  "x-tenantid": sessionStorage.getItem("tenant-id"),
                  "x-timezone": sessionStorage.getItem("tenant-timezone"),
                }),
            ...hookHeaders,
            ...headers,
          },
          ...(["POST", "PUT", "PATCH", "DELETE"].includes(method) && {
            body: JSON.stringify(payload),
          }),
          signal: controller.current.signal,
        })
          .then(async (res) => {
            const data = await res
              .json()
              .catch((err) => {})
              .finally(() => null);
            return {
              ...data,
              res,
              ...(data && Object.keys({ ...data }).length === 0 && data),
            };
          })
          .catch((err) => {
            throw err;
          });

        if (response?.errorMessage || response?.error) {
          if (
            ["Invalid Token", "Token validation failed"].includes(
              response.errorMessage
            ) ||
            ["invalid_token"].includes(response.error)
          ) {
            sessionStorage.removeItem("access-token");
            sessionStorage.removeItem("HIS-access-token");
            return Prompt({
              type: "error",
              message: `${user.name} is logged in from another device. Please log in again.`,
              callback: logout,
            });
          }
          throw new Error(response.errorMessage);
        } else {
          return response;
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  const post = (payload, options) => onSubmit(payload, "POST", options);

  const get = (payload, options) => onSubmit(payload, "GET", options);

  const remove = (payload, options) => onSubmit(payload, "DELETE", options);

  const put = (payload, options) => onSubmit(payload, "PUT", options);

  const patch = (payload, options) => onSubmit(payload, "PATCH", options);

  return { get, post, put, remove, patch, loading, error, onSubmit };
};

export default useFetch;
