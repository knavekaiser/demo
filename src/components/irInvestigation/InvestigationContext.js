import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { irStatus, endpoints as defaultEndpoints } from "../../config";
import { useFetch } from "../../hooks";
import { Prompt } from "../../components/modal";

export const InvestigationContext = createContext();
export const InvestigationProvider = ({ children }) => {
  const [ir, setIr] = useState({});

  const params = useParams();

  const { get: getIr } = useFetch(
    defaultEndpoints.incidentReport + "/" + params.irId
  );

  useEffect(() => {
    getIr().then(({ data }) => {
      if (data) {
        setIr({
          ...data,
          ...(data.irInvestigation.length && {
            irInvestigation: [
              {
                ...data.irInvestigation[0],
                events: data.irInvestigation[0].events.sort((a, b) =>
                  a.sequence > b.sequence ? 1 : -1
                ),
              },
            ],
          }),
        });
      }
    });
  }, []);
  return (
    <InvestigationContext.Provider
      value={{
        ir,
        setIr,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};
