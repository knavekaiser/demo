import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { Prompt } from "../components/modal";

export const useHisFetch = (url) => {
  const { logout } = useContext(SiteContext);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const controller = useRef();

  useEffect(() => {
    controller.current = new AbortController();

    return () => {
      controller.current.abort();
      setError(false);
      // setLoading(false);
    };
  }, [url]);

  const onSubmit = useCallback(
    async (payload = {}, method) => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          method: method,
          headers: { SECURITY_TOKEN: sessionStorage.getItem("token") },
          ...(["POST", "PUT", "PATCH", "DELETE"].includes(method) && {
            body: JSON.stringify(payload),
          }),
          signal: controller.current.signal,
        })
          .then((res) => res.json())
          .catch((err) => {
            throw err;
          });

        if (response?.errorMessage) {
          if (response.errorMessage === "Invalid Token") {
            return Prompt({
              type: "error",
              message: "Session expired. Please log in again.",
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

  const post = (payload) => onSubmit(payload, "POST");

  const get = (payload) => onSubmit(payload, "GET");

  const remove = (payload) => onSubmit(payload, "DELETE");

  const put = (payload) => onSubmit(payload, "PUT");

  const patch = (payload) => onSubmit(payload, "PATCH");

  return { get, post, put, remove, patch, loading, error, onSubmit };
};

export default useHisFetch;
